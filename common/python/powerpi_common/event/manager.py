from jsonpatch import JsonPatch
from typing import List

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager
from powerpi_common.mqtt import MQTTClient
from .consumer import EventConsumer
from .handler import EventHandler


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

                # check this is actually a device
                if not issubclass(type(device), Device):
                    continue

                # choose an action
                action = self.__get_action(event['action'])
                if action is None:
                    continue

                events.append(EventHandler(device, event['condition'], action))

            if len(events) > 0:
                # create and register the consumer
                consumer = EventConsumer(
                    self.__config, self.__logger, topic, events
                )
                self.__mqtt_client.add_consumer(consumer)
                self.__consumers.append(consumer)

                self.__logger.info(f'Found listener {consumer} with {len(events)} event(s)')

        self.__logger.info(
            f'Found {len(self.__consumers)} matching listener(s)'
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

        try:
            patch = JsonPatch(action['patch'])
                     
            return device_additional_state_action(patch)
        except:
            pass

        return None


async def device_on_action(device: Device):
    await device.turn_on()

async def device_off_action(device: Device):
    await device.turn_off()

def device_additional_state_action(patch: JsonPatch):
    async def wrapper(device: Device):
        current_state = device.additional_state

        patched = patch.apply(current_state)
        await device.change_power_and_additional_state(None, patched)
    
    return wrapper
