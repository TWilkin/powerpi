from typing import List, Tuple
from unittest.mock import AsyncMock, MagicMock, PropertyMock

import pytest
from pytest_mock import MockerFixture

from node_controller.pwm_fan import PWMFanController
from node_controller.pwm_fan.dummy import DummyPWMFanInterface


class TestPWMFanController:
    def test_no_pwm_fan(
        self,
        powerpi_config: MagicMock,
        mocker: MockerFixture
    ):
        with pytest.raises(RuntimeError):
            _ = PWMFanController(
                powerpi_config,
                mocker.Mock(),
                mocker.Mock(),
                None
            )

    def test_no_pwm_fan_gets_dummy(
        self,
        powerpi_config: MagicMock,
        mocker: MockerFixture
    ):
        type(powerpi_config).device_fatal = PropertyMock(return_value=False)

        subject = PWMFanController(
            powerpi_config,
            mocker.Mock(),
            mocker.Mock(),
            None
        )

        assert isinstance(subject, DummyPWMFanInterface)

    @pytest.mark.parametrize('curve', [
        [],
        [(10, 20), (30, 40)],
        [(20, 10), (40, 30)],
    ])
    def test_curve(self, subject: PWMFanController, curve: List[Tuple[int, int]]):
        new_curve = [
            {'temperature': value[0], 'speed': value[1]}
            for value in curve
        ]
        subject.curve = new_curve

        assert len(subject.curve) == len(new_curve)

        for value in curve:
            assert value[0] in subject.curve.keys()
            assert subject.curve[value[0]] == value[1]

    @pytest.mark.asyncio
    @pytest.mark.parametrize('data', [
        (12.3, 10, 18.0),
        (20, 22, 32),
        (30, 34, 44),
        (55, 53, 100)
    ])
    async def test_update(
        self,
        mock_fan: MagicMock,
        mock_pijuice: MagicMock,
        mock_aiofiles: MagicMock,
        subject: PWMFanController,
        data: Tuple[int, int, float]
    ):
        # pylint: disable=too-many-arguments
        cpu_temp, battery_temp, expected_fan_speed = data

        assert subject.fan_speed_percentage == 0

        await subject.initialise()

        mock_fan.start.assert_called_once_with(100)
        assert subject.fan_speed_percentage == 100

        subject.curve = [
            {'temperature': 20, 'speed': 30},
            {'temperature': 30, 'speed': 40},
            {'temperature': 40, 'speed': 50},
        ]

        type(mock_pijuice).battery_temperature = PropertyMock(
            return_value=battery_temp
        )

        mock_aiofiles.open.return_value.__aenter__.return_value.read = AsyncMock(
            return_value=cpu_temp * 1000
        )

        mock_fan.reset_mock()

        await subject.update()

        if expected_fan_speed != 100:
            mock_fan.start.assert_called_once_with(expected_fan_speed)
        else:
            mock_fan.start.assert_not_called()
        assert subject.fan_speed_percentage == expected_fan_speed

        mock_fan.reset_mock()

        # calling it again with the same temps will do nothing
        await subject.update()

        mock_fan.start.assert_not_called()
        assert subject.fan_speed_percentage == expected_fan_speed

        # we polled twice, so both temps should be present twice
        assert subject.cpu_temps == [cpu_temp, cpu_temp]
        assert subject.battery_temps == [battery_temp, battery_temp]

    @pytest.fixture
    def subject(
        self,
        mock_rpi: MagicMock,
        powerpi_config: MagicMock,
        mock_pijuice: MagicMock,
        mocker: MockerFixture
    ):
        # pylint: disable=unused-argument
        return PWMFanController(
            powerpi_config,
            mocker.Mock(),
            mocker.Mock(),
            mock_pijuice
        )

    @pytest.fixture
    def mock_pijuice(self, mocker: MockerFixture):
        pijuice = mocker.Mock()

        type(pijuice).status = PropertyMock(return_value=mocker.Mock())

        return pijuice

    @pytest.fixture
    def mock_rpi(self, mock_fan: MagicMock, mocker: MockerFixture):
        mock_rpi = mocker.Mock()

        modules = {
            'RPi': mock_rpi,
            'RPi.GPIO': mock_rpi.GPIO
        }

        mock_rpi.GPIO.PWM.return_value = mock_fan

        return mocker.patch.dict('sys.modules', modules)

    @pytest.fixture
    def mock_fan(self, mocker: MockerFixture):
        return mocker.Mock()

    @pytest.fixture
    def mock_aiofiles(self, mocker: MockerFixture):
        return mocker.patch(
            "node_controller.pwm_fan.pwm_fan.aiofiles"
        )
