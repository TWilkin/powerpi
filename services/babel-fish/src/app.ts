import { App } from '@jovotech/framework';
import DevicePowerComponent from './components/DevicePowerComponent';
import GlobalComponent from './components/GlobalComponent';

const app = new App({
  components: [
    GlobalComponent, 
    DevicePowerComponent
  ],
  logging: true,
});

export default app;
