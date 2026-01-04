import { timingSafeEqual } from 'crypto';

import { AggregateRoot } from '@shared-kernel/libs/aggregate-root';
import { type AggregateId } from '@shared-kernel/libs/entity';
import { type ValueObject } from '@shared-kernel/libs/value-object';

export type VerificationType = 'email' | 'phone_number';

export abstract class VerificationEntity<
  TValue extends ValueObject<string> = ValueObject<string>,
> extends AggregateRoot {
  protected constructor(props: {
    id: AggregateId;
    userId: AggregateId;
    token: string;
    value: TValue;
    issuedAt: Date;
    expiresAt: Date;
    verifiedAt: Date | null;
    revokedAt: Date | null;
  }) {
    super(props.id);
    this._userId = props.userId;
    this._token = props.token;
    this._value = props.value;
    this._issuedAt = props.issuedAt;
    this._expiresAt = props.expiresAt;
    this._verifiedAt = props.verifiedAt;
    this._revokedAt = props.revokedAt;
  }

  protected abstract _type: VerificationType;

  protected _userId: AggregateId;

  protected _token: string;

  protected _value: TValue;

  protected _issuedAt: Date;

  protected _expiresAt: Date;

  protected _verifiedAt: Date | null;

  protected _revokedAt: Date | null;

  public get type(): VerificationType {
    return this._type;
  }

  public get userId(): AggregateId {
    return this._userId;
  }

  public get token(): string {
    return this._token;
  }

  public get value(): TValue {
    return this._value;
  }

  public get issuedAt(): Date {
    return this._issuedAt;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public get verifiedAt(): Date | null {
    return this._verifiedAt;
  }

  public get revokedAt(): Date | null {
    return this._revokedAt;
  }

  public isExpired(): boolean {
    return this._expiresAt < new Date();
  }

  public isVerified(): boolean {
    return this._verifiedAt !== null;
  }

  public isRevoked(): boolean {
    return this._revokedAt !== null;
  }

  public verifyToken(token: string): boolean {
    if (this._token.length !== token.length) return false;
    return timingSafeEqual(Buffer.from(this._token), Buffer.from(token));
  }

  public abstract verify(): void;

  public abstract revoke(): void;
}
