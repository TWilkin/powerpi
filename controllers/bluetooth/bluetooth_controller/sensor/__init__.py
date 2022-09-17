from bluetooth_controller.sensor.prescence import BluetoothPresenceSensor
from dependency_injector import providers


def add_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'bluetooth_presence_sensor',
        providers.Factory(
            BluetoothPresenceSensor,
            config=device_container.config,
            logger=device_container.logger,
            mqtt_client=container.common.mqtt_client
        )
    )
