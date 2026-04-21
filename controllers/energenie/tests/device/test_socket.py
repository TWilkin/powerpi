import pytest
from powerpi_common_test.device import DeviceTestBase
from pytest_mock import MockerFixture

from energenie_controller.device.socket import SocketDevice


class TestSocketDevice(DeviceTestBase):

    @pytest.mark.asyncio
    async def test_run(self, subject: SocketDevice):
        counter = 0

        def func():
            nonlocal counter
            counter += 1

        # pylint: disable=protected-access
        await subject._run(func)

        assert counter == 2

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_variable_manager,
        mocker: MockerFixture
    ):
        energenie = mocker.MagicMock()

        return SocketDevice(
            config=powerpi_config,
            logger=powerpi_logger,
            mqtt_client=powerpi_mqtt_client,
            variable_manager=powerpi_variable_manager,
            energenie=energenie,
            name='test',
            retries=2,
            delay=0
        )
