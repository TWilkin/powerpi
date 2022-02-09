from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigbee_controller.device import ZigbeeController, ZigbeeDevice


class OsramSwitchMiniSensor(Sensor, ZigbeeDevice):
    def __init__(
        self,
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
    
    def __str__(self):
        return ZigbeeDevice.__str__(self)
