from typing import Callable, Dict, List

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
        listeners = self.__config.events['listeners']

        # iterate over the configuration events and create listeners
        for listener in listeners:
            # set the topic to listen to
            topic = 'event/{}'.format(listener['topic'])

            events: List[EventHandler] = []
            for event in listener['events']:
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

                events.append(EventHandler(device, event['condition'], action))

            # create and register the consumer
            consumer = EventConsumer(
                self.__config, self.__logger, topic, events
            )
            self.__mqtt_client.add_consumer(consumer)
            self.__consumers.append(consumer)

            self.__logger.info(f'Found listener {consumer} with {len(events)} event(s)')

        self.__logger.info(
            f'Found {len(self.__consumers)} matching listeners'
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


class EventHandler(object):
    def __init__(
        self,
        device: Device,
        condition: Dict[str, any],
        action: Callable[[Device], None]
    ):
        self.__device = device
        self.__condition = condition
        self.__action = action
    
    def execute(self, message: dict):
        # execute the action if the condition is met
        if self.check_condition(message):
            self.__action(self.__device)
            return True
        
        return False

    def check_condition(self, message: dict):
        try:
            if not super().is_timestamp_valid(message['timestamp']):
                return False
        except:
            # if there is no timestamp that's not an error
            pass

        if 'message' in self.__condition:
            compare = message.copy()

            if 'timestamp' in message:
                # remove the timestamp before comparison
                del compare['timestamp']

            if compare != self.__condition['message']:
                return False
        
        if 'state' in self.__condition and self.__device.state != self.__condition['state']:
            return False
        
        return True
    
    def __str__(self):
        return f'{self.__device}:{self.__action}'


class EventConsumer(MQTTConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        topic: str,
        events: List[EventHandler]
    ):
        MQTTConsumer.__init__(self, topic, config, logger)

        self.__events = events

    def on_message(self, client, user_data, message: dict, entity, action):
        for event in self.__events:
            if event.execute(message):
                self._logger.info(f'Condition match for "{self}"')
                return

    def __str__(self):
        events = ', '.join([event.__str__() for event in self.__events])
        return f'{self._topic}({events})'



def device_on_action(device: Device):
    device.turn_on()


def device_off_action(device: Device):
    device.turn_off()
