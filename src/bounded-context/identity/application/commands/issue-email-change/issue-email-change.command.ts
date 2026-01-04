import { Command } from '@shared-kernel/libs/command';

type Props = {
  userId: string;
  email: string;
  ttl: number;
};

type Context = {
  userId: string;
};

export class IssueEmailChangeCommand extends Command<Props, Context> {
  constructor(props: Props, context: Context) {
    super(props, context);
  }
}
