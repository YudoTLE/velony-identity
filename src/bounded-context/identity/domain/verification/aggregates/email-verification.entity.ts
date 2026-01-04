import { type Email } from '@identity-domain/user/value-objects/email.vo';
import { UserId } from '@identity-domain/user/value-objects/user-id.vo';
import { VerificationEntity } from '@identity-domain/verification/aggregates/base-verification.entity';
import { type VerificationType } from '@identity-domain/verification/aggregates/base-verification.entity';
import { EmailVerificationIssuedDomainEvent } from '@identity-domain/verification/events/email-verification-issued.domain-event';
import { EmailVerificationRevokedDomainEvent } from '@identity-domain/verification/events/email-verification-revoked.domain-event';
import { EmailVerificationVerifiedDomainEvent } from '@identity-domain/verification/events/email-verification-verified.domain-event';
import { AlreadyVerifiedException } from '@identity-domain/verification/exceptions/already-verified.exception';
import { ExpiredVerificationException } from '@identity-domain/verification/exceptions/expired-verification.exception';
import { InvalidVerificationTtlException } from '@identity-domain/verification/exceptions/invalid-verification-ttl.exception';
import { RevokedVerificationException } from '@identity-domain/verification/exceptions/revoked-verification.exception';
import { VerificationId } from '@identity-domain/verification/value-objects/user-id.vo';

export class EmailVerificationEntity extends VerificationEntity<Email> {
  protected _type: VerificationType = 'email';

  private constructor(props: {
    id?: VerificationId;
    userId: UserId;
    token: string;
    value: Email;
    issuedAt: Date;
    expiresAt: Date;
    verifiedAt: Date | null;
    revokedAt: Date | null;
  }) {
    super({
      id: props.id ?? VerificationId.create(),
      userId: props.userId,
      token: props.token,
      value: props.value,
      issuedAt: props.issuedAt,
      expiresAt: props.expiresAt,
      verifiedAt: props.verifiedAt,
      revokedAt: props.revokedAt,
    });

    if (props.id === undefined) {
      this.pushDomainEvent(
        new EmailVerificationIssuedDomainEvent(this._id.value, {
          userId: this._userId.value,
          token: this._token,
          value: this._value.value,
          issuedAt: this._issuedAt,
          expiresAt: this._expiresAt,
        }),
      );
    }
  }

  public static create(props: {
    userId: UserId;
    token: string;
    value: Email;
    ttl: number;
  }): EmailVerificationEntity {
    if (props.ttl <= 0) {
      throw new InvalidVerificationTtlException();
    }

    const now = new Date();

    const newVerification = new EmailVerificationEntity({
      userId: props.userId,
      token: props.token,
      value: props.value,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + props.ttl),
      verifiedAt: null,
      revokedAt: null,
    });

    return newVerification;
  }

  public static reconstitute(props: {
    id: VerificationId;
    userId: UserId;
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
      new EmailVerificationVerifiedDomainEvent(this._id.value, {
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
      new EmailVerificationRevokedDomainEvent(this._id.value, {
        revokedAt: this._revokedAt,
      }),
    );
  }
}
