import { AggregateRoot, StoragePath } from '@velony/domain';

import { LocalAuthenticationEntity } from '@identity-domain/user/aggregates/local-authentication.entity';
import { UserAvatarPathUpdatedDomainEvent } from '@identity-domain/user/events/user-avatar-path-updated.domain-event';
import { UserCreatedDomainEvent } from '@identity-domain/user/events/user-created.domain-event';
import { UserEmailUpdatedDomainEvent } from '@identity-domain/user/events/user-email-updated.domain-event';
import { UserNameUpdatedDomainEvent } from '@identity-domain/user/events/user-name-updated.domain-event';
import { UserPhoneNumberUpdatedDomainEvent } from '@identity-domain/user/events/user-phone-number-updated.domain-event';
import { UserUsernameUpdatedDomainEvent } from '@identity-domain/user/events/user-username-updated.domain-event';
import { InvalidPasswordException } from '@identity-domain/user/exceptions/invalid-password.exception';
import { LocalAuthenticationAlreadyExistsException } from '@identity-domain/user/exceptions/local-authentication-already-exists.exception';
import { LocalAuthenticationNotFoundException } from '@identity-domain/user/exceptions/local-authentication-not-found.exception';
import { NoAuthenticationMethodException } from '@identity-domain/user/exceptions/no-authentication-method.exception';
import { type Email } from '@identity-domain/user/value-objects/email.vo';
import { type Name } from '@identity-domain/user/value-objects/name.vo';
import { type Password } from '@identity-domain/user/value-objects/password.vo';
import { type PhoneNumber } from '@identity-domain/user/value-objects/phone-number.vo';
import { UserId } from '@identity-domain/user/value-objects/user-id.vo';
import { type Username } from '@identity-domain/user/value-objects/username.vo';

export type UserAuthentication = {
  local?: LocalAuthenticationEntity;
};

export class UserEntity extends AggregateRoot<UserId> {
  private _name: Name;

  private _username: Username;

  private _avatarPath: StoragePath | null;

  private _email: Email | null;

  private _phoneNumber: PhoneNumber | null;

  private _createdAt: Date;

  private _updatedAt: Date;

  private _deletedAt: Date | null;

  private _authentication: UserAuthentication;

  private constructor(props: {
    id?: UserId;
    name: Name;
    username: Username;
    avatarPath: StoragePath | null;
    email: Email | null;
    phoneNumber: PhoneNumber | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    authentication: UserAuthentication;
  }) {
    super(props.id ?? UserId.create());
    this._name = props.name;
    this._username = props.username;
    this._avatarPath = props.avatarPath;
    this._email = props.email;
    this._phoneNumber = props.phoneNumber;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._deletedAt = props.deletedAt;
    this._authentication = props.authentication;

    if (props.id === undefined) {
      this.pushDomainEvent(
        new UserCreatedDomainEvent(this._id.value, {
          name: this._name.value,
          username: this._username.value,
          avatarPath: this._avatarPath?.value,
          email: this._email?.value,
          phoneNumber: this._phoneNumber?.value,
        }),
      );
    }
  }

  public get name(): Name {
    return this._name;
  }

  public get username(): Username {
    return this._username;
  }

  public get avatarPath(): StoragePath | null {
    return this._avatarPath;
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

  public get authentication(): UserAuthentication {
    return Object.freeze(this._authentication);
  }

  public static async registerLocal(props: {
    name: Name;
    username: Username;
    password: Password;
  }): Promise<UserEntity> {
    const now = new Date();

    const newUser = new UserEntity({
      name: props.name,
      username: props.username,
      avatarPath: null,
      email: null,
      phoneNumber: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      authentication: {
        local: await LocalAuthenticationEntity.create({
          password: props.password,
        }),
      },
    });

    return newUser;
  }

  public static reconstitute(props: {
    id: UserId;
    name: Name;
    username: Username;
    avatarPath: StoragePath | null;
    email: Email | null;
    phoneNumber: PhoneNumber | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    authentication: UserAuthentication;
  }): UserEntity {
    return new UserEntity(props);
  }

  public updateName(newName: Name): void {
    this._name = newName;
    this._updatedAt = new Date();

    this.pushDomainEvent(
      new UserNameUpdatedDomainEvent(this._id.value, {
        name: this._name.value,
      }),
    );
  }

  public updateUsername(newUsername: Username): void {
    this._username = newUsername;
    this._updatedAt = new Date();

    this.pushDomainEvent(
      new UserUsernameUpdatedDomainEvent(this._id.value, {
        username: this._username.value,
      }),
    );
  }

  public async updateAvatarPath(newAvatarPath: StoragePath): Promise<void> {
    this._avatarPath = newAvatarPath;
    this._updatedAt = new Date();

    this.pushDomainEvent(
      new UserAvatarPathUpdatedDomainEvent(this._id.value, {
        avatarPath: this._avatarPath.value,
      }),
    );
  }

  public updateEmail(newEmail: Email): void {
    this._email = newEmail;
    this._updatedAt = new Date();

    this.pushDomainEvent(
      new UserEmailUpdatedDomainEvent(this._id.value, {
        email: this._email.value,
      }),
    );
  }

  public updatePhoneNumber(newPhoneNumber: PhoneNumber): void {
    this._phoneNumber = newPhoneNumber;
    this._updatedAt = new Date();

    this.pushDomainEvent(
      new UserPhoneNumberUpdatedDomainEvent(this._id.value, {
        phoneNumber: this._phoneNumber.value,
      }),
    );
  }

  public async addLocalAuthentication(newPassword: Password): Promise<void> {
    if (this._authentication.local) {
      throw new LocalAuthenticationAlreadyExistsException();
    }

    this._authentication.local = await LocalAuthenticationEntity.create({
      password: newPassword,
    });
  }

  public async updateLocalAuthentication(
    currentPassword: Password,
    newPassword: Password,
  ): Promise<void> {
    if (!this._authentication.local) {
      throw new LocalAuthenticationNotFoundException();
    }

    const isValid =
      await this._authentication.local.verifyPassword(currentPassword);
    if (!isValid) {
      throw new InvalidPasswordException();
    }

    await this._authentication.local.updatePassword(newPassword);
  }

  public async removeLocalAuthentication(
    currentPassword: Password,
  ): Promise<void> {
    if (!this._authentication.local) {
      throw new LocalAuthenticationNotFoundException();
    }

    const isValid =
      await this._authentication.local.verifyPassword(currentPassword);
    if (!isValid) {
      throw new InvalidPasswordException();
    }

    this.validateAuthenticationMethod({ authentication: { local: undefined } });

    this._authentication.local = undefined;
  }

  private validateAuthenticationMethod(overrides?: {
    authentication?: UserAuthentication;
  }): void {
    const localAuthentication = Boolean(
      overrides?.authentication?.local ?? this._authentication.local,
    );

    if (!localAuthentication) {
      throw new NoAuthenticationMethodException();
    }
  }
}
