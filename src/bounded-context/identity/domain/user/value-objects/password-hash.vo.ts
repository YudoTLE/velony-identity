import { ValueObject } from '@velony/domain';
import bcrypt from 'bcrypt';

import { type Password } from '@identity-domain/user/value-objects/password.vo';

export class PasswordHash extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(hash: string): PasswordHash {
    if (!/^\$2[aby]?\$/.test(hash)) {
      throw new Error('Invalid bcrypt hash format');
    }

    return new PasswordHash(hash);
  }

  public async verify(plain: Password): Promise<boolean> {
    try {
      return await bcrypt.compare(plain.value, this._value);
    } catch {
      return false;
    }
  }

  public equals(other: this): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
