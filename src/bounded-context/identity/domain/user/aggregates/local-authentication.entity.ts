import { Entity } from '@velony/domain';

import { LocalAuthenticationId } from '@identity-domain/user/value-objects/local-authentication-id.vo';
import { type PasswordHash } from '@identity-domain/user/value-objects/password-hash.vo';
import { type Password } from '@identity-domain/user/value-objects/password.vo';

export class LocalAuthenticationEntity extends Entity<LocalAuthenticationId> {
  private _passwordHash: PasswordHash;

  private _lastUsedAt: Date;

  private _createdAt: Date;

  private _updatedAt: Date;

  private constructor(props: {
    id?: LocalAuthenticationId;
    passwordHash: PasswordHash;
    lastUserAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(props.id ?? LocalAuthenticationId.create());
    this._passwordHash = props.passwordHash;
    this._lastUsedAt = props.lastUserAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public get passwordHash(): PasswordHash {
    return this._passwordHash;
  }

  public get lastUsedAt(): Date {
    return this._lastUsedAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public static async create(props: {
    password: Password;
  }): Promise<LocalAuthenticationEntity> {
    const now = new Date();

    const newUser = new LocalAuthenticationEntity({
      passwordHash: await props.password.toHash(),
      lastUserAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return newUser;
  }

  public static reconstitute(props: {
    id: LocalAuthenticationId;
    passwordHash: PasswordHash;
    lastUserAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): LocalAuthenticationEntity {
    return new LocalAuthenticationEntity(props);
  }

  public async verifyPassword(password: Password): Promise<boolean> {
    return this._passwordHash.verify(password);
  }

  public async updatePassword(newPassword: Password): Promise<void> {
    const now = new Date();

    this._passwordHash = await newPassword.toHash();
    this._updatedAt = now;
  }
}
