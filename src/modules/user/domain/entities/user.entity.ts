import { DomainEvent } from 'src/shared/domain/base.domain-event';
import { AggregateId, Entity } from 'src/shared/domain/base.entity';
import { StoragePath } from 'src/shared/domain/value-objects/storage-path.vo';
import { v7 as uuidv7 } from 'uuid';

import { UserAvatarPathUpdatedDomainEvent } from '../events/user-avatar-path-updated.domain-event';
import { UserCreatedDomainEvent } from '../events/user-created.domain-event';
import { UserEmailUpdatedDomainEvent } from '../events/user-email-updated.domain-event';
import { UserNameUpdatedDomainEvent } from '../events/user-name-updated.domain-event';
import { UserPasswordRemovedDomainEvent } from '../events/user-password-removed.domain-event';
import { UserPasswordUpdatedDomainEvent } from '../events/user-password-updated.domain-event';
import { UserPhoneNumberUpdatedDomainEvent } from '../events/user-phone-number-updated.domain-event';
import { UserUsernameUpdatedDomainEvent } from '../events/user-username-updated.domain-event';
import { InvalidPasswordException } from '../exceptions/invalid-password.exception';
import { MissingAuthenticationMethodException } from '../exceptions/missing-authentication-method.exception';
import { Email } from '../value-objects/email.vo';
import { Name } from '../value-objects/name.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { Password } from '../value-objects/password.vo';
import { PhoneNumber } from '../value-objects/phone-number.vo';
import { Username } from '../value-objects/username.vo';

export class UserEntity extends Entity {
  private constructor(props: {
    id: AggregateId;
    name: Name;
    username: Username;
    avatarPath?: StoragePath | null;
    passwordHash?: PasswordHash | null;
    email?: Email | null;
    phoneNumber?: PhoneNumber | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }) {
    const now = new Date();

    super(props.id);
    this._domainEvents = [];
    this._name = props.name;
    this._username = props.username;
    this._avatarPath = props.avatarPath ?? null;
    this._passwordHash = props.passwordHash ?? null;
    this._email = props.email ?? null;
    this._phoneNumber = props.phoneNumber ?? null;
    this._createdAt = props.createdAt ?? now;
    this._updatedAt = props.updatedAt ?? now;
    this._deletedAt = props.deletedAt ?? null;
  }
  private _domainEvents: DomainEvent[];

  private _name: Name;

  private _username: Username;

  private _avatarPath: StoragePath | null;

  private _passwordHash: PasswordHash | null;

  private _email: Email | null;

  private _phoneNumber: PhoneNumber | null;

  private _createdAt: Date;

  private _updatedAt: Date;

  private _deletedAt: Date | null;

  public get name(): Name {
    return this._name;
  }

  public get username(): Username {
    return this._username;
  }

  public get avatarPath(): StoragePath | null {
    return this._avatarPath;
  }

  public get passwordHash(): PasswordHash | null {
    return this._passwordHash;
  }

  public get email(): Email | null {
    return this._email;
  }

  public get phoneNumber(): PhoneNumber | null {
    return this._phoneNumber;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get deletedAt(): Date | null {
    return this._deletedAt;
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public static async create(props: {
    name: Name;
    username: Username;
    avatarPath?: StoragePath | null;
    password?: Password | null;
    email?: Email | null;
    phoneNumber?: PhoneNumber | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }): Promise<UserEntity> {
    const newUser = new UserEntity({
      id: uuidv7(),
      name: props.name,
      username: props.username,
      avatarPath: props.avatarPath,
      passwordHash: (await props.password?.toHash()) ?? null,
      email: props.email,
      phoneNumber: props.phoneNumber,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });

    newUser.addDomainEvent(
      new UserCreatedDomainEvent(newUser.id, {
        name: newUser.name.value,
        username: newUser.username.value,
        avatarPath: newUser.avatarPath?.value,
        email: newUser.email?.value,
        phoneNumber: newUser.phoneNumber?.value,
      }),
    );

    return newUser;
  }

  public static reconstitute(props: {
    id: AggregateId;
    name: Name;
    username: Username;
    avatarPath: StoragePath | null;
    passwordHash: PasswordHash | null;
    email: Email | null;
    phoneNumber: PhoneNumber | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): UserEntity {
    return new UserEntity(props);
  }

  public updateName(newName: Name): void {
    this._name = newName;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserNameUpdatedDomainEvent(this._id, { name: this._name.value }),
    );
  }

  public updateUsername(newUsername: Username): void {
    this._username = newUsername;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserUsernameUpdatedDomainEvent(this._id, {
        username: this._username.value,
      }),
    );
  }

  public hasPassword(): boolean {
    return this._passwordHash !== null;
  }

  public async verifyPassword(password: Password): Promise<boolean> {
    return (
      this._passwordHash !== null && (await this._passwordHash.verify(password))
    );
  }

  public async updatePassword(
    currentPassword: Password,
    newPassword: Password,
  ): Promise<void> {
    const isCurrentPasswordValid = Boolean(
      await this._passwordHash?.verify(currentPassword),
    );
    if (!isCurrentPasswordValid) {
      throw new InvalidPasswordException();
    }

    this._passwordHash = await newPassword.toHash();
    this._updatedAt = new Date();

    this.addDomainEvent(new UserPasswordUpdatedDomainEvent(this._id));
  }

  public async removePassword(currentPassword: Password): Promise<void> {
    const isCurrentPasswordValid = Boolean(
      await this._passwordHash?.verify(currentPassword),
    );
    if (!isCurrentPasswordValid) {
      throw new InvalidPasswordException();
    }

    this.validateAuthenticationMethod({ passwordHash: null });

    this._passwordHash = null;
    this._updatedAt = new Date();

    this.addDomainEvent(new UserPasswordRemovedDomainEvent(this._id));
  }

  public async updateAvatarPath(newAvatarPath: StoragePath): Promise<void> {
    this._avatarPath = newAvatarPath;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserAvatarPathUpdatedDomainEvent(this._id, {
        avatarPath: this._avatarPath.value,
      }),
    );
  }

  public updateEmail(newEmail: Email): void {
    this._email = newEmail;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserEmailUpdatedDomainEvent(this._id, {
        email: this._email.value,
      }),
    );
  }

  public updatePhoneNumber(newPhoneNumber: PhoneNumber): void {
    this._phoneNumber = newPhoneNumber;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserPhoneNumberUpdatedDomainEvent(this._id, {
        phoneNumber: this._phoneNumber.value,
      }),
    );
  }

  private validateAuthenticationMethod(overrides?: {
    passwordHash?: PasswordHash | null;
    email?: Email | null;
    phoneNumber?: PhoneNumber | null;
  }): void {
    const passwordHash = overrides?.passwordHash ?? this._passwordHash;
    const email = overrides?.email ?? this._email;
    const phoneNumber = overrides?.phoneNumber ?? this._phoneNumber;

    if (passwordHash === null && email === null && phoneNumber === null) {
      throw new MissingAuthenticationMethodException();
    }
  }
}
