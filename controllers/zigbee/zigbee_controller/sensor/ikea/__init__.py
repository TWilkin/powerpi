from dependency_injector import providers

from .styrbar import IkeaStyrbarRemoteSensor


def add_ikea_sensors(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'ikea_styrbar_switch_sensor',
        providers.Factory(
            IkeaStyrbarRemoteSensor,
            logger=container.common.logger,
            zigbee_controller=container.device.zigbee_controller,
            mqtt_client=container.common.mqtt_client
        )
    )
