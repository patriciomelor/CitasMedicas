import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Autenticación (Auth)')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario (paciente o médico)' })
  @ApiResponse({ status: 201, description: 'Usuario registrado y logueado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Los datos proporcionados son inválidos.' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    // La lógica de creación ahora recibe el DTO directamente
    const user = await this.usersService.create(registerUserDto);
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión para obtener un token JWT' })
  @ApiBody({ type: LoginUserDto }) // Ayuda a Swagger a mostrar el cuerpo correcto
  @ApiResponse({ status: 201, description: 'Login exitoso, devuelve el token de acceso.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas.' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  getProfile(@Request() req) {
    return req.user;
  }
}
