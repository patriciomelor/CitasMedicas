import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'El ID del médico para agendar la cita.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({
    description: 'La fecha y hora de inicio de la cita en formato ISO 8601 (UTC).',
    example: '2025-08-20T15:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;
}
