import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema()
export class Email {
  @Prop({ unique: true })
  email: string;

  @Prop()
  hash: string;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
