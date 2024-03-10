from typing import Any, Dict

from powerpi_common.device import DeviceStatus

from .action import Action


class ActionFactory:
    '''Factory for generating the actions to apply to a device when an event fires.'''

    def __init__(
        self,
        service_provider
    ):
        self.__service_provider = service_provider

    def build(self, action: Dict[str, Any]):
        '''Create the requested action for the event.'''
        try:
            state = action['state']

            if state == DeviceStatus.ON:
                return self.__create('action_device_on')
            if state == DeviceStatus.OFF:
                return self.__create('action_device_off')
        except KeyError:
            pass

        try:
            scene = action.get('scene', None)

            return self.__create(
                'action_device_additional_state',
                scene=scene,
                patch=action['patch']
            )
        except KeyError:
            pass

        try:
            scene = action['scene']

            return self.__create('action_device_scene', scene=scene)
        except KeyError:
            pass

        raise ActionNotFoundException(action)

    def __create(self, action_type: str, **kwargs):
        factory = getattr(self.__service_provider, action_type)

        action = factory(**kwargs)

        return Action(action_type, action)


class ActionNotFoundException(Exception):
    def __init__(self, action: Dict[str, Any]):
        message = f'Cannot find action type for "{action}"'
        Exception.__init__(self, message)
