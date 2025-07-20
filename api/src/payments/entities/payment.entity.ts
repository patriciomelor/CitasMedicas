// src/payments/entities/payment.entity.ts
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentStatus {
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Appointment)
  @JoinColumn()
  appointment: Appointment;

  @Column()
  amount: number; // Guardaremos el monto en centavos/pesos

  @Column({ unique: true })
  paymentGatewayId: string; // ID de la preferencia de Mercado Pago

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.FAILED })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
}