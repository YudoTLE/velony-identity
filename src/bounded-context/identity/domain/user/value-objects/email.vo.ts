import { ValueObject } from '@velony/domain';

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): Email {
    if (value.length === 0) {
      throw new Error('Email cannot be empty');
    }
    if (value.length > 254) {
      throw new Error('Email is too long');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Invalid email format');
    }

    return new Email(value);
  }

  public get local(): string {
    return this._value.split('@')[0];
  }

  public get domain(): string {
    return this._value.split('@')[1];
  }

  public equals(other: this): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
