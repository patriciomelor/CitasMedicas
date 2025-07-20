import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('request')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Paciente solicita una cita médica' })
  @ApiResponse({ status: 201, description: 'Cita solicitada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o fuera de horario.' })
  requestAppointment(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.requestAppointment(createAppointmentDto, req.user);
  }

  @Get('doctor/today')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Médico lista sus citas del día' })
  getDoctorTodayAppointments(@Request() req) {
    return this.appointmentsService.getDoctorTodayAppointments(req.user);
  }

  @Get('patient/my-agenda')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Paciente lista su historial de citas (agenda)' })
  getPatientAgenda(@Request() req) {
    return this.appointmentsService.getPatientAgenda(req.user);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Médico confirma una cita (debe estar pagada)' })
  @ApiResponse({ status: 200, description: 'Cita confirmada.' })
  @ApiResponse({ status: 400, description: 'La cita no se puede confirmar (ej. no está pagada).' })
  confirmAppointment(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.confirmAppointment(id, req.user);
  }
}