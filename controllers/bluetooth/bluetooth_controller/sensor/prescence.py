from bluetooth_controller.bluetooth import BluetoothMixin
from powerpi_common.config import Config
from powerpi_common.device.mixin.pollable import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt.client import MQTTClient
from powerpi_common.sensor import Sensor


class BluetoothPresenceSensor(Sensor, PollableMixin, BluetoothMixin):
    '''
    Adds support for using a Bluetooth radio to detect the presence of a device (mobile phone).

    Will generate the following message when detecting the device:
    /event/NAME/presence:{"state": "detected"}

    Will generate the following message when not detecting the device:
    /event/NAME/presence:{"state": "undetected"}
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)
        BluetoothMixin.__init__(self, **kwargs)

        self._logger = logger
        self._state = None

    @property
    def state(self):
        return self._state

    async def poll(self):
        device = await self._get_bluetooth_device()

        present = device is not None
        new_state = 'detected' if present else 'undetected'

        # we only want to send the message if the state has changed
        if new_state == self._state:
            return

        self._state = new_state

        message = {
            'state': self._state
        }

        self._broadcast('presence', message)
