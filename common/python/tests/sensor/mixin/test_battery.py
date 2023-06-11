import pytest
from powerpi_common_test.sensor import SensorTestBaseNew
from powerpi_common_test.sensor.mixin import BatteryMixinTestBaseNew

from powerpi_common.mqtt.client import MQTTClient
from powerpi_common.sensor.mixin import BatteryMixin
from powerpi_common.sensor.sensor import Sensor


class SensorImpl(Sensor, BatteryMixin):
    def __init__(
        self,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        BatteryMixin.__init__(self)


class TestBatteryMixin(SensorTestBaseNew, BatteryMixinTestBaseNew):

    @pytest.fixture
    def subject(self, powerpi_mqtt_client):
        return SensorImpl(
            powerpi_mqtt_client,
            name='TestBattery'
        )
