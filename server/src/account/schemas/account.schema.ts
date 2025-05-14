import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Account extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ required: true })
  userId: Types.ObjectId;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
