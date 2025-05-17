import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  InternalServerErrorException
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { TokenResponseDto } from './dto/token-response.dto';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;
  userModel: any;

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async register(email: string, password: string): Promise<TokenResponseDto> {
    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await this.hashPassword(password);
      const user = await this.usersService.create(email, hashedPassword);

      if (!(await bcrypt.compare(password, user.password))) {
        await this.userModel.deleteOne({ _id: user._id });
        throw new InternalServerErrorException('Password verification failed');
      }

      return this.generateTokenResponse(user);

    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<TokenResponseDto> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.generateTokenResponse(user);

    } catch (error) {
      this.logger.error(`Login failed for ${email}: ${error.message}`);
      throw error;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      this.logger.error('Password hashing failed', error.stack);
      throw new InternalServerErrorException('Could not hash password');
    }
  }

  private async verifyPassword(
    plainText: string,
    hashed: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainText, hashed);
    } catch (error) {
      this.logger.error('Password verification failed', error.stack);
      return false;
    }
  }

  private generateTokenResponse(user: User): TokenResponseDto {
    const payload = {
      email: user.email,
      userId: user._id.toString()
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email
      }
    };
  }
}
