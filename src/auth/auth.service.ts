import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, password: string): Promise<any> {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return {
      admin,
    };
  }

  async login(admin: any) {
    const payload = {
      username: admin.username,
      name: admin.name,
      sub: admin.uuid,
      role: admin.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: {
    username: string;
    password: string;
    email: string;
    name: string;
  }) {
    try {
      const existingUser = await this.prisma.admin.findFirst({
        where: {
          OR: [{ username: data.username }, { email: data.email }],
        },
      });

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newAdmin = await this.prisma.admin.create({
        data: {
          username: data.username,
          password: hashedPassword,
          email: data.email,
          name: data.name,
          role: 'user', // default role
        },
      });
      return newAdmin;
    } catch (error) {
      this.logger.error('Error during registration', error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
