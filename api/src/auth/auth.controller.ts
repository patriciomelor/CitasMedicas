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

  @Post('register')
  async register(@Body() createUserDto: any) { 
 
    const user = await this.usersService.create({
      email: createUserDto.email,
      password: createUserDto.password,
      fullName: createUserDto.fullName,
      role: createUserDto.role || UserRole.PATIENT, 
    });
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('local')) 
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get('profile')
  getProfile(@Request() req: { user: any }) {
    return req.user; 
  }
}
