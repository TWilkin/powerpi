from powerpi_common.mqtt.client import MQTTClient
from powerpi_common.sensor.mixin import BatteryMixin
from powerpi_common.sensor.sensor import Sensor
from powerpi_common_test.sensor import SensorTestBase
from powerpi_common_test.sensor.mixin import BatteryMixinTestBase
from pytest_mock import MockerFixture


class SensorImpl(Sensor, BatteryMixin):
    def __init__(
        self,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        BatteryMixin.__init__(self)


class TestBatteryMixin(SensorTestBase, BatteryMixinTestBase):
    def get_subject(self, _: MockerFixture):

        return SensorImpl(
            self.mqtt_client,
            name='TestBattery'
        )
