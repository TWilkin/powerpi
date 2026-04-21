from dependency_injector import providers

from .switch import SonoffSwitchSensor


def add_sonoff_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'sonoff_switch_sensor',
        providers.Factory(
            SonoffSwitchSensor,
            zigbee_controller=container.zigbee_controller
        )
    )
