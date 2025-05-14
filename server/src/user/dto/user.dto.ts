import { IsEmail, IsOptional, MinLength, MaxLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false, example: 'new@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ 
    required: false, 
    minLength: 6,
    maxLength: 30,
    example: 'NewPassword123!'
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password?: string;
}