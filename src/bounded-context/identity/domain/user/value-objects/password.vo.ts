import { ValueObject } from '@velony/domain';
import bcrypt from 'bcrypt';

import { PasswordHash } from '@identity-domain/user/value-objects/password-hash.vo';

export class Password extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): Password {
    if (value.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (value.length > 100) {
      throw new Error('Password must be at most 100 characters');
    }
    if (!/[A-Z]/.test(value)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(value)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[^a-zA-Z0-9]/.test(value)) {
      throw new Error('Password must contain at least one symbol');
    }
    return new Password(value);
  }

  public async toHash(): Promise<PasswordHash> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(this._value, saltRounds);

    return PasswordHash.create(passwordHash);
  }

  public equals(other: this): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
