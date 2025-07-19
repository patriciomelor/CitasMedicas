import { IsDateString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsDateString()
  startTime: string; // Recibimos la fecha como un string en formato ISO 8601
}
