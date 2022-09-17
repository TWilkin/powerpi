from bluetooth_controller.device import BluetoothController
from powerpi_common.logger import Logger
from powerpi_common.mqtt.client import MQTTClient
from powerpi_common.sensor import Sensor


class BluetoothPresenceSensor(Sensor):
    def __init__(
        self,
        logger: Logger,
        controller: BluetoothController,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)

        self._logger = logger
        self._controller = controller
