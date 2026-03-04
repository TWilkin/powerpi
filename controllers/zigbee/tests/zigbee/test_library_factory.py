import pytest
from pytest_mock import MockerFixture

from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.zigbee.library import ZigbeeLibraryFactory
from zigbee_controller.zigbee.library.bellows import BellowsLibrary
from zigbee_controller.zigbee.library.znp import ZNPLibrary


class TestZigbeeLibraryFactory:
    @pytest.mark.parametrize('library_name,expected_type,expected_log', [
        ('znp', ZNPLibrary, 'Using ZNP ZigBee library'),
        ('bellows', BellowsLibrary, 'Using Bellows ZigBee library'),
    ])
    def test_get_library_valid(
        self,
        subject: ZigbeeLibraryFactory,
        zigbee_config: ZigbeeConfig,
        mocker: MockerFixture,
        library_name: str,
        expected_type: type,
        expected_log: str
    ) -> None:
        # pylint: disable=too-many-arguments, too-many-positional-arguments

        zigbee_config.zigbee_library = library_name

        log_info_spy = mocker.spy(subject, 'log_info')

        result = subject.get_library()

        assert isinstance(result, expected_type)
        log_info_spy.assert_called_once_with(expected_log)

    @pytest.mark.parametrize('library_name,expected_type', [
        ('ZNP', ZNPLibrary),
        ('BELLOWS', BellowsLibrary),
        ('ZnP', ZNPLibrary),
        ('bellows', BellowsLibrary),
    ])
    def test_get_library_case_insensitive(
        self,
        subject: ZigbeeLibraryFactory,
        zigbee_config: ZigbeeConfig,
        library_name: str,
        expected_type: type
    ) -> None:
        zigbee_config.zigbee_library = library_name

        result = subject.get_library()

        assert isinstance(result, expected_type)

    @pytest.mark.parametrize('invalid_library', [
        'invalid',
        'xbee',
        'deconz',
        '',
    ])
    def test_get_library_invalid_raises_error(
        self,
        subject: ZigbeeLibraryFactory,
        zigbee_config,
        invalid_library: str
    ) -> None:
        zigbee_config.zigbee_library = invalid_library

        with pytest.raises(ValueError, match=f'Unsupported ZigBee library: {invalid_library}'):
            subject.get_library()

    @pytest.fixture
    def subject(self, zigbee_config, powerpi_logger) -> ZigbeeLibraryFactory:
        return ZigbeeLibraryFactory(zigbee_config, powerpi_logger)
