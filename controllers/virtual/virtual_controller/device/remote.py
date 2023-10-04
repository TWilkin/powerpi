from asyncio import Event, wait_for
from asyncio.exceptions import TimeoutError as AsyncTimeoutError

from powerpi_common.config import Config
from powerpi_common.device import DeviceStatus
from powerpi_common.device.mixin import AdditionalState
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import DeviceVariable


class RemoteDevice(DeviceVariable):
    # pylint: disable=too-many-ancestors

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        timeout: float = 12.5,
        **kwargs
    ):
        # pylint: disable=too-many-arguments

        self.__logger = logger
        self.__timeout = timeout

        self.__producer = mqtt_client.add_producer()
        self.__waiting = Event()

        DeviceVariable.__init__(self, config, logger, mqtt_client, **kwargs)

    @DeviceVariable.state.setter
    def state(self, new_state: str):
        DeviceVariable.state.fset(self, new_state)
        self.__waiting.set()

    @DeviceVariable.scene.setter
    def scene(self, new_scene: str):
        DeviceVariable.scene.fset(self, new_scene)
        self.__waiting.set()

    @DeviceVariable.additional_state.setter
    def additional_state(self, new_additional_state: AdditionalState):
        DeviceVariable.additional_state.fset(self, new_additional_state)
        self.__waiting.set()

    async def change_power_and_additional_state(
        self,
        scene: str | None = None,
        new_state: DeviceStatus | None = None,
        new_additional_state: AdditionalState | None = None
    ):
        await self.__send_message(scene, new_state, new_additional_state)

    def update_state_and_additional_no_broadcast(
        self,
        new_scene: str,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        DeviceVariable.update_state_and_additional_no_broadcast(
            self, new_scene, new_state, new_additional_state
        )
        self.__waiting.set()

    def set_state_and_additional(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        DeviceVariable.set_state_and_additional(
            self, new_state, new_additional_state
        )
        self.__waiting.set()

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        # we are doing everything in change_power_and_additional_state
        return new_additional_state

    def _filter_keys(self, new_additional_state: AdditionalState):
        # we don't know what the actual implementation supports, so keep it as it is
        return new_additional_state

    async def turn_on(self):
        await self.__send_message(state=DeviceStatus.ON)

    async def turn_off(self):
        await self.__send_message(state=DeviceStatus.OFF)

    async def change_scene(self, new_scene: str):
        await self.__send_message(scene=new_scene, action='scene')

    async def __send_message(
        self,
        scene: str | None = None,
        state: DeviceStatus | None = None,
        additional_state: AdditionalState | None = None,
        action: str | None = 'change'
    ):
        topic = f'device/{self.name}/{action}'
        message = {}

        if additional_state is not None:
            message = {**additional_state}

        if scene is not None:
            message['scene'] = scene

        if state is not None:
            message['state'] = state

        self.__waiting.clear()

        self.__producer(topic, message)

        self.__logger.info(
            f'Waiting for state update for device "{self.name}"'
        )

        await self.__wait(self.__timeout)

        self.__logger.info(
            f'Continuing after device "{self.name}"'
        )

    async def __wait(self, timeout: float):
        try:
            await wait_for(self.__waiting.wait(), timeout)
        except AsyncTimeoutError:
            self.__logger.warning(
                f'Timed out waiting for device "{self.name}"'
            )

    def __str__(self):
        return f'{type(self).__name__}({self.name}, {self.json})'
