import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // CORRECCIÓN 1: El retorno de findOne es Promise<User | null>
  async findOneByEmail(email: string): Promise<User | null> {
    // Agregamos la selección explícita de la contraseña
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'fullName',
        'password',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  // CORRECCIÓN 2: Lógica robusta para la creación
  async create(userData: Partial<User>): Promise<User> {
    // Aseguramos que la contraseña exista
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }

    // Ahora TypeScript sabe que userData.password es un string
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }
}
