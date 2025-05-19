import { Injectable, BadRequestException, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { Account } from '../account/schemas/account.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionSummaryDto } from './dto/transaction-summary.dto';
import { TransferDto } from './dto/transfer.dto';
import { TransferResponseDto } from './dto/transfer-response.dto';
import { TRANSFER_CATEGORY_ID } from 'common/constants';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) { }

  private calculateAmount(type: 'income' | 'expense', amount: number): number {
    return type === 'income' ? amount : -amount;
  }

  async create(dto: CreateTransactionDto, userId: Types.ObjectId) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      const [transaction] = await this.transactionModel.create(
        [{
          ...dto,
          categoryId: new Types.ObjectId(dto.categoryId),
          accountId: new Types.ObjectId(dto.accountId),
          userId,
          date: dto.date ? new Date(dto.date) : new Date(),
        }],
        { session }
      );

      await this.accountModel.findByIdAndUpdate(
        dto.accountId,
        { $inc: { balance: this.calculateAmount(dto.type, dto.amount) } },
        { session, new: true }
      );

      await session.commitTransaction();
      return transaction;
    } catch (err) {
      await session.abortTransaction();
      this.logger.error(`Transaction failed: ${err.message}`, err.stack);
      throw new BadRequestException('Transaction creation failed');
    } finally {
      session.endSession();
    }
  }

  async deleteTransaction(id: string, userId: Types.ObjectId) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      const transaction = await this.transactionModel.findOneAndDelete(
        { _id: id, userId },
        { session }
      ).exec();

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      await this.accountModel.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: this.calculateAmount(transaction.type, transaction.amount) * -1 } },
        { session, new: true }
      );

      await session.commitTransaction();
      return transaction;
    } catch (err) {
      await session.abortTransaction();
      this.logger.error(`Delete transaction failed: ${err.message}`);
      throw err;
    } finally {
      session.endSession();
    }
  }

  async findAll(userId: Types.ObjectId, filters?: {
    type?: 'income' | 'expense';
    categoryId?: string;
    from?: string;
    to?: string;
  }) {
    const query: any = { userId };

    if (filters?.type) query.type = filters.type;
    if (filters?.categoryId) query.categoryId = new Types.ObjectId(filters.categoryId);

    if (filters?.from || filters?.to) {
      query.date = {};
      if (filters.from) query.date.$gte = new Date(filters.from);
      if (filters.to) query.date.$lte = new Date(filters.to);
    }

    return this.transactionModel.find(query)
      .sort({ date: -1 })
      .populate('categoryId', 'name')
      .populate('accountId', 'name balance currency')
      .exec();
  }

  async getSummary(
    userId: Types.ObjectId,
    filters: { from?: string; to?: string }
  ): Promise<TransactionSummaryDto> {
    const match: any = { userId };

    if (filters.from || filters.to) {
      match.date = {};
      if (filters.from) match.date.$gte = new Date(filters.from);
      if (filters.to) match.date.$lte = new Date(filters.to);
    }

    const result = await this.transactionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          },
          byCategory: {
            $push: {
              category: "$categoryId",
              amount: "$amount",
              type: "$type"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          netSavings: { $subtract: ["$totalIncome", "$totalExpenses"] },
          byCategory: 1
        }
      }
    ]);

    return result[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      byCategory: []
    };
  }

  async transferFunds(
    userId: Types.ObjectId,
    dto: TransferDto
  ): Promise<TransferResponseDto> {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      // Checking accounts
      const [fromAccount, toAccount] = await Promise.all([
        this.accountModel.findById(dto.fromAccountId).session(session),
        this.accountModel.findById(dto.toAccountId).session(session)
      ]);

      if (!fromAccount || !toAccount) {
        throw new NotFoundException('One or both accounts not found');
      }

      if (fromAccount.userId.toString() !== userId.toString()) {
        throw new ForbiddenException('Source account belongs to another user');
      }

      // 2. Checking balance
      if (fromAccount.balance < dto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // Balance update 
      await Promise.all([
        this.accountModel.findByIdAndUpdate(
          dto.fromAccountId,
          { $inc: { balance: -dto.amount } },
          { session }
        ),
        this.accountModel.findByIdAndUpdate(
          dto.toAccountId,
          { $inc: { balance: dto.amount } },
          { session }
        )
      ]);

      // Creating transaction
      const transferDate = new Date();
      const [outgoingTx, incomingTx] = await Promise.all([
        this.transactionModel.create([{
          type: 'expense',
          amount: dto.amount,
          accountId: dto.fromAccountId,
          categoryId: TRANSFER_CATEGORY_ID,
          userId,
          date: transferDate,
          note: `Transfer to ${toAccount.name}`
        }], { session }),

        this.transactionModel.create([{
          type: 'income',
          amount: dto.amount,
          accountId: dto.toAccountId,
          categoryId: TRANSFER_CATEGORY_ID,
          userId: toAccount.userId,
          date: transferDate,
          note: `Transfer from ${fromAccount.name}`
        }], { session })
      ]);

      await session.commitTransaction();

      return {
        success: true,
        newSourceBalance: fromAccount.balance - dto.amount,
        newDestinationBalance: toAccount.balance + dto.amount
      };

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}