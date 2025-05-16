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
    if (!value) {
      this.logger.warn(`Empty value provided for ${metadata.data}`);
      throw new BadRequestException(`No value provided for ${metadata.data}`);
    }

    if (typeof value !== 'string') {
      this.logger.warn(`Invalid type for ${metadata.data}: ${typeof value}`);
      throw new BadRequestException(`Invalid type for ${metadata.data}`);
    }

    if (!Types.ObjectId.isValid(value)) {
      this.logger.warn(`Invalid ObjectId format: ${value}`);
      throw new BadRequestException(`Invalid ObjectId format`);
    }

    return new Types.ObjectId(value);
  }
}