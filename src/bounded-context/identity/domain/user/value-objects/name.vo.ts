import { ValueObject } from '@velony/domain';

export class Name extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): Name {
    return new Name(value);
  }

  public equals(other: this): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
