import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Citas (Appointments)') // Título de la sección en Swagger
@ApiBearerAuth() // Indica que los endpoints requieren un token Bearer
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('request')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Paciente solicita una cita médica' })
  @ApiResponse({ status: 201, description: 'La cita fue solicitada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o el horario no está permitido.' })
  @ApiResponse({ status: 401, description: 'No autorizado (token inválido o ausente).' })
  @ApiResponse({ status: 409, description: 'El horario seleccionado ya se encuentra ocupado.' })
  requestAppointment(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.requestAppointment(createAppointmentDto, req.user);
  }

  @Get('doctor/today')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Médico obtiene su lista de citas para el día de hoy' })
  @ApiResponse({ status: 200, description: 'Lista de citas del día obtenida exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  getDoctorTodayAppointments(@Request() req) {
    return this.appointmentsService.getDoctorTodayAppointments(req.user);
  }

  @Get('patient/my-agenda')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Paciente obtiene su historial completo de citas (agenda)' })
  @ApiResponse({ status: 200, description: 'Agenda del paciente obtenida exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  getPatientAgenda(@Request() req) {
    return this.appointmentsService.getPatientAgenda(req.user);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Médico confirma la asistencia a una cita' })
  @ApiResponse({ status: 200, description: 'Cita confirmada exitosamente.' })
  @ApiResponse({ status: 400, description: 'La cita no puede ser confirmada (ej. no ha sido pagada).' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'La cita no fue encontrada.' })
  confirmAppointment(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.confirmAppointment(id, req.user);
  }
}
