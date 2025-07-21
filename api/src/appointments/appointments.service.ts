import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Procesa la solicitud de una nueva cita por parte de un paciente.
   * Aplica validaciones de horario permitido y disponibilidad del médico.
   * @param createDto - Datos para la creación de la cita (ID del médico y hora de inicio).
   * @param patient - El objeto del usuario paciente que realiza la solicitud.
   * @returns La nueva cita creada con estado PENDING_PAYMENT.
   */
  async requestAppointment(createDto: CreateAppointmentDto, patient: User) {
    const doctor = await this.userRepository.findOneBy({ id: createDto.doctorId, role: UserRole.DOCTOR });
    if (!doctor) {
      throw new BadRequestException('El médico especificado no fue encontrado.');
    }

    const appointmentTime = new Date(createDto.startTime);
    const appointmentHour = appointmentTime.getUTCHours();

    // REGLA DE NEGOCIO: La clínica solo atiende en dos bloques de horario UTC: de 7:00 a 12:00 y de 14:00 a 18:00.
    // Esta validación asegura que no se puedan agendar citas fuera de este rango.
    const isValidTime = (appointmentHour >= 7 && appointmentHour < 12) || (appointmentHour >= 14 && appointmentHour < 18);
    if (!isValidTime) {
      throw new BadRequestException('Las citas solo se permiten en el horario de 7:00-12:00 y 14:00-18:00.');
    }

    const endTime = new Date(appointmentTime.getTime() + 30 * 60 * 1000); // Se asumen citas de 30 minutos.

    // REGLA DE NEGOCIO: Se comprueba que no exista otra cita para el mismo médico que se solape en el tiempo.
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: createDto.doctorId },
        startTime: Between(appointmentTime, endTime),
      },
    });
    if (existingAppointment) {
      throw new ConflictException('Este horario ya se encuentra ocupado.');
    }

    const newAppointment = this.appointmentRepository.create({ patient, doctor, startTime: appointmentTime, endTime });
    return this.appointmentRepository.save(newAppointment);
  }

  /**
   * Obtiene todas las citas agendadas para un médico en el día actual.
   * @param doctor - El objeto del usuario médico.
   * @returns Un arreglo de citas para el día de hoy.
   */
  async getDoctorTodayAppointments(doctor: User) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    return this.appointmentRepository.find({
      where: {
        doctor: { id: doctor.id },
        startTime: Between(today, tomorrow),
      },
      relations: ['patient'], // Incluye la información del paciente en la respuesta.
      order: { startTime: 'ASC' },
    });
  }

  /**
   * Obtiene el historial completo de citas de un paciente.
   * @param patient - El objeto del usuario paciente.
   * @returns Un arreglo con todas las citas del paciente, ordenadas por fecha.
   */
  async getPatientAgenda(patient: User) {
    return this.appointmentRepository.find({
      where: { patient: { id: patient.id } },
      relations: ['doctor'], // Incluye la información del médico en la respuesta.
      order: { startTime: 'DESC' },
    });
  }

  /**
   * Confirma la asistencia a una cita. Este método es solo para médicos.
   * @param appointmentId - El ID de la cita a confirmar.
   * @param doctor - El objeto del usuario médico que realiza la confirmación.
   * @returns La cita actualizada con el estado CONFIRMED.
   */
  async confirmAppointment(appointmentId: string, doctor: User) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, doctor: { id: doctor.id } },
    });
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada o no pertenece a este médico.');
    }

    // REGLA DE NEGOCIO: Una cita no puede ser confirmada si no ha sido pagada previamente.
    if (appointment.status !== AppointmentStatus.PAID) {
      throw new BadRequestException('No se puede confirmar una cita que no ha sido pagada.');
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    return this.appointmentRepository.save(appointment);
  }
}
