from dependency_injector import providers

from .door_window_sensor import AqaraDoorWindowSensor


def add_aqara_sensors(container):
    device_container = container.common().device()

    for sensor_type in ['door', 'window']:
        setattr(
            device_container,
            f'aqara_{sensor_type}_sensor',
            providers.Factory(
                AqaraDoorWindowSensor,
                logger=container.common.logger,
                controller=container.device.zigbee_controller,
                mqtt_client=container.common.mqtt_client
            )
        )
