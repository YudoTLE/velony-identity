import { AsyncLocalStorage } from 'async_hooks';

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

import { CookieService } from '@common/services/cookie.service';

import { IssueEmailChangeHandler } from '@identity-application/commands/issue-email-change/issue-email-change.handler';
import { LoginLocalHandler } from '@identity-application/commands/login-local/login-local.handler';
import { RefreshTokenHandler } from '@identity-application/commands/refresh-token/refresh-token.handler';
import { RegisterLocalHandler } from '@identity-application/commands/register-local/register-local.handler';
import { RemoveUserPasswordHandler } from '@identity-application/commands/remove-user-password/remove-user-password.handler';
import { UpdateUserAvatarPathHandler } from '@identity-application/commands/update-user-avatar-path/update-user-avatar-path.handler';
import { UpdateUserEmailHandler } from '@identity-application/commands/update-user-email/update-user-email.handler';
import { UpdateUserNameHandler } from '@identity-application/commands/update-user-name/update-user-name.handler';
import { UpdateUserPasswordHandler } from '@identity-application/commands/update-user-password/update-user-password.handler';
import { UpdateUserUsernameHandler } from '@identity-application/commands/update-user-username/update-user-username.handler';
import { PersistenceService } from '@identity-application/services/persistence.service';
import { TokenService } from '@identity-application/services/token.service';
import { UserRepository } from '@identity-domain/user/repositories/user.repository';
import { EmailVerificationRepository } from '@identity-domain/verification/repositories/email-verification.repository';
import { PhoneNumberVerificationRepository } from '@identity-domain/verification/repositories/phone-number-verification.repository';
import { AuthController } from '@identity-infrastructure/http/controllers/auth.controller';
import { UserController } from '@identity-infrastructure/http/controllers/user.controller';
import { KafkaModule } from '@identity-infrastructure/messaging/kafka/kafka.module';
import { PgModule } from '@identity-infrastructure/persistence/pg/pg.module';
import { PgService } from '@identity-infrastructure/persistence/pg/pg.service';
import { PgEmailVerificationRepository } from '@identity-infrastructure/persistence/pg/repositories/pg-email-verification.repository';
import { PgPhoneNumberVerificationRepository } from '@identity-infrastructure/persistence/pg/repositories/pg-phone-number-verification.repository';
import { PgUserRepository } from '@identity-infrastructure/persistence/pg/repositories/pg-user.repository';
import { CookieAuthService } from '@identity-infrastructure/services/cookie-auth.service';
import { JwtTokenService } from '@identity-infrastructure/services/jwt-token.service';
import { S3Module } from '@identity-infrastructure/storage/s3/s3.module';

const CommandHandlers = [
  IssueEmailChangeHandler,
  LoginLocalHandler,
  RefreshTokenHandler,
  RegisterLocalHandler,
  RemoveUserPasswordHandler,
  UpdateUserAvatarPathHandler,
  UpdateUserEmailHandler,
  UpdateUserNameHandler,
  UpdateUserPasswordHandler,
  UpdateUserUsernameHandler,
];

const Controllers = [AuthController, UserController];

const Repositories = [
  {
    provide: UserRepository,
    useClass: PgUserRepository,
  },
  {
    provide: EmailVerificationRepository,
    useClass: PgEmailVerificationRepository,
  },
  {
    provide: PhoneNumberVerificationRepository,
    useClass: PgPhoneNumberVerificationRepository,
  },
];

const Services = [
  {
    provide: TokenService,
    useClass: JwtTokenService,
  },
  {
    provide: PersistenceService,
    useClass: PgService,
  },
  {
    provide: AsyncLocalStorage,
    useValue: new AsyncLocalStorage(),
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
  providers: [...CommandHandlers, ...Repositories, ...Services],
})
export class IdentityModule {}
