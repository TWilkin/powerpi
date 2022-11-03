import pytest
from node_controller.pijuice.dummy import DummyPiJuiceInterface


class TestDummyPiJuiceInterface:
    def test_battery_level(self, subject: DummyPiJuiceInterface):
        assert subject.battery_level is None

    def test_battery_charging(self, subject: DummyPiJuiceInterface):
        assert subject.battery_charging is False

    def test_wake_up_on_charge(self, subject: DummyPiJuiceInterface):
        assert subject.wake_up_on_charge == 0

        subject.wake_up_on_charge = 100

        assert subject.wake_up_on_charge == 100

    def test_charge_battery(self, subject: DummyPiJuiceInterface):
        assert subject.charge_battery is False

        subject.charge_battery = True

        assert subject.charge_battery is True

    @pytest.fixture
    def subject(self):
        return DummyPiJuiceInterface()
