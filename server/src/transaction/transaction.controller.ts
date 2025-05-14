import {
  Controller, Post, Get, Body, Delete, Param, Req,
  UseGuards, Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post()
  create(@Req() req, @Body() body) {
    return this.service.create({ ...body, userId: req.user.userId });
  }

  @Get()
  findAll(@Req() req, @Query() query) {
    return this.service.findAll(req.user.userId, query);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.service.delete(id, req.user.userId);
  }
}

