import { Id } from '@velony/domain';
import { v7 as uuidv7 } from 'uuid';

export class LocalAuthenticationId extends Id<string> {
  public static create(value?: string): LocalAuthenticationId {
    return new LocalAuthenticationId(value ?? uuidv7());
  }
}
