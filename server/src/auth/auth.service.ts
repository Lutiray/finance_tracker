import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  // Sign Up
  async register(email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, hashedPassword);
    const token = this.jwtService.sign({ sub: user._id });
    return { token, user: { id: user._id, email: user.email } };
  }

  // Sign in
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user._id });
    return { token, user: { id: user._id, email: user.email } };
  }
}