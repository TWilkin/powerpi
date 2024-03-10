from typing import Any, Dict

from jsonpatch import JsonPatch
from powerpi_common.condition import ConditionParser
from powerpi_common.device import DeviceStatus
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from powerpi_common.variable import DeviceVariable, VariableManager


class ActionFactory:
    '''Factory for generating the actions to apply to a device when an event fires.'''

    def __init__(
        self,
        mqtt_client: MQTTClient,
        variable_manager: VariableManager
    ):
        self.__producer = mqtt_client.add_producer()
        self.__variable_manager = variable_manager

    def build(self, action: Dict[str, Any]):
        '''Create the requested action for the event.'''
        try:
            state = action['state']

            if state == DeviceStatus.ON:
                return self.__device_on_action
            if state == DeviceStatus.OFF:
                return self.__device_off_action
        except KeyError:
            pass

        try:
            scene = action.get('scene', None)

            return self.__device_additional_state_action(
                scene,
                action['patch']
            )
        except KeyError:
            pass

        try:
            scene = action['scene']

            return self.__device_scene_action(scene)
        except KeyError:
            pass

        raise ActionNotFoundException(action)

    def __device_on_action(self, device: DeviceVariable):
        self.__device_power_message(device, DeviceStatus.ON)

    def __device_off_action(self, device: DeviceVariable):
        self.__device_power_message(device, DeviceStatus.OFF)

    def __device_additional_state_action(
        self,
        scene: str | None,
        patch: Dict[str, Any]
    ):
        json_patch = JsonPatch(patch)

        def wrapper(device: DeviceVariable):
            current_state = device.additional_state

            parser = ConditionParser(self.__variable_manager)

            # interpret any variables in the values to patch
            for operation in json_patch:
                operation['value'] = parser.conditional_expression(
                    operation['value']
                )

            patched = json_patch.apply(current_state)

            message = {**patched}
            if scene:
                message['scene'] = scene

            self.__device_message(device, 'change', message)

        return wrapper

    def __device_scene_action(self, scene: str | None):
        def wrapper(device: DeviceVariable):
            self.__device_message(device, 'scene', {scene})

        return wrapper

    def __device_message(self, device: DeviceVariable, action: str, message: MQTTMessage):
        self.__producer(
            f'device/{device.name}/{action}',
            message
        )

    def __device_power_message(self, device: DeviceVariable, state: DeviceStatus):
        self.__device_message(device, 'change', {state})


class ActionNotFoundException(Exception):
    def __init__(self, action: Dict[str, Any]):
        message = f'Cannot find action type for "{action}"'
        Exception.__init__(self, message)
