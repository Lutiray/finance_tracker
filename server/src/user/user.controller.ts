import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('me')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user returned',
    type: UserDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() req) {
    const user = await this.userService.findById(req.user.userId);
    return this.toUserDto(user);
  }

  @Patch('me')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Req() req, @Body() body: UpdateUserDto) {
    const updatedUser = await this.userService.update(req.user.userId, body);
    return this.toUserDto(updatedUser);
  }

  private toUserDto(user: any): UserDto {
    return {
      id: user._id.toString(),
      email: user.email
    };
  }
}
