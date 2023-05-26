import math

import pytest
from powerpi_common.util.data import DataType, Ranges, Standardiser


class TestStandardiser:
    @pytest.mark.parametrize('standard,converted', [
        (0, 0),
        (100, 65535),
        (43.21, 28318)
    ])
    def test_converter(
        self,
        subject: Standardiser,
        standard: float,
        converted: float
    ):
        data_type = DataType.BRIGHTNESS

        assert subject.from_standard_unit(data_type, standard) == converted

        assert subject.to_standard_unit(data_type, converted) == standard

    @pytest.mark.parametrize('standard,converted', [
        (-100, 0),
        (-0.01, 0),
        (0, 0),
        (360, 65535),
        (360.01, 65535),
        (10_000, 65535)
    ])
    def test_converter_range(
        self,
        subject: Standardiser,
        standard: float,
        converted: float
    ):
        assert subject.from_standard_unit(DataType.HUE, standard) == converted

    def test_no_converter(self, subject: Standardiser):
        value = 123.45

        assert subject.from_standard_unit(DataType.TEMPERATURE, value) == value
        assert subject.to_standard_unit(DataType.TEMPERATURE, value) == value

    @pytest.fixture
    def subject(self):
        return Standardiser({
            DataType.BRIGHTNESS: (
                lambda value: math.ceil((value / 100) * Ranges.UINT16.max),
                lambda value: round((value / Ranges.UINT16.max) * 100, 2)
            ),

            DataType.HUE: (
                lambda value: math.ceil((value / 360) * Ranges.UINT16.max),
                lambda value: math.ceil((value / Ranges.UINT16.max) * 360),
                Ranges.UINT16
            ),
        })
