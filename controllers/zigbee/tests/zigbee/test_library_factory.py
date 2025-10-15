import pytest
from pytest_mock import MockerFixture

from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.zigbee.library_factory import ZigbeeLibraryFactory


class TestZigbeeLibraryFactory:
    @pytest.mark.parametrize('library_name,expected_module,expected_class,expected_log', [
        ('znp', 'zigpy_znp.zigbee.application',
         'ControllerApplication', 'Using ZNP ZigBee library'),
        ('bellows', 'bellows.zigbee.application',
         'ControllerApplication', 'Using Bellows ZigBee library'),
    ])
    def test_get_library_valid(
        self,
        subject: ZigbeeLibraryFactory,
        zigbee_config: ZigbeeConfig,
        mocker: MockerFixture,
        library_name: str,
        expected_module: str,
        expected_class: str,
        expected_log: str
    ) -> None:
        # pylint: disable=too-many-arguments, too-many-positional-arguments

        zigbee_config.zigbee_library = library_name

        mock_controller_app = mocker.MagicMock()
        mocker.patch(f'{expected_module}.{expected_class}',
                     mock_controller_app)
        log_info_spy = mocker.spy(subject, 'log_info')

        result = subject.get_library()

        assert result == mock_controller_app
        log_info_spy.assert_called_once_with(expected_log)

    @pytest.mark.parametrize('library_name', [
        'ZNP',
        'BELLOWS',
        'Znp',
        'Bellows',
    ])
    def test_get_library_case_insensitive(
        self,
        subject: ZigbeeLibraryFactory,
        zigbee_config: ZigbeeConfig,
        mocker: MockerFixture,
        library_name: str
    ) -> None:
        zigbee_config.zigbee_library = library_name

        lower_name = library_name.lower()
        if lower_name == 'znp':
            mock_controller_app = mocker.MagicMock()
            mocker.patch(
                'zigpy_znp.zigbee.application.ControllerApplication', mock_controller_app)
        elif lower_name == 'bellows':
            mock_controller_app = mocker.MagicMock()
            mocker.patch(
                'bellows.zigbee.application.ControllerApplication', mock_controller_app)

        result = subject.get_library()

        assert result == mock_controller_app

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
