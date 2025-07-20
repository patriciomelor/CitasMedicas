import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async requestAppointment(createDto: CreateAppointmentDto, patient: User) {
    const doctor = await this.userRepository.findOneBy({ id: createDto.doctorId, role: UserRole.DOCTOR });
    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }

    const appointmentTime = new Date(createDto.startTime);
    const appointmentHour = appointmentTime.getUTCHours();

    const isValidTime = (appointmentHour >= 7 && appointmentHour < 12) || (appointmentHour >= 14 && appointmentHour < 18);
    if (!isValidTime) {
      throw new BadRequestException('Appointments are only allowed between 7:00-12:00 and 14:00-18:00.');
    }

    const endTime = new Date(appointmentTime.getTime() + 30 * 60 * 1000); // Citas de 30 minutos

    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: createDto.doctorId },
        startTime: Between(appointmentTime, endTime),
      },
    });
    if (existingAppointment) {
      throw new ConflictException('This time slot is already booked.');
    }

    const newAppointment = this.appointmentRepository.create({ patient, doctor, startTime: appointmentTime, endTime });
    return this.appointmentRepository.save(newAppointment);
  }

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
      relations: ['patient'],
      order: { startTime: 'ASC' },
    });
  }

  async getPatientAgenda(patient: User) {
    return this.appointmentRepository.find({
      where: { patient: { id: patient.id } },
      relations: ['doctor'],
      order: { startTime: 'DESC' },
    });
  }

  async confirmAppointment(appointmentId: string, doctor: User) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, doctor: { id: doctor.id } },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (appointment.status !== AppointmentStatus.PAID) {
      throw new BadRequestException('Cannot confirm an unpaid appointment.');
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    return this.appointmentRepository.save(appointment);
  }
}