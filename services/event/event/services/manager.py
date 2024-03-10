from typing import List

from powerpi_common.config import Config
from powerpi_common.device import DeviceConfigType, DeviceNotFoundException
from powerpi_common.logger import Logger, LogMixin
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import VariableManager

from event.services.action import ActionFactory
from event.services.consumer import EventConsumer
from event.services.handler import EventHandler


class EventManager(LogMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        variable_manager: VariableManager,
        action_factory: ActionFactory,
    ):
        # pylint: disable=too-many-arguments
        self.__config = config
        self._logger = logger
        self.__mqtt_client = mqtt_client
        self.__variable_manager = variable_manager
        self.__action_factory = action_factory

        self.__consumers = []

    @property
    def consumers(self):
        return self.__consumers

    def load(self):
        devices = self.__load_devices()

        listeners = self.__config.events['listeners']

        # iterate over the configuration events and create listeners
        handlers = {}
        for listener in listeners:
            # set the topic to listen to
            topic = listener['topic']
            topic = f'event/{topic}'

            events: List[EventHandler] = []
            for event in listener['events']:
                # see if we can find the device
                device_name = event['action']['device']
                if device_name not in devices:
                    raise DeviceNotFoundException(
                        DeviceConfigType.DEVICE, device_name
                    )
                device = self.__variable_manager.get_device(device_name)

                # choose an action
                action = self.__action_factory.build(event['action'])

                handler = EventHandler(
                    self._logger, self.__variable_manager, device, event['condition'], action
                )

                # only append the handler if it's going to work
                if handler.validate():
                    events.append(handler)

            if len(events) > 0:
                if topic not in handlers:
                    handlers[topic] = []
                handlers[topic] += events

        # now we have everything initialised create and register the consumers
        # we do this late so any variables will pick up initial messages if the topic is used twice
        for topic, events in handlers.items():
            consumer = EventConsumer(
                self.__config, self._logger, topic, events
            )
            self.__mqtt_client.add_consumer(consumer)
            self.__consumers.append(consumer)

            self._logger.info(
                f'Found listener {consumer} with {len(events)} event(s)'
            )

        self._logger.info(
            f'Found {len(self.__consumers)} matching listener(s)'
        )

    def __load_devices(self):
        device_config = self.__config.devices

        devices: List[str] = [
            device['name'] for device in device_config['devices']
        ]
        self.log_info('Found %d device(s)', len(devices))

        return devices
