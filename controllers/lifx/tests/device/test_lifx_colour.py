import pytest
from lifx_controller.device.lifx_colour import LIFXColour
from pytest import raises


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
            data['hue'] = hue

        subject = LIFXColour.from_standard_unit(data)

        assert subject['hue'] == converted_hue

        json = subject.to_standard_unit()
        assert json['hue'] == standard_hue

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
            data['saturation'] = saturation

        subject = LIFXColour.from_standard_unit(data)

        assert subject['saturation'] == converted_saturation

        json = subject.to_standard_unit()
        assert json['saturation'] == standard_saturation

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
            data['brightness'] = brightness

        subject = LIFXColour.from_standard_unit(data)

        assert subject['brightness'] == converted_brightness

        json = subject.to_standard_unit()
        assert json['brightness'] == standard_brightness

    @pytest.mark.parametrize('temperature,expected_temperature', [(None, 0), (0, 0), (4000, 4000)])
    def test_standard_unit_temperature(
        self,
        temperature: int,
        expected_temperature: int
    ):
        data = {}

        if temperature:
            data['temperature'] = temperature

        subject = LIFXColour.from_standard_unit(data)

        assert subject['temperature'] == expected_temperature

        json = subject.to_standard_unit()
        assert json['temperature'] == expected_temperature

    def test_output(self):
        subject = LIFXColour((1, 2, 3, 4))

        assert subject.list == (1, 2, 3, 4)

        assert subject.to_json() == {
            'hue': 1,
            'saturation': 2,
            'brightness': 3,
            'temperature': 4
        }

        assert f'{subject}' == 'HSBK(1, 2, 3, 4)'

    def test_patch(self):
        subject = LIFXColour.from_standard_unit({
            'hue': 180,
            'saturation': 50,
            'brightness': 90,
            'temperature': 4000
        })

        patch = {
            'hue': '+100',
            'saturation': '-20',
            'brightness': 75,
            'temperature': '2000'
        }

        subject.patch(patch)

        assert subject.hue == 51154  # 280/360 of 65535
        assert subject.saturation == 19661  # 30% of 65535
        assert subject.brightness == 49152  # 75% of 65535
        assert subject.temperature == 2000

    def test_update(self):
        subject = LIFXColour(None)

        assert subject.list == (0, 0, 0, 0)

        subject['hue'] = 1
        subject['saturation'] = 2
        subject['brightness'] = 3
        subject['temperature'] = 4

        assert subject.list == (1, 2, 3, 4)

    def test_equality(self):
        subject = LIFXColour({
            'hue': 1,
            'saturation': 2,
            'brightness': 3,
            'temperature': 4
        })

        assert subject == LIFXColour((1, 2, 3, 4))

        assert subject != 'other'

    def test_errors(self):
        subject = LIFXColour(None)

        with raises(KeyError):
            assert subject['bad_key'] is None

        with raises(KeyError):
            subject['bad_key'] = None
