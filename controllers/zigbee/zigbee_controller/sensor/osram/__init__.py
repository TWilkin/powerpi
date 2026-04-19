from dependency_injector import providers

from .switch_mini import OsramSwitchMiniSensor


def add_osram_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'osram_switch_mini_sensor',
        providers.Factory(
            OsramSwitchMiniSensor,
            controller=container.zigbee_controller
        )
    )
