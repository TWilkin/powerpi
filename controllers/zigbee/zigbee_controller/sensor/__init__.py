from dependency_injector import providers

from .aqara import add_aqara_sensors
from .ikea import add_ikea_sensors
from .osram import add_osram_sensors
from .sonoff import add_sonoff_sensors
from .zigbee_energy_monitor import ZigbeeEnergyMonitorSensor
from .zigbee_environment import ZigbeeEnvironmentSensor


def add_sensors(container):
    add_aqara_sensors(container)
    add_ikea_sensors(container)
    add_osram_sensors(container)
    add_sonoff_sensors(container)

    device_container = container.common().device()

    setattr(
        device_container,
        'zigbee_energy_monitor_sensor',
        providers.Factory(
            ZigbeeEnergyMonitorSensor,
            zigbee_controller=container.zigbee_controller
        )
    )

    setattr(
        device_container,
        'zigbee_environment_sensor',
        providers.Factory(
            ZigbeeEnvironmentSensor,
            zigbee_controller=container.zigbee_controller
        )
    )
