import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePreferenceDto {
  @ApiProperty({
    description: 'El ID de la cita que se va a pagar',
    example: '3aee930a-e9d9-45bd-8656-2ad56db17f45',
  })
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;
}