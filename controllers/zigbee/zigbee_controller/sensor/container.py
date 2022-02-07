from dependency_injector import containers, providers

from .osram_switch_mini import OsramSwitchMiniSensor


class SensorContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )


def add_sensors(container):
    sensor_container = container.common().sensor()

    setattr(
        sensor_container,
        'osram_switch_mini_sensor',
        providers.Factory(
            OsramSwitchMiniSensor,
            controller=container.device.zigbee_controller
        )
    )
