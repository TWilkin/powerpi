from dependency_injector import providers

from .aqara import add_aqara_sensors
from .osram import add_osram_sensors
from .sonoff import add_sonoff_sensors
from .zigbee_energy_monitor import ZigbeeEnergyMonitorSensor


def add_sensors(container):
    add_aqara_sensors(container)
    add_osram_sensors(container)
    add_sonoff_sensors(container)

    device_container = container.common().device()

    setattr(
        device_container,
        'zigbee_energy_monitor_sensor',
        providers.Factory(
            ZigbeeEnergyMonitorSensor,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            zigbee_controller=container.zigbee_controller
        )
    )
