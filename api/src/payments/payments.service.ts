// src/payments/payments.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { Payment as MercadoPagoPayment } from 'mercadopago/dist/clients/payment'; // Importa el tipo

@Injectable()
export class PaymentsService {
  private readonly client: MercadoPagoConfig;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    const accessToken = this.configService.get('MERCADOPAGO_ACCESS_TOKEN');

    this.client = new MercadoPagoConfig({
      accessToken: accessToken || '',
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

    const appointmentPrice = 5000;
    const preference = new Preference(this.client);

    const notificationHost = 'https://f062276cb47b.ngrok-free.app';

    const preferenceBody = {
      items: [
        {
          id: appointment.id,
          title: 'Cita Médica',
          quantity: 1,
          unit_price: appointmentPrice,
          currency_id: 'CLP',
        },
      ],
      back_urls: {
        success: `${notificationHost}/payment-success`, // <-- URL PÚBLICA
        failure: `${notificationHost}/payment-failure`, // <-- URL PÚBLICA
        pending: `${notificationHost}/payment-pending`, // <-- URL PÚBLICA
      },
      auto_return: 'approved' as const,
      notification_url: `${notificationHost}/payments/webhook`, // <-- URL PÚBLICA
    };

    try {
      const result = await preference.create({ body: preferenceBody });

      const newPayment = this.paymentRepository.create({
        appointment,
        amount: appointmentPrice,
        paymentGatewayId: result.id,
      });
      await this.paymentRepository.save(newPayment);

      return {
        preferenceId: result.id,
        init_point: result.init_point,
      };
    } catch (error) {
      console.error('Error creating Mercado Pago preference:', error.cause || error.message);
      throw new BadRequestException('Could not create payment preference.');
    }
  }
  async handleWebhook(mercadopagoId: string) {
  try {
    const mp = new MercadoPagoPayment(this.client);
    const paymentInfo = await mp.get({ id: mercadopagoId });

    // El ID de nuestra cita está en los metadatos
    const appointmentId = paymentInfo.metadata?.appointment_id;

    if (appointmentId && paymentInfo.status === 'approved') {
      const appointment = await this.appointmentRepository.findOneBy({ id: appointmentId });
      if (appointment) {
        appointment.status = AppointmentStatus.PAID;
        await this.appointmentRepository.save(appointment);
        console.log(`Cita ${appointmentId} actualizada a PAID.`);
      }
    }
  } catch (error) {
    console.error('Error procesando el webhook de Mercado Pago:', error);
  }
}
}