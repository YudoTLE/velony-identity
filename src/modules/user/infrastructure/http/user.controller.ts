import { Body, Controller, Delete, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveUserPasswordCommand } from 'src/modules/user/application/commands/remove-user-password.command';
import { UpdateUserAvatarPathCommand } from 'src/modules/user/application/commands/update-user-avatar-path.command';
import { UpdateUserNameCommand } from 'src/modules/user/application/commands/update-user-name.command';
import { UpdateUserPasswordCommand } from 'src/modules/user/application/commands/update-user-password.command';
import { UpdateUserUsernameCommand } from 'src/modules/user/application/commands/update-user-username.command';

import { User } from './decorators/user.decorator';
import { RemoveUserPasswordDto } from './dtos/remove-user-password.dto';
import { UpdateUserAvatarPathDto } from './dtos/update-user-avatar-path.dto';
import { UpdateUserNameDto } from './dtos/update-user-name.dto';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';
import { UpdateUserUsernameDto } from './dtos/update-user-username.dto';

@Controller('users')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch('me/name')
  async updateName(
    @User('id') userId: string,
    @Body() dto: UpdateUserNameDto,
  ): Promise<void> {
    const command = new UpdateUserNameCommand({ name: dto.name }, { userId });
    await this.commandBus.execute(command);
  }

  @Patch('me/username')
  async updateUsername(
    @User('id') userId: string,
    @Body() dto: UpdateUserUsernameDto,
  ): Promise<void> {
    const command = new UpdateUserUsernameCommand(
      { username: dto.username },
      { userId },
    );
    await this.commandBus.execute(command);
  }

  @Patch('me/password')
  async updatePassword(
    @User('id') userId: string,
    @Body() dto: UpdateUserPasswordDto,
  ): Promise<void> {
    const command = new UpdateUserPasswordCommand(
      {
        currentPassword: dto.currentPassword,
        password: dto.password,
      },
      { userId },
    );
    await this.commandBus.execute(command);
  }

  @Delete('me/password')
  async removePassword(
    @User('id') userId: string,
    @Body() dto: RemoveUserPasswordDto,
  ): Promise<void> {
    const command = new RemoveUserPasswordCommand(
      { currentPassword: dto.currentPassword },
      { userId },
    );
    await this.commandBus.execute(command);
  }

  @Patch('me/avatar')
  async updateAvatarPath(
    @User('id') userId: string,
    @Body() dto: UpdateUserAvatarPathDto,
  ): Promise<void> {
    const command = new UpdateUserAvatarPathCommand(
      { avatarPath: dto.avatarPath },
      { userId },
    );
    await this.commandBus.execute(command);
  }
}
