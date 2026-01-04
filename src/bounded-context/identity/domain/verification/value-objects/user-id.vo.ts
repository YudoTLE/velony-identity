import { Id } from '@velony/domain';
import { v7 as uuidv7 } from 'uuid';

export class VerificationId extends Id<string> {
  public static create(value?: string): VerificationId {
    return new VerificationId(value ?? uuidv7());
  }
}
