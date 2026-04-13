from dependency_injector import providers

from virtual_controller.sensor.geofence import GeofenceSensor


def add_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'geofence_sensor',
        providers.Factory(
            GeofenceSensor,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            variable_manager=container.common.variable.variable_manager
        )
    )
