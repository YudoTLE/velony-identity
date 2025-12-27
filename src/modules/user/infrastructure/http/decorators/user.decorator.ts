import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UnauthenticatedException } from 'src/modules/auth/domain/exceptions/unauthenticated.exception';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new UnauthenticatedException();

    // eslint-disable-next-line security/detect-object-injection
    return data ? user[data] : user;
  },
);
