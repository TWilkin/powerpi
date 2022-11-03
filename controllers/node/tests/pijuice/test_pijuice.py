from unittest.mock import MagicMock, PropertyMock

import pytest
from node_controller.pijuice import PiJuiceImpl
from node_controller.pijuice.dummy import DummyPiJuiceInterface
from pytest_mock import MockerFixture


class TestPijuiceImpl:
    def test_no_pijuice(
        self,
        mock_no_pijuice: MagicMock,
        mock_config: MagicMock,
        mocker: MockerFixture
    ):
        # pylint: disable=unused-argument
        with pytest.raises(PermissionError):
            _ = PiJuiceImpl(mock_config, mocker.Mock())

    def test_no_pijuice_gets_dummy(
        self,
        mock_no_pijuice: MagicMock,
        mock_config: MagicMock,
        mocker: MockerFixture
    ):
        # pylint: disable=unused-argument
        type(mock_config).device_fatal = PropertyMock(return_value=False)

        subject = PiJuiceImpl(mock_config, mocker.Mock())

        assert isinstance(subject, DummyPiJuiceInterface)

    @pytest.mark.parametrize('level', [100, 0])
    def test_battery_level(self, mock_pijuice: MagicMock, subject: PiJuiceImpl, level: int):
        mock_pijuice.status.GetChargeLevel.return_value = {
            'data': level
        }

        assert subject.battery_level == level

    @pytest.mark.parametrize('battery', ['CHARGING_FROM_IN', 'CHARGING_FROM_5V_IO'])
    def test_battery_charging_true(
        self,
        mock_pijuice: MagicMock,
        subject: PiJuiceImpl,
        battery: str
    ):
        mock_pijuice.status.GetStatus.return_value = {
            'data': {
                'battery': battery
            }
        }

        assert subject.battery_charging is True

    @pytest.mark.parametrize('battery', ['NOT_PRESENT', None])
    def test_battery_charging_false(
        self,
        mock_pijuice: MagicMock,
        subject: PiJuiceImpl,
        battery: str
    ):
        mock_pijuice.status.GetStatus.return_value = {
            'data': {
                'battery': battery
            }
        }

        assert subject.battery_charging is False

    @pytest.mark.parametrize('level', [100, 0])
    def test_wake_up_on_charge(self, mock_pijuice: MagicMock, subject: PiJuiceImpl, level: int):
        mock_pijuice.power.GetWakeUpOnCharge.return_value = {
            'data': level
        }

        assert subject.wake_up_on_charge == level

    @pytest.mark.parametrize('level', [100, 0])
    def test_wake_up_on_charge_set(self, mock_pijuice: MagicMock, subject: PiJuiceImpl, level: int):
        subject.wake_up_on_charge = level

        mock_pijuice.power.SetWakeUpOnCharge.assert_called_once_with(
            level, True
        )

    @pytest.mark.parametrize('charge', [True, False])
    def test_charge_battery(self, mock_pijuice: MagicMock, subject: PiJuiceImpl, charge: bool):
        mock_pijuice.config.GetChargingConfig.return_value = {
            'data': {
                'charging_enabled': charge
            }
        }

        assert subject.charge_battery is charge

    @pytest.mark.parametrize('charge', [True, False])
    def test_charge_battery_set(self, mock_pijuice: MagicMock, subject: PiJuiceImpl, charge: bool):
        subject.charge_battery = charge

        mock_pijuice.config.SetChargingConfig.assert_called_once_with(
            charge, True
        )

    @pytest.mark.parametrize('delay', [60, 120])
    def test_shutdown(self, mock_pijuice: MagicMock, subject: PiJuiceImpl, delay: int):
        subject.shutdown(delay)

        mock_pijuice.power.SetPowerOff.assert_called_once_with(
            delay
        )

    @pytest.fixture
    def subject(self, mock_config: MagicMock, mocker: MockerFixture):
        return PiJuiceImpl(mock_config, mocker.Mock())

    @pytest.fixture
    def mock_config(self, mocker: MockerFixture):
        config = mocker.Mock()

        type(config).device_fatal = PropertyMock(return_value=True)
        type(config).i2c_device = '/dev/i2c-2'
        type(config).i2c_address = 0x14

        return config

    @pytest.fixture
    def mock_pijuice(self, mocker: MockerFixture):
        pijuice = mocker.patch('node_controller.pijuice.pijuice.PiJuice')

        instance = mocker.Mock()
        pijuice.return_value = instance

        type(instance).config = PropertyMock(return_value=mocker.Mock())
        type(instance).status = PropertyMock(return_value=mocker.Mock())
        type(instance).power = PropertyMock(return_value=mocker.Mock())

        return instance

    @pytest.fixture
    def mock_no_pijuice(self, mocker: MockerFixture):
        return mocker.patch(
            'node_controller.pijuice.pijuice.PiJuice',
            side_effect=PermissionError()
        )
