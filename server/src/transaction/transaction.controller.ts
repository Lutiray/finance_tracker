import {
  Controller,
  Post,
  Get,
  Body,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { TransferDto } from './dto/transfer.dto';
import { TransactionSummaryDto, BalanceHistoryItem } from './dto/transaction-response.dto';

// Interface for expansion Request
interface AuthenticatedRequest extends Request {
  user: {
    userId: Types.ObjectId;
    email: string;
  };
}

@ApiBearerAuth()
@ApiTags('Transaction')
@UseGuards(JwtAuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) { }

  @Post()
  @ApiOperation({ summary: 'Create new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto
  ) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user transactions' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('type') type?: 'income' | 'expense',
    @Query('categoryId') categoryId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findAll(req.user.userId, {
      type,
      categoryId,
      from,
      to
    });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  deleteTransaction(
    @Query('id', ParseObjectIdPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.deleteTransaction(id.toString(), req.user.userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiResponse({
    status: 200,
    description: 'Financial summary',
    type: TransactionSummaryDto
  })
  async getSummary(@Req() req: AuthenticatedRequest) {
    return this.service.getSummary(req.user.userId);
  }

  @Get('balance-history')
  @ApiOperation({ summary: 'Get balance history for period' })
  @ApiResponse({
    status: 200,
    description: 'Balance history data',
    type: [BalanceHistoryItem]
  })
  async getBalanceHistory(
    @Req() req: AuthenticatedRequest,
    @Query('period') period: 'week' | 'month' | 'year' = 'month'
  ) {
    return this.service.getBalanceHistory(req.user.userId, period);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions' })
  async getRecentTransactions(@Req() req: AuthenticatedRequest) {
    return this.service.getRecentTransactions(req.user.userId);
  }

  @Post('transfer')
  async transfer(
    @Req() req,
    @Body() dto: TransferDto
  ) {
    return this.service.transferFunds(req.user.userId, dto);
  }
}
