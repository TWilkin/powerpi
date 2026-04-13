from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from powerpi_common.variable import VariableManager


class GeofenceSensor(Sensor):
    '''
    Sensor implementing the conditions to activate, or deactivate a Geofence.
    '''

    def __init__(
        self,
        logger: Logger,
        mqtt_client: MQTTClient,
        variable_manager: VariableManager,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)

        self._logger = logger

        self.__variable_manager = variable_manager
