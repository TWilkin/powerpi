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
        zigpy_application_class: MagicMock,
        baudrate: int,
        flow_control: str,
        expected_config: dict
    ) -> None:
        # pylint: disable=too-many-arguments, too-many-positional-arguments

        zigbee_config.baudrate = baudrate
        zigbee_config.flow_control = flow_control

        await subject.startup()

        zigpy_application_class.new.assert_called_once_with(
            expected_config,
            auto_form=True
        )

        # Verify controller is running by checking public methods work
        subject.add_listener(MagicMock())  # Should not raise

    @pytest.mark.asyncio
    async def test_startup_error_exits_process(
        self,
        subject: ZigbeeController,
        zigpy_application_class: MagicMock,
        mocker: MockerFixture
    ) -> None:
        # Make the library class .new() method fail
        zigpy_application_class.new.side_effect = Exception(
            'Failed to connect')

        exit_spy = mocker.patch(
            'zigbee_controller.zigbee.zigbee_controller.os._exit'
        )
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
        zigpy_controller_instance: MagicMock
    ) -> None:
        await subject.startup()

        await subject.shutdown()

        zigpy_controller_instance.shutdown.assert_called_once()

        # Verify controller is shut down by checking public methods fail
        with pytest.raises(ZigbeeControllerNotRunningError):
            subject.add_listener(MagicMock())

    @pytest.mark.asyncio
    async def test_connection_lost_exits_process(
        self,
        subject: ZigbeeController,
        zigpy_controller_instance: MagicMock,
        mocker: MockerFixture
    ) -> None:
        exit_spy = mocker.patch(
            'zigbee_controller.zigbee.zigbee_controller.os._exit'
        )
        log_error_spy = mocker.spy(subject, 'log_error')

        await subject.startup()

        zigpy_controller_instance.add_listener.assert_called_once()
        listener = zigpy_controller_instance.add_listener.call_args[0][0]

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
    def zigpy_controller_instance(self, mocker: MockerFixture) -> MagicMock:
        instance = mocker.MagicMock()
        instance.shutdown = AsyncMock()

        return instance

    @pytest.fixture
    def zigpy_application_class(
        self,
        zigpy_controller_instance: MagicMock,
        mocker: MockerFixture
    ) -> MagicMock:
        library_class = mocker.MagicMock()
        library_class.new = AsyncMock(return_value=zigpy_controller_instance)
        return library_class

    @pytest.fixture
    def library_factory_provider(
        self,
        zigpy_application_class: MagicMock,
        mocker: MockerFixture
    ) -> ZigbeeLibraryFactory:
        inner_factory = mocker.MagicMock()
        inner_factory.get_library.return_value = zigpy_application_class

        factory = mocker.MagicMock(spec=ZigbeeLibraryFactory)
        factory.return_value = inner_factory
        return factory

    @pytest.fixture
    def subject(
        self,
        zigbee_config: ZigbeeConfig,
        powerpi_logger,
        library_factory_provider: ZigbeeLibraryFactory
    ) -> ZigbeeController:
        return ZigbeeController(zigbee_config, powerpi_logger, library_factory_provider)
