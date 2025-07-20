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

  async findOneByEmail(email: string): Promise<User | null> {
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

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.password) {
      throw new BadRequestException('Se requiere contraseña');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }
}