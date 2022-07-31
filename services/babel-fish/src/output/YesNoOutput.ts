import { BaseOutput, Output, OutputTemplate } from '@jovotech/framework';

@Output()
export default class YesNoOutput extends BaseOutput {
  build(): OutputTemplate | OutputTemplate[] {
    return {
      quickReplies: ['yes', 'no'],
      listen: true,
    };
  }
}
