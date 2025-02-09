from dependency_injector import providers

from .switch import SonoffSwitch


def add_sonoff_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'sonoff_switch_sensor',
        providers.Factory(
            SonoffSwitch,
            logger=container.common.logger,
            zigbee_controller=container.device.zigbee_controller,
            mqtt_client=container.common.mqtt_client
        )
    )
