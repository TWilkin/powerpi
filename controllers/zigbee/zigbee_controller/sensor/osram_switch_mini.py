from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigbee_controller.device import ZigbeeController, ZigbeeDevice


class OsramSwitchMiniSensor(Sensor, ZigbeeDevice):
    def __init__(
        self,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        ieee: str,
        nwk: str,
        name: str, 
        location: str,
        display_name: str = None,
        entity: str = None,
        action: str = None,
        visible: bool = False,
    ):
        Sensor.__init__(self, mqtt_client, name, location, display_name, entity, action, visible)
        ZigbeeDevice.__init__(self, controller, ieee, nwk)

        self.__logger = logger

        self.__initialise()
    
    def cluster_command(self, tsn: int, command_id: int, *args):
        self.__logger.info(f'cluster_command: {tsn} {command_id} {args}')

    def __initialise(self):
        device = self._zigbee_device

        for i in range(1, 3):
            endpoint = device[i]
            print(endpoint)

            for j in endpoint.out_clusters.keys():
                cluster = endpoint.out_clusters[j]
                print(cluster)

                cluster.add_listener(self)
    
    
    def __str__(self):
        return ZigbeeDevice.__str__(self)
