from dependency_injector import providers

from .hive_thermostat_sensor import HiveThermostatSensor


def add_sensors(container):
    device_container = container.device()

    setattr(
        device_container,
        'hive_thermostat_sensor',
        providers.Factory(
            HiveThermostatSensor,
            config=container.config,
            hive_client=device_container.hive_client
        )
    )
