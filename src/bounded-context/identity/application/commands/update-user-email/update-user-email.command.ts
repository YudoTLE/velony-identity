import { Command } from '@shared-kernel/libs/command';
import { type AggregateId } from '@shared-kernel/libs/entity';

type Props = {
  token: string;
};

type Context = {
  userId: AggregateId;
};

export class UpdateUserEmailCommand extends Command<Props, Context> {
  constructor(props: Props, context: Context) {
    super(props, context);
  }
}
