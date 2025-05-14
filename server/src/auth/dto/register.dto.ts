import { IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    minLength: 6,
    maxLength: 30,
    example: 'Str0ngP@ssword!',
    description: 'User password (6-30 characters)'
  })
  @MinLength(6)
  @MaxLength(30)
  password: string;
}