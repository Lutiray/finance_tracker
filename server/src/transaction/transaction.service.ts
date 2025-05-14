import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { Account } from '../account/schemas/account.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

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

  async delete(id: string, userId: Types.ObjectId) {
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
}