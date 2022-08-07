import { Component, BaseComponent, Global } from '@jovotech/framework';
import DevicePowerComponent from './DevicePowerComponent';

@Global()
@Component()
export default class GlobalComponent extends BaseComponent {
    LAUNCH() {
        return this.$redirect(DevicePowerComponent);
    }
}
