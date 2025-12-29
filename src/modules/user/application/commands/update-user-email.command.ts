import { Command } from 'src/shared/application/base.command';

type Props = {
  email: string;
};

type Context = {
  userId: string;
};

export class UpdateUserEmailCommand extends Command<Props, Context> {
  constructor(props: Props, context: Context) {
    super(props, context);
  }
}
