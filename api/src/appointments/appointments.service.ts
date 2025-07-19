import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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

  async requestAppointment(createAppointmentDto: CreateAppointmentDto, patient: User) {
    const { doctorId, startTime } = createAppointmentDto;

    const doctor = await this.userRepository.findOneBy({ id: doctorId, role: UserRole.DOCTOR });
    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }

    const appointmentTime = new Date(startTime);
    const appointmentHour = appointmentTime.getUTCHours();

    // 1. Validación: No se puede pedir cita en un horario no permitido (7-12 y 14-18 UTC)
    const isValidTime = (appointmentHour >= 7 && appointmentHour < 12) || (appointmentHour >= 14 && appointmentHour < 18);
    if (!isValidTime) {
      throw new BadRequestException('Appointments are only allowed between 7:00-12:00 and 14:00-18:00.');
    }

    const endTime = new Date(appointmentTime.getTime() + 60 * 60 * 1000); // Asumimos citas de 1 hora

    // 2. Validación: No se puede pedir cita en un horario ya ocupado
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: doctorId },
        startTime: Between(appointmentTime, endTime),
      },
    });

    if (existingAppointment) {
      throw new ConflictException('This time slot is already booked.');
    }

    const newAppointment = this.appointmentRepository.create({
      patient,
      doctor,
      startTime: appointmentTime,
      endTime,
      status: AppointmentStatus.PENDING_PAYMENT,
    });

    return this.appointmentRepository.save(newAppointment);
  }

  async getDoctorTodayAppointments(doctor: User) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return this.appointmentRepository.find({
      where: {
        doctor: { id: doctor.id },
        startTime: Between(today, tomorrow),
      },
      relations: ['patient'], // Para incluir los datos del paciente
    });
  }

  // Añadiremos más métodos aquí después (confirmar, pagar, etc.)
}
