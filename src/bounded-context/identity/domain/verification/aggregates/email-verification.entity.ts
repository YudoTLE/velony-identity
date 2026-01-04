import { v7 as uuidv7 } from 'uuid';

import { type AggregateId } from '@shared-kernel/libs/entity';

import { type Email } from '@identity-domain/user/value-objects/email.vo';
import { VerificationEntity } from '@identity-domain/verification/aggregates/base-verification.entity';
import { type VerificationType } from '@identity-domain/verification/aggregates/base-verification.entity';
import { EmailVerificationIssuedDomainEvent } from '@identity-domain/verification/events/email-verification-issued.domain-event';
import { EmailVerificationRevokedDomainEvent } from '@identity-domain/verification/events/email-verification-revoked.domain-event';
import { EmailVerificationVerifiedDomainEvent } from '@identity-domain/verification/events/email-verification-verified.domain-event';
import { AlreadyVerifiedException } from '@identity-domain/verification/exceptions/already-verified.exception';
import { ExpiredVerificationException } from '@identity-domain/verification/exceptions/expired-verification.exception';
import { InvalidVerificationTtlException } from '@identity-domain/verification/exceptions/invalid-verification-ttl.exception';
import { RevokedVerificationException } from '@identity-domain/verification/exceptions/revoked-verification.exception';

export class EmailVerificationEntity extends VerificationEntity<Email> {
  private constructor(props: {
    id: AggregateId;
    userId: AggregateId;
    token: string;
    value: Email;
    issuedAt: Date;
    expiresAt: Date;
    verifiedAt: Date | null;
    revokedAt: Date | null;
  }) {
    super(props);
  }

  protected _type: VerificationType = 'email';

  public static create(props: {
    userId: AggregateId;
    token: string;
    value: Email;
    ttl: number;
  }): EmailVerificationEntity {
    if (props.ttl <= 0) {
      throw new InvalidVerificationTtlException();
    }

    const now = new Date();

    const newVerification = new EmailVerificationEntity({
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
      new EmailVerificationIssuedDomainEvent(newVerification.id, {
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
    value: Email;
    issuedAt: Date;
    expiresAt: Date;
    verifiedAt: Date | null;
    revokedAt: Date | null;
  }): EmailVerificationEntity {
    return new EmailVerificationEntity(props);
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
      new EmailVerificationVerifiedDomainEvent(this._id, {
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
      new EmailVerificationRevokedDomainEvent(this._id, {
        revokedAt: this._revokedAt,
      }),
    );
  }
}
