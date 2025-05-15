import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Currency, CurrencyValues } from '../../../common/enums/currency.enum';


export type AccountDocument = Account & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      delete ret.userId;
    }
  }
})
export class Account {
  @ApiProperty({ type: String })
  _id: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, default: 0, min: 0 })
  balance: number;

  @ApiProperty({ enum: CurrencyValues})
    @Prop({
    type: String,
    enum: CurrencyValues,
    default: Currency.RUB,
    required: true
  })
  currency: Currency;

  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
AccountSchema.index({ userId: 1, name: 1 }, { unique: true });