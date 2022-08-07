import { App } from '@jovotech/framework';
import { AlexaPlatform } from '@jovotech/platform-alexa';
import DevicePowerComponent from './components/DevicePowerComponent';
import ErrorComponent from './components/ErrorComponent';
import GlobalComponent from './components/GlobalComponent';
import LoginComponent from './components/LoginComponent';

const app = new App({
  components: [
    ErrorComponent,
    DevicePowerComponent,
    GlobalComponent, 
    LoginComponent
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
