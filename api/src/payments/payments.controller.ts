import { Controller, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePreferenceDto } from './dto/create-preference.dto';

@ApiTags('Pagos (Payments)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Crea una preferencia de pago en Mercado Pago para una cita' })
  @ApiResponse({ status: 201, description: 'Preferencia de pago creada. Devuelve la URL de checkout.' })
  @ApiResponse({ status: 400, description: 'La cita no se puede pagar (ej. ya fue pagada).' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'La cita no fue encontrada.' })
  createPreference(
    @Body() createPreferenceDto: CreatePreferenceDto,
    @Request() req,
  ) {
    return this.paymentsService.createPreference(
      createPreferenceDto.appointmentId,
      req.user.id,
    );
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Webhook para recibir notificaciones de Mercado Pago',
    description: 'Este endpoint es llamado por los servidores de Mercado Pago. No requiere autenticación.',
  })
  @ApiResponse({ status: 200, description: 'Notificación recibida correctamente.' })
  @HttpCode(200)
  handleWebhook(@Body() body: any) {
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      return this.paymentsService.handleWebhook(paymentId);
    }
    return { received: true };
  }
}
