import pytest
from powerpi_common.util.data import DataType
from pytest import raises

from lifx_controller.device.lifx_colour import LIFXColour


class TestLIFXColour:
    @pytest.mark.parametrize('hue,converted_hue,standard_hue', [
        (None, 0, 0),
        (0, 0, 0),
        (180, 32768, 181),
        (360, 65535, 360),
        (361, 65535, 360)
    ])
    def test_standard_unit_hue(
        self,
        hue: int,
        converted_hue: int,
        standard_hue: int
    ):
        data = {}

        if hue:
            data[DataType.HUE] = hue

        subject = LIFXColour.from_standard_unit(data)

        assert subject[DataType.HUE] == converted_hue

        json = subject.to_standard_unit()
        assert json[DataType.HUE] == standard_hue

    @pytest.mark.parametrize('saturation,converted_saturation,standard_saturation', [
        (None, 0, 0),
        (0, 0, 0),
        (11.111, 7282, 11.11),
        (50, 32768, 50),
        (100, 65535, 100),
        (101, 65535, 100)
    ])
    def test_standard_unit_saturation(
        self,
        saturation: float,
        converted_saturation: int,
        standard_saturation: float
    ):
        data = {}

        if saturation:
            data[DataType.SATURATION] = saturation

        subject = LIFXColour.from_standard_unit(data)

        assert subject[DataType.SATURATION] == converted_saturation

        json = subject.to_standard_unit()
        assert json[DataType.SATURATION] == standard_saturation

    @pytest.mark.parametrize('brightness,converted_brightness,standard_brightness', [
        (None, 0, 0),
        (0, 0, 0),
        (22.222, 14564, 22.22),
        (50, 32768, 50),
        (100, 65535, 100),
        (101, 65535, 100)
    ])
    def test_standard_unit_brightness(
        self,
        brightness: float,
        converted_brightness: int,
        standard_brightness: float
    ):
        data = {}

        if brightness:
            data[DataType.BRIGHTNESS] = brightness

        subject = LIFXColour.from_standard_unit(data)

        assert subject[DataType.BRIGHTNESS] == converted_brightness

        json = subject.to_standard_unit()
        assert json[DataType.BRIGHTNESS] == standard_brightness

    @pytest.mark.parametrize('temperature,expected_temperature', [(None, 0), (0, 0), (4000, 4000)])
    def test_standard_unit_temperature(
        self,
        temperature: int,
        expected_temperature: int
    ):
        data = {}

        if temperature:
            data[DataType.TEMPERATURE] = temperature

        subject = LIFXColour.from_standard_unit(data)

        assert subject[DataType.TEMPERATURE] == expected_temperature

        json = subject.to_standard_unit()
        assert json[DataType.TEMPERATURE] == expected_temperature

    def test_output(self):
        subject = LIFXColour((1, 2, 3, 4))

        assert subject.list == (1, 2, 3, 4)

        assert subject.to_json() == {
            DataType.HUE: 1,
            DataType.SATURATION: 2,
            DataType.BRIGHTNESS: 3,
            DataType.TEMPERATURE: 4
        }

        assert f'{subject}' == 'HSBK(1, 2, 3, 4)'

    def test_patch(self):
        subject = LIFXColour.from_standard_unit({
            DataType.HUE: 180,
            DataType.SATURATION: 50,
            DataType.BRIGHTNESS: 90,
            DataType.TEMPERATURE: 4000
        })

        patch = {
            DataType.HUE: '+100',
            DataType.SATURATION: '-20',
            DataType.BRIGHTNESS: 75,
            DataType.TEMPERATURE: '2000'
        }

        subject.patch(patch)

        assert subject.hue == 51154  # 280/360 of 65535
        assert subject.saturation == 19661  # 30% of 65535
        assert subject.brightness == 49152  # 75% of 65535
        assert subject.temperature == 2000

    def test_update(self):
        subject = LIFXColour(None)

        assert subject.list == (0, 0, 0, 0)

        subject[DataType.HUE] = 1
        subject[DataType.SATURATION] = 2
        subject[DataType.BRIGHTNESS] = 3
        subject[DataType.TEMPERATURE] = 4

        assert subject.list == (1, 2, 3, 4)

    def test_equality(self):
        subject = LIFXColour({
            DataType.HUE: 1,
            DataType.SATURATION: 2,
            DataType.BRIGHTNESS: 3,
            DataType.TEMPERATURE: 4
        })

        assert subject == LIFXColour((1, 2, 3, 4))

        assert subject != 'other'

    def test_errors(self):
        subject = LIFXColour(None)

        with raises(KeyError):
            assert subject['bad_key'] is None

        with raises(KeyError):
            subject['bad_key'] = None
