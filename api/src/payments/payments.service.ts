import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

// Importaciones de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class PaymentsService {
  // Cliente de Mercado Pago
  private readonly client: MercadoPagoConfig;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    // Inicializa el cliente de Mercado Pago
    this.client = new MercadoPagoConfig({ 
      accessToken: this.configService.get('MERCADOPAGO_ACCESS_TOKEN'),
    });
  }

  async createPreference(appointmentId: string, userId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, patient: { id: userId } },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found or you are not the owner.');
    }

    if (appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
      throw new BadRequestException('This appointment cannot be paid for.');
    }

    const appointmentPrice = 5000; // Precio: 5000 CLP

    const preference = new Preference(this.client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: appointment.id,
            title: 'Cita Médica Online',
            quantity: 1,
            unit_price: appointmentPrice,
            currency_id: 'CLP', // Moneda local
          },
        ],
        // URL a la que Mercado Pago enviará notificaciones del pago
        notification_url: 'https://tu-servidor.com/payments/webhook', // ¡Importante! La cambiaremos para pruebas
        back_urls: {
          success: 'http://localhost:3001/payment-success', // URL para el frontend
          failure: 'http://localhost:3001/payment-failure',
        },
        auto_return: 'approved', // Redirige automáticamente al pagar
      },
    });

    // Guardar un registro del intento de pago (opcional, pero recomendado)
    const newPayment = this.paymentRepository.create({
      appointment,
      amount: appointmentPrice,
      stripePaymentIntentId: result.id, // Guardamos el ID de la preferencia
    });
    await this.paymentRepository.save(newPayment);

    // Devolvemos la URL de pago para el frontend
    return {
      preferenceId: result.id,
      init_point: result.init_point, // URL de checkout
    };
  }
}
