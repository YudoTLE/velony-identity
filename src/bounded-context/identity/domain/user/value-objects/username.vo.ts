import { ValueObject } from '@velony/domain';

export class Username extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): Username {
    if (value.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (value.length > 50) {
      throw new Error('Username must be at most 50 characters');
    }
    if (!/^[A-Za-z0-9_]+$/.test(value)) {
      throw new Error(
        'Username can only contain letters, numbers, and underscores',
      );
    }

    return new Username(value);
  }

  public equals(other: this): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
