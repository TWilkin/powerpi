import { Component, BaseComponent, Global } from '@jovotech/framework';
import LoveHatePizzaComponent from './LoveHatePizzaComponent';

@Global()
@Component()
export default class GlobalComponent extends BaseComponent {
  LAUNCH() {
    return this.$redirect(LoveHatePizzaComponent);
  }
}
