import pytest
from node_controller.pwm_fan.dummy import DummyPWMFanInterface


class TestDummyPWMFanInterface:
    def test_curve(self, subject: DummyPWMFanInterface):
        subject.curve = {}

        assert subject.curve == {}

    def test_cpu_temps(self, subject: DummyPWMFanInterface):
        assert subject.cpu_temps == []

    def test_battery_temps(self, subject: DummyPWMFanInterface):
        assert subject.battery_temps == []

    def test_fan_speeds(self, subject: DummyPWMFanInterface):
        assert subject.fan_speeds == []

    def test_clear(self, subject: DummyPWMFanInterface):
        subject.clear()

    @pytest.fixture
    def subject(self):
        return DummyPWMFanInterface()
