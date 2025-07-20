import { Controller, Post, Body, UseGuards, Request,HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePreferenceDto } from './dto/create-preference.dto'; 

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Paciente crea una preferencia de pago para una cita' })
  createPreference(
    @Body() createPreferenceDto: CreatePreferenceDto, // <-- 2. USA EL DTO AQUÍ
    @Request() req,
  ) {
    // 3. ACCEDE A LA PROPIEDAD DESDE EL DTO
    return this.paymentsService.createPreference(
      createPreferenceDto.appointmentId,
      req.user.id,
    );
  }
  @Post('webhook')
  @HttpCode(200) 
  handleWebhook(@Body() body: any) {
    // El 'topic' puede ser 'payment' o 'merchant_order'
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log('Webhook de pago recibido, ID:', paymentId);
      // Llamamos al servicio para que procese este pago
      return this.paymentsService.handleWebhook(paymentId);
    }
    return { received: true };
  }
}