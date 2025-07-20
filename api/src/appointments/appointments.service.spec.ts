import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

// Describimos el conjunto de pruebas para AppointmentsService
describe('AppointmentsService', () => {
  let service: AppointmentsService;
  // Declaramos los repositorios simulados para tener acceso a ellos en las pruebas
  let appointmentRepository: Repository<Appointment>;
  let userRepository: Repository<User>;

  // Antes de cada prueba, configuramos un módulo de NestJS exclusivo para testing.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        // Proveemos una simulación (mock) para el Repositorio de Appointment.
        // En lugar de la base de datos real, usaremos un objeto con funciones falsas.
        {
          provide: getRepositoryToken(Appointment),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        // Hacemos lo mismo para el Repositorio de User.
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    // Obtenemos las instancias del servicio y los repositorios simulados
    service = module.get<AppointmentsService>(AppointmentsService);
    appointmentRepository = module.get<Repository<Appointment>>(
      getRepositoryToken(Appointment),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // Después de cada prueba, limpiamos los mocks para que no interfieran entre sí.
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para el método `requestAppointment` ---
  describe('requestAppointment', () => {
    // PRUEBA 1: La validación de horario
    it('debería lanzar un error si la cita está fuera del horario permitido', async () => {
      const patient = new User();
      const appointmentDto = {
        doctorId: 'some-doctor-id',
        startTime: '2025-09-22T04:00:00.000Z', // 4 AM UTC, fuera de horario
      };

      // Simulamos que el doctor sí existe para que la prueba no falle por eso
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(new User());

      // Esperamos que la promesa sea rechazada con un BadRequestException
      await expect(
        service.requestAppointment(appointmentDto, patient),
      ).rejects.toThrow(BadRequestException);

      // Verificamos que el mensaje de error sea el correcto
      await expect(
        service.requestAppointment(appointmentDto, patient),
      ).rejects.toThrow(
        'Appointments are only allowed between 7:00-12:00 and 14:00-18:00.',
      );
    });

    // PRUEBA 2: La validación de disponibilidad
    it('debería lanzar un error si el horario ya está ocupado', async () => {
      const patient = new User();
      const appointmentDto = {
        doctorId: 'some-doctor-id',
        startTime: '2025-09-22T10:00:00.000Z', // 10 AM UTC, horario válido
      };

      // Simulamos que el doctor existe
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(new User());
      // ¡Simulamos que ya existe una cita en ese horario!
      jest.spyOn(appointmentRepository, 'findOne').mockResolvedValue(new Appointment());

      // Esperamos que la promesa sea rechazada con un ConflictException
      await expect(
        service.requestAppointment(appointmentDto, patient),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.requestAppointment(appointmentDto, patient),
      ).rejects.toThrow('This time slot is already booked.');
    });

    // PRUEBA 3: El caso de éxito
    it('debería crear la cita si todo es correcto', async () => {
      const patient = new User();
      const appointmentDto = {
        doctorId: 'some-doctor-id',
        startTime: '2025-09-22T10:00:00.000Z',
      };

      // Simulamos que el doctor existe y que NO hay citas existentes
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(new User());
      jest.spyOn(appointmentRepository, 'findOne').mockResolvedValue(null); // No se encontró cita
      
      // Simulamos lo que devuelven los métodos de creación y guardado
      const createdAppointment = new Appointment();
      jest.spyOn(appointmentRepository, 'create').mockReturnValue(createdAppointment);
      jest.spyOn(appointmentRepository, 'save').mockResolvedValue(createdAppointment);

      // Ejecutamos el método y esperamos que se resuelva sin errores
      const result = await service.requestAppointment(appointmentDto, patient);

      // Verificamos que el resultado sea el esperado
      expect(result).toBeInstanceOf(Appointment);
      // Verificamos que los métodos para guardar en la BD hayan sido llamados
      expect(appointmentRepository.create).toHaveBeenCalled();
      expect(appointmentRepository.save).toHaveBeenCalledWith(createdAppointment);
    });
  });
});
