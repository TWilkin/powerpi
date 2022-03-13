from asyncio import CancelledError, ensure_future, get_event_loop, get_running_loop
from signal import SIGINT, SIGTERM

from .config.config_retriever import ConfigRetriever
from .device import DeviceManager, DeviceStatusChecker
from .event import EventManager
from .logger import Logger
from .mqtt import MQTTClient
from .util import await_or_sync


#pylint: disable=too-many-instance-attributes
class Controller:
    #pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        config_retriever: ConfigRetriever,
        device_manager: DeviceManager,
        event_manager: EventManager,
        mqtt_client: MQTTClient,
        device_status_checker: DeviceStatusChecker,
        app_name: str,
        version: str
    ):
        self._logger = logger
        self.__config_retriever = config_retriever
        self.__device_manager = device_manager
        self.__event_manager = event_manager
        self.__mqtt_client = mqtt_client
        self.__device_status_checker = device_status_checker
        self.__app_name = app_name
        self.__version = version

    def start(self):
        loop = get_event_loop()
        main = ensure_future(self.__main())

        for signal in [SIGINT, SIGTERM]:
            loop.add_signal_handler(signal, main.cancel)

        try:
            loop.run_until_complete(main)
        finally:
            loop.close()

    def _log_start(self):
        pass

    def _initialise_devices(self):
        pass

    def _cleanup_devices(self):
        pass

    async def __main(self):
        self._logger.info(f'PowerPi {self.__app_name} v{self.__version}')
        self._log_start()

        try:
            # intially connect to MQTT
            await self.__mqtt_client.connect()

            # retrieve any config from the queue
            await self.__config_retriever.start()

            # perform any device initialisation
            await await_or_sync(self._initialise_devices)

            # load the devices from the config
            await self.__device_manager.load()

            # load the events from the config
            self.__event_manager.load()

            # periodically check device status
            self.__device_status_checker.start()

            # loop forever
            await get_running_loop().create_future()
        except CancelledError:
            await self.__cleanup()

    async def __cleanup(self):
        self.__device_status_checker.stop()

        await await_or_sync(self._cleanup_devices)

        await self.__mqtt_client.disconnect()
