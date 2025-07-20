import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Payment } from './entities/payment.entity';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        // Simulamos todas las dependencias
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: getRepositoryToken(Appointment), useValue: {} },
        { provide: getRepositoryToken(Payment), useValue: {} },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});