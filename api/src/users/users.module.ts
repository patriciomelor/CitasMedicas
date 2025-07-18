// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Importa la entidad User aquí
  providers: [UsersService],
  exports: [UsersService], // Exporta el servicio para que otros módulos lo usen
})
export class UsersModule {}