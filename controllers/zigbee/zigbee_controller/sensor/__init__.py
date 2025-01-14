from dependency_injector import providers

from .aqara import add_aqara_sensors
from .osram import add_osram_sensors
from .zigbee_energy_monitor import ZigbeeEnergyMonitor


def add_sensors(container):
    add_aqara_sensors(container)
    add_osram_sensors(container)

    device_container = container.common().device()

    setattr(
        device_container,
        'zigbee_energy_monitor',
        providers.Factory(
            ZigbeeEnergyMonitor,
            logger=container.common.logger,
            controller=container.device.zigbee_controller,
            mqtt_client=container.common.mqtt_client
        )
    )
