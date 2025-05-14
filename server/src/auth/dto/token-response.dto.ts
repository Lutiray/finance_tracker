import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token'
  })
  token: string;

  @ApiProperty({
    description: 'User data'
  })
  user: {
    id: string;
    email: string;
  };
}