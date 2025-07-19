// src/appointments/appointments.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard) // Protegemos todo el controlador
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('request')
  @Roles(UserRole.PATIENT) // Solo los pacientes pueden ejecutar este endpoint
  requestAppointment(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.requestAppointment(createAppointmentDto, req.user);
  }

  @Get('doctor/today')
  @Roles(UserRole.DOCTOR) // Solo los doctores
  getDoctorTodayAppointments(@Request() req) {
    return this.appointmentsService.getDoctorTodayAppointments(req.user);
  }
}
