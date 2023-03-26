from types import MethodType
from unittest.mock import PropertyMock, patch

import pytest
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from pytest_mock import MockerFixture


class TestHealthService:
    def test_start(self, subject: HealthService, powerpi_scheduler: AsyncIOScheduler):
        methods = []
        timers = []

        def add_job(method: MethodType, trigger: IntervalTrigger):
            methods.append(method.__self__)
            timers.append(trigger.interval.seconds)

        powerpi_scheduler.add_job = add_job

        subject.start()

        assert len(methods) == 1
        assert len(timers) == 1

        assert 'HealthService' in str(methods[0])
        assert timers[0] == 10

    @pytest.mark.asyncio
    @pytest.mark.parametrize('connected', [True, False])
    async def test_run_connected(
        self,
        subject: HealthService,
        powerpi_logger: Logger,
        powerpi_mqtt_client: MQTTClient,
        mocker: MockerFixture,
        connected: bool
    ):
        # pylint: disable=too-many-arguments
        type(powerpi_mqtt_client).connected = PropertyMock(
            return_value=connected
        )

        with patch('powerpi_common.health.health.Path') as path:
            instance = mocker.MagicMock()
            path.return_value = instance

            await subject.run()

            if connected:
                instance.touch.assert_called_once()

                powerpi_logger.debug.assert_called_once_with(
                    'MQTT connected'
                )
            else:
                instance.touch.assert_not_called()

                powerpi_logger.warning.assert_called_once_with(
                    'MQTT not connected'
                )

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client, powerpi_scheduler):
        return HealthService(powerpi_config, powerpi_logger, powerpi_mqtt_client, powerpi_scheduler)
