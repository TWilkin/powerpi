from dependency_injector import providers

from .switch_mini import OsramSwitchMiniSensor


def add_osram_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'osram_switch_mini_sensor',
        providers.Factory(
            OsramSwitchMiniSensor,
            logger=container.common.logger,
            controller=container.zigbee_controller,
            mqtt_client=container.common.mqtt_client
        )
    )
