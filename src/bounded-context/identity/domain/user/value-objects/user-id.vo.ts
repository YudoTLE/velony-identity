import { Id } from '@velony/domain';
import { v7 as uuidv7 } from 'uuid';

export class UserId extends Id<string> {
  public static create(value?: string): UserId {
    return new UserId(value ?? uuidv7());
  }
}
