import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference') // Cambiamos el nombre de la ruta
  @Roles(UserRole.PATIENT)
  createPreference(@Body('appointmentId') appointmentId: string, @Request() req) {
    return this.paymentsService.createPreference(appointmentId, req.user.id);
  }
}