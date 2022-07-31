import { App } from '@jovotech/framework';

import GlobalComponent from './components/GlobalComponent';
import LoveHatePizzaComponent from './components/LoveHatePizzaComponent';

const app = new App({
  components: [GlobalComponent, LoveHatePizzaComponent],
  logging: true,
});

export default app;
