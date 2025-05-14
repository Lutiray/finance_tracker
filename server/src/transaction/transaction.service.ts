import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { Account } from '../account/schemas/account.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  async create(data: Partial<Transaction>) {
    if (typeof data.amount !== 'number') {
      throw new Error('Transaction amount must be a number');
    }

    const session = await this.transactionModel.db.startSession();
    session.startTransaction();
    try {
      const transaction = await this.transactionModel.create([data], { session });
      const amount = data.type === 'income' ? data.amount : -data.amount;
      await this.accountModel.findByIdAndUpdate(
        data.accountId,
        { $inc: { balance: amount } },
        { session }
      );
      await session.commitTransaction();
      return transaction[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async delete(id: string, userId: string) {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();
    try {
      const transaction = await this.transactionModel.findOneAndDelete({ _id: id, userId }, { session });
      if (!transaction) return null;
      const amount = transaction.type === 'income' ? -transaction.amount : transaction.amount;
      await this.accountModel.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: amount } },
        { session }
      );
      await session.commitTransaction();
      return transaction;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  findAll(userId: string, filters?: any) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (filters?.type) query.type = filters.type;
    if (filters?.categoryId) query.categoryId = new Types.ObjectId(filters.categoryId);
    if (filters?.from || filters?.to) {
      query.date = {};
      if (filters.from) query.date.$gte = new Date(filters.from);
      if (filters.to) query.date.$lte = new Date(filters.to);
    }
    return this.transactionModel.find(query).sort({ date: -1 });
  }
}