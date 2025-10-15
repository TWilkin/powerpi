from unittest.mock import AsyncMock, MagicMock

import pytest
from pytest_mock import MockerFixture

from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.zigbee.library_factory import ZigbeeLibraryFactory
from zigbee_controller.zigbee.zigbee_controller import (
    ZigbeeController,
    ZigbeeControllerNotRunningError
)


class TestZigbeeController:
    @pytest.mark.asyncio
    @pytest.mark.parametrize('baudrate,flow_control,expected_config', [
        (None, None, {
            'database_path': '/var/data/zigbee.db',
            'device': {'path': '/dev/ttyACM0'}
        }),
        (115200, None, {
            'database_path': '/var/data/zigbee.db',
            'device': {'path': '/dev/ttyACM0', 'baudrate': 115200}
        }),
        (None, 'hardware', {
            'database_path': '/var/data/zigbee.db',
            'device': {'path': '/dev/ttyACM0', 'flow_control': 'hardware'}
        }),
        (9600, 'software', {
            'database_path': '/var/data/zigbee.db',
            'device': {'path': '/dev/ttyACM0', 'baudrate': 9600, 'flow_control': 'software'}
        }),
    ])
    async def test_startup_config_variations(
        self,
        subject: ZigbeeController,
        zigbee_config: ZigbeeConfig,
        library_factory: MagicMock,
        baudrate: int,
        flow_control: str,
        expected_config: dict
    ) -> None:
        # pylint: disable=too-many-arguments, too-many-positional-arguments

        zigbee_config.baudrate = baudrate
        zigbee_config.flow_control = flow_control

        await subject.startup()

        library_factory.new.assert_called_once_with(
            expected_config,
            auto_form=True
        )

        # Verify controller is running by checking public methods work
        subject.add_listener(MagicMock())  # Should not raise

    @pytest.mark.asyncio
    async def test_startup_error_exits_process(
        self,
        subject: ZigbeeController,
        library_factory: MagicMock,
        mocker: MockerFixture
    ) -> None:
        library_factory.new.side_effect = Exception('Failed to connect')
        exit_spy = mocker.patch('os._exit')
        log_error_spy = mocker.spy(subject, 'log_error')
        log_exception_spy = mocker.spy(subject, 'log_exception')

        await subject.startup()

        exit_spy.assert_called_once_with(-1)
        log_error_spy.assert_called_once_with(
            'Could not initialise ZigBee controller'
        )
        log_exception_spy.assert_called_once()

    @pytest.mark.asyncio
    async def test_shutdown_cleans_up_controller(
        self,
        subject: ZigbeeController,
        zigbee_controller_instance: MagicMock
    ) -> None:
        await subject.startup()

        await subject.shutdown()

        zigbee_controller_instance.shutdown.assert_called_once()

        # Verify controller is shut down by checking public methods fail
        with pytest.raises(ZigbeeControllerNotRunningError):
            subject.add_listener(MagicMock())

    @pytest.mark.asyncio
    async def test_connection_lost_exits_process(
        self,
        subject: ZigbeeController,
        zigbee_controller_instance: MagicMock,
        mocker: MockerFixture
    ) -> None:
        exit_spy = mocker.patch('os._exit')
        log_error_spy = mocker.spy(subject, 'log_error')

        await subject.startup()

        # Get the connection lost listener that was added
        listener = zigbee_controller_instance.add_listener.call_args[0][0]
        exception = Exception('Connection lost')
        listener.connection_lost(exception)

        exit_spy.assert_called_once_with(-1)
        log_error_spy.assert_called_once_with(
            'ZigBee connection lost, shutting down'
        )

    def test_methods_raise_when_controller_not_running(
        self,
        subject: ZigbeeController
    ) -> None:
        with pytest.raises(
            ZigbeeControllerNotRunningError,
            match='ZigBee controller is not running'
        ):
            subject.add_listener(MagicMock())

    @pytest.mark.asyncio
    async def test_methods_work_when_controller_running(
        self,
        subject: ZigbeeController
    ) -> None:
        await subject.startup()
        subject.add_listener(MagicMock())  # Should not raise

    @pytest.fixture
    def zigbee_config(self, powerpi_config) -> ZigbeeConfig:
        powerpi_config.database_path = '/var/data/zigbee.db'
        powerpi_config.zigbee_device = '/dev/ttyACM0'
        powerpi_config.baudrate = None
        powerpi_config.flow_control = None
        return powerpi_config

    @pytest.fixture
    def zigbee_controller_instance(self, mocker: MockerFixture) -> MagicMock:
        instance = mocker.MagicMock()
        instance.shutdown = AsyncMock()
        return instance

    @pytest.fixture
    def zigbee_library_class(
        self,
        zigbee_controller_instance: MagicMock,
        mocker: MockerFixture
    ) -> MagicMock:
        library_class = mocker.MagicMock()
        library_class.new = AsyncMock(return_value=zigbee_controller_instance)
        return library_class

    @pytest.fixture
    def library_factory(
        self,
        zigbee_library_class: MagicMock,
        mocker: MockerFixture
    ) -> ZigbeeLibraryFactory:
        factory = mocker.MagicMock(spec=ZigbeeLibraryFactory)
        factory.get_library.return_value = zigbee_library_class
        return factory

    @pytest.fixture
    def subject(
        self,
        zigbee_config: ZigbeeConfig,
        powerpi_logger,
        library_factory: ZigbeeLibraryFactory
    ) -> ZigbeeController:
        return ZigbeeController(zigbee_config, powerpi_logger, library_factory)
