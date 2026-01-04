import { v7 as uuidv7 } from 'uuid';

import { type AggregateId } from '@shared-kernel/libs/entity';

import { type PhoneNumber } from '@identity-domain/user/value-objects/phone-number.vo';
import { VerificationEntity } from '@identity-domain/verification/aggregates/base-verification.entity';
import { type VerificationType } from '@identity-domain/verification/aggregates/base-verification.entity';
import { PhoneNumberVerificationIssuedDomainEvent } from '@identity-domain/verification/events/phone-number-verification-issued.domain-event';
import { PhoneNumberVerificationRevokedDomainEvent } from '@identity-domain/verification/events/phone-number-verification-revoked.domain-event';
import { PhoneNumberVerificationVerifiedDomainEvent } from '@identity-domain/verification/events/phone-number-verification-verified.domain-event';
import { AlreadyVerifiedException } from '@identity-domain/verification/exceptions/already-verified.exception';
import { ExpiredVerificationException } from '@identity-domain/verification/exceptions/expired-verification.exception';
import { InvalidVerificationTtlException } from '@identity-domain/verification/exceptions/invalid-verification-ttl.exception';
import { RevokedVerificationException } from '@identity-domain/verification/exceptions/revoked-verification.exception';

export class PhoneNumberVerificationEntity extends VerificationEntity<PhoneNumber> {
  private constructor(props: {
    id: AggregateId;
    userId: AggregateId;
    token: string;
    value: PhoneNumber;
    issuedAt: Date;
    expiresAt: Date;
    verifiedAt: Date | null;
    revokedAt: Date | null;
  }) {
    super(props);
  }

  protected _type: VerificationType = 'phone_number';

  public static create(props: {
    userId: AggregateId;
    token: string;
    value: PhoneNumber;
    ttl: number;
  }): PhoneNumberVerificationEntity {
    if (props.ttl <= 0) {
      throw new InvalidVerificationTtlException();
    }

    const now = new Date();

    const newVerification = new PhoneNumberVerificationEntity({
      id: uuidv7(),
      userId: props.userId,
      token: props.token,
      value: props.value,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + props.ttl),
      verifiedAt: null,
      revokedAt: null,
    });

    newVerification.pushDomainEvent(
      new PhoneNumberVerificationIssuedDomainEvent(newVerification.id, {
        userId: newVerification.userId,
        token: newVerification.token,
        value: newVerification.value.value,
        issuedAt: newVerification.issuedAt,
        expiresAt: newVerification.expiresAt,
      }),
    );

    return newVerification;
  }

  public static reconstitute(props: {
    id: AggregateId;
    userId: AggregateId;
    token: string;
    value: PhoneNumber;
    issuedAt: Date;
    expiresAt: Date;
    verifiedAt: Date | null;
    revokedAt: Date | null;
  }): PhoneNumberVerificationEntity {
    return new PhoneNumberVerificationEntity(props);
  }

  public verify(): void {
    if (this.isRevoked()) {
      throw new RevokedVerificationException();
    }

    if (this.isVerified()) {
      throw new AlreadyVerifiedException();
    }

    if (this.isExpired()) {
      throw new ExpiredVerificationException();
    }

    this._verifiedAt = new Date();

    this.pushDomainEvent(
      new PhoneNumberVerificationVerifiedDomainEvent(this._id, {
        verifiedAt: this._verifiedAt,
      }),
    );
  }

  public revoke(): void {
    if (this.isRevoked()) {
      throw new RevokedVerificationException();
    }

    if (this.isVerified()) {
      throw new AlreadyVerifiedException();
    }

    if (this.isExpired()) {
      throw new ExpiredVerificationException();
    }

    this._revokedAt = new Date();

    this.pushDomainEvent(
      new PhoneNumberVerificationRevokedDomainEvent(this._id, {
        revokedAt: this._revokedAt,
      }),
    );
  }
}
