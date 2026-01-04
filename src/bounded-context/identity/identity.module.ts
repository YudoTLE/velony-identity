import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

import { CookieService } from '@common/services/cookie.service';

import { CreateEmailVerificationHandler } from '@identity-application/commands/create-email-verification/create-email-verification.handler';
import { LoginLocalHandler } from '@identity-application/commands/login-local/login-local.handler';
import { RefreshTokenHandler } from '@identity-application/commands/refresh-token/refresh-token.handler';
import { RegisterLocalHandler } from '@identity-application/commands/register-local/register-local.handler';
import { RemoveUserPasswordHandler } from '@identity-application/commands/remove-user-password/remove-user-password.handler';
import { UpdateUserAvatarPathHandler } from '@identity-application/commands/update-user-avatar-path/update-user-avatar-path.handler';
import { UpdateUserEmailHandler } from '@identity-application/commands/update-user-email/update-user-email.handler';
import { UpdateUserNameHandler } from '@identity-application/commands/update-user-name/update-user-name.handler';
import { UpdateUserPasswordHandler } from '@identity-application/commands/update-user-password/update-user-password.handler';
import { UpdateUserPhoneNumberHandler } from '@identity-application/commands/update-user-phone-number/update-user-phone-number.handler';
import { UpdateUserUsernameHandler } from '@identity-application/commands/update-user-username/update-user-username.handler';
import { VerifyEmailHandler } from '@identity-application/commands/verify-email-verification/verify-email-verification.handler';
import { TokenService } from '@identity-application/services/token.service';
import { UserRepository } from '@identity-domain/user/repositories/user.repository';
import { VerificationRepository } from '@identity-domain/verification/repositories/verification.repository';
import { EmailVerificationIssuedEventHandler } from '@identity-infrastructure/events-handlers/email-verification-issued.event-handler';
import { EmailVerificationVerifiedEventHandler } from '@identity-infrastructure/events-handlers/email-verification-verified.event-handler';
import { UserAvatarPathUpdatedEventHandler } from '@identity-infrastructure/events-handlers/user-avatar-path-updated.event-handler';
import { UserCreatedEventHandler } from '@identity-infrastructure/events-handlers/user-created.event-handler';
import { UserEmailUpdatedEventHandler } from '@identity-infrastructure/events-handlers/user-email-updated.event-handler';
import { UserNameUpdatedEventHandler } from '@identity-infrastructure/events-handlers/user-name-updated.event-handler';
import { UserPasswordRemovedEventHandler } from '@identity-infrastructure/events-handlers/user-password-removed.event-handler';
import { UserPasswordUpdatedEventHandler } from '@identity-infrastructure/events-handlers/user-password-updated.event-handler';
import { UserPhoneNumberUpdatedEventHandler } from '@identity-infrastructure/events-handlers/user-phone-number-updated.event-handler';
import { UserUsernameUpdatedEventHandler } from '@identity-infrastructure/events-handlers/user-username-updated.event-handler';
import { AuthController } from '@identity-infrastructure/http/controllers/auth.controller';
import { UserController } from '@identity-infrastructure/http/controllers/user.controller';
import { KafkaModule } from '@identity-infrastructure/messaging/kafka/kafka.module';
import { PgModule } from '@identity-infrastructure/persistence/pg/pg.module';
import { PgUserRepository } from '@identity-infrastructure/persistence/pg/repositories/pg-user.repository';
import { PgVerificationRepository } from '@identity-infrastructure/persistence/pg/repositories/pg-verification.repository';
import { CookieAuthService } from '@identity-infrastructure/services/cookie-auth.service';
import { JwtTokenService } from '@identity-infrastructure/services/jwt-token.service';
import { S3Module } from '@identity-infrastructure/storage/s3/s3.module';

const CommandHandlers = [
  CreateEmailVerificationHandler,
  LoginLocalHandler,
  RefreshTokenHandler,
  RegisterLocalHandler,
  RemoveUserPasswordHandler,
  UpdateUserAvatarPathHandler,
  UpdateUserEmailHandler,
  UpdateUserNameHandler,
  UpdateUserPasswordHandler,
  UpdateUserPhoneNumberHandler,
  UpdateUserUsernameHandler,
  VerifyEmailHandler,
];

const EventHandlers = [
  EmailVerificationIssuedEventHandler,
  EmailVerificationVerifiedEventHandler,
  UserAvatarPathUpdatedEventHandler,
  UserCreatedEventHandler,
  UserEmailUpdatedEventHandler,
  UserNameUpdatedEventHandler,
  UserPasswordRemovedEventHandler,
  UserPasswordUpdatedEventHandler,
  UserPhoneNumberUpdatedEventHandler,
  UserUsernameUpdatedEventHandler,
];

const Controllers = [AuthController, UserController];

const Repositories = [
  {
    provide: UserRepository,
    useClass: PgUserRepository,
  },
  {
    provide: VerificationRepository,
    useClass: PgVerificationRepository,
  },
];

const Services = [
  {
    provide: TokenService,
    useClass: JwtTokenService,
  },
  CookieService,
  CookieAuthService,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({}),
    PgModule,
    KafkaModule,
    S3Module,
  ],
  controllers: [...Controllers],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    ...Repositories,
    ...Services,
  ],
})
export class IdentityModule {}
