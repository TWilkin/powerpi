from typing import Any, Dict, List

from powerpi_common.config import Config
from powerpi_common.device import (Device, DeviceManager,
                                   DeviceNotFoundException, DeviceStatus)
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import VariableManager

from event.services.action import (device_additional_state_action,
                                   device_off_action, device_on_action,
                                   device_scene_action)
from event.services.consumer import EventConsumer
from event.services.handler import EventHandler


class EventManager:
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        variable_manager: VariableManager
    ):
        # pylint: disable=too-many-arguments
        self.__config = config
        self.__logger = logger
        self.__mqtt_client = mqtt_client
        self.__device_manager = device_manager
        self.__variable_manager = variable_manager

        self.__consumers = []

    @property
    def consumers(self):
        return self.__consumers

    def load(self):
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
                try:
                    device = self.__device_manager.get_device(
                        event['action']['device']
                    )
                except DeviceNotFoundException:
                    # not a problem, we didn't know if this is the correct controller
                    continue

                # check this is actually a device
                if not issubclass(type(device), Device):
                    continue

                # choose an action
                action = self.__get_action(event['action'])
                if action is None:
                    continue

                handler = EventHandler(
                    self.__logger, self.__variable_manager, device, event['condition'], action
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
                self.__config, self.__logger, topic, events
            )
            self.__mqtt_client.add_consumer(consumer)
            self.__consumers.append(consumer)

            self.__logger.info(
                f'Found listener {consumer} with {len(events)} event(s)'
            )

        self.__logger.info(
            f'Found {len(self.__consumers)} matching listener(s)'
        )

    def __get_action(self, action: Dict[str, Any]):
        try:
            state = action['state']

            if state == DeviceStatus.ON:
                return device_on_action
            if state == DeviceStatus.OFF:
                return device_off_action
        except KeyError:
            pass

        try:
            scene = action.get('scene', None)

            return device_additional_state_action(scene, action['patch'], self.__variable_manager)
        except KeyError:
            pass

        try:
            scene = action['scene']

            return device_scene_action(scene)
        except KeyError:
            pass

        return None
