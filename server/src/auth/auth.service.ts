import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  private async generateToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  async register(email: string, password: string) {
    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await this.usersService.create(email, hashedPassword);
      const token = await this.generateToken(user);

      return {
        token,
        user: {
          id: user._id,
          email: user.email
        }
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = await this.generateToken(user);
      return {
        token,
        user: {
          id: user._id,
          email: user.email
        }
      };
    } catch (error) {
      this.logger.error(`Login failed for ${email}: ${error.message}`);
      throw error;
    }
  }
}
