from powerpi_common.sensor import Sensor
from zigbee_controller.device import ZigbeeController, ZigbeeDevice

class OsramSwitchMiniSensor(Sensor, ZigbeeDevice):
    def __init__(
        self,
        controller: ZigbeeController,
        ieee: str,
        name: str, 
        location: str,
        display_name: str = None,
        entity: str = None,
        action: str = None,
        visible: bool = False,
    ):
        Sensor.__init__(self, name, location, display_name, entity, action, visible)
        ZigbeeDevice.__init__(self, controller, ieee)

