// src/common/pipes/parse-object-id.pipe.ts
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  private readonly logger = new Logger(ParseObjectIdPipe.name);

  transform(value: any, metadata: ArgumentMetadata): Types.ObjectId {
    // Checking for empty value
    if (!value) {
      this.logger.warn(`Empty value provided for ${metadata.data}`);
      throw new BadRequestException(
        `No value provided for ${metadata.data}. Expected ObjectId.`,
      );
    }

    // Checking for string type
    if (typeof value !== 'string') {
      this.logger.warn(
        `Invalid type provided for ${metadata.data}: ${typeof value}`,
      );
      throw new BadRequestException(
        `Invalid type for ${metadata.data}. Expected string.`,
      );
    }

    // ObjectId validity check
    const isValidObjectId = Types.ObjectId.isValid(value);
    if (!isValidObjectId) {
      this.logger.warn(`Invalid ObjectId format for ${metadata.data}: ${value}`);
      throw new BadRequestException(
        `Invalid ObjectId format for ${metadata.data}. Expected 24-character hex string.`,
      );
    }

    // Checking the correctness of conversion (additional validation)
    const objectId = new Types.ObjectId(value);
    if (objectId.toString() !== value) {
      this.logger.warn(
        `ObjectId conversion mismatch for ${metadata.data}: ${value} → ${objectId}`,
      );
      throw new BadRequestException(
        `Invalid ObjectId conversion for ${metadata.data}.`,
      );
    }

    return objectId;
  }
}