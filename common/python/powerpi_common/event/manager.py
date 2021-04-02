from typing import Callable

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager
from powerpi_common.mqtt import MQTTClient, MQTTConsumer


class EventManager(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager
    ):
        self.__config = config
        self.__logger = logger
        self.__mqtt_client = mqtt_client
        self.__device_manager = device_manager

        self.__consumers = []

    def load(self):
        events = self.__config.events['events']

        # iterate over the configuration events and create listeners
        for event in events:
            # see if we can find the device
            try:
                device = self.__device_manager.get_device(
                    event['action']['device']
                )
            except:
                # not a problem, we didn't know if this is the correct controller
                continue

            # choose an action
            action = self.__get_action(event['action'])
            if action is None:
                continue

            # set the topic to listen to
            topic = 'event/{}'.format(event['topic'])

            # create and register the consumer
            consumer = EventConsumer(
                self.__config, self.__logger, topic, device, event['condition'], action
            )
            self.__mqtt_client.add_consumer(consumer)
            self.__consumers.append(consumer)

            self.__logger.info(f'Found event {consumer}')

        self.__logger.info(
            f'Found {len(self.__consumers)} matching events'
        )

    def __get_action(self, action: object):
        try:
            state = action['state']

            if state == 'on':
                return device_on_action
            elif state == 'off':
                return device_off_action
        except:
            pass

        return None


class EventConsumer(MQTTConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        topic: str,
        device: Device,
        condition: object,
        action: Callable[[Device], None]
    ):
        MQTTConsumer.__init__(self, topic, config, logger)

        self.__device = device
        self.__condition = condition
        self.__action = action

    def on_message(self, client, user_data, message, entity, action):
        compare = message.copy()

        try:
            if not super().is_timestamp_valid(message['timestamp']):
                return

            # remove the timestamp before comparison
            del compare['timestamp']
        except:
            # if there is no timestamp that's not an error
            pass

        # execute the action if the condition is met
        if compare == self.__condition:
            self._logger.info(f'Condition match for "{self}"')
            self.__action(self.__device)

    def __str__(self):
        return f'{self._topic}({self.__device}:{self.__action})'


def device_on_action(device: Device):
    device.turn_on()


def device_off_action(device: Device):
    device.turn_off()
