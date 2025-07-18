// src/auth/auth.controller.ts
import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // POST /auth/register
  @Post('register')
  async register(@Body() createUserDto: any) { // En un proyecto real, usa un DTO para validar
    // Aquí podrías añadir lógica para solo permitir crear pacientes, por ejemplo
    const user = await this.usersService.create({
        email: createUserDto.email,
        password: createUserDto.password,
        fullName: createUserDto.fullName,
        role: createUserDto.role || UserRole.PATIENT, // Por defecto, es Paciente
    });
    // Opcional: puedes loguear al usuario inmediatamente después de registrarse
    return this.authService.login(user);
  }

  // POST /auth/login
  @UseGuards(AuthGuard('local')) // Usa la LocalStrategy
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // GET /auth/profile - Un endpoint protegido para probar
  @UseGuards(AuthGuard('jwt')) // Usa la JwtStrategy para proteger
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // Gracias a JwtStrategy, req.user contiene el payload del token
  }
}