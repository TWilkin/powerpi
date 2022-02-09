from dependency_injector import providers

from .osram_switch_mini import OsramSwitchMiniSensor


def add_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'osram_switch_mini_sensor',
        providers.Factory(
            OsramSwitchMiniSensor,
            controller=container.device.zigbee_controller,
            mqtt_client=container.common.mqtt_client
        )
    )
