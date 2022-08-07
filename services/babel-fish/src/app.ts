import { App } from '@jovotech/framework';
import { AlexaPlatform } from '@jovotech/platform-alexa';
import DevicePowerComponent from './components/DevicePowerComponent';
import GlobalComponent from './components/GlobalComponent';

const app = new App({
  components: [
    GlobalComponent, 
    DevicePowerComponent
  ],
  plugins: [
    new AlexaPlatform({
      intentMap: {
        'AMAZON.StopIntent': 'END',
        'AMAZON.CancelIntent': 'END',
      },
    })
  ],
  logging: true,
});

export default app;
