import { Component, BaseComponent, Intents } from '@jovotech/framework';
import YesNoOutput from '../output/YesNoOutput';

@Component()
export default class LoveHatePizzaComponent extends BaseComponent {
  START() {
    return this.$send(YesNoOutput, { message: 'Do you like pizza?' });
  }

  @Intents(['YesIntent'])
  lovesPizza() {
    return this.$send({ message: 'Yes! I love pizza, too.', listen: false });
  }

  @Intents(['NoIntent'])
  hatesPizza() {
    return this.$send({ message: `That's OK! Not everyone likes pizza.`, listen: false });
  }

  UNHANDLED() {
    return this.START();
  }
}
