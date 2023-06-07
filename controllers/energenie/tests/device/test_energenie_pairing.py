import asyncio
from asyncio import Future, sleep
from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common_test.device import DeviceTestBaseNew
from pytest_mock import MockerFixture

from energenie_controller.device.energenie_pairing import \
    EnergeniePairingDevice


class TestEnergeniePairingDevice(DeviceTestBaseNew):

    __timeout = 0.1

    @pytest.mark.asyncio
    async def test_pair(
        self,
        subject: EnergeniePairingDevice,
        powerpi_config,
        powerpi_mqtt_producer: MagicMock,
        energenie: MagicMock
    ):
        type(powerpi_config).devices = PropertyMock(
            return_value={'devices': []}
        )

        assert subject.state == 'unknown'

        await subject.pair()

        energenie.start_pair.assert_called_once_with(self.__timeout)

        assert subject.state == 'off'

        topic = 'device/EnergeniePairing/join'
        message = {
            'home_id': 0
        }
        powerpi_mqtt_producer.assert_any_call(topic, message)

    @pytest.mark.asyncio
    async def test_pair_no_free_home_id(
        self,
        subject: EnergeniePairingDevice,
        powerpi_config,
        energenie: MagicMock
    ):
        type(powerpi_config).devices = PropertyMock(return_value={
            'devices': [{'type': 'energenie_socket', 'home_id': i} for i in range(0, 17)]
        })

        assert subject.state == 'unknown'

        await subject.pair()

        assert subject.state == 'off'

        energenie.start_pair.assert_not_called()

    @pytest.mark.asyncio
    async def test_pair_stop(
        self,
        subject: EnergeniePairingDevice,
        powerpi_config,
        energenie: MagicMock,
        mocker: MockerFixture
    ):
        sleeper = asyncio.get_event_loop().create_task(sleep(0.2))
        mocker.patch.object(
            energenie,
            'start_pair',
            return_value=sleeper
        )

        type(powerpi_config).devices = PropertyMock(
            return_value={'devices': []})

        assert subject.state == 'unknown'

        await subject.turn_on()

        assert subject.state == 'on'

        await subject.turn_off()
        await sleeper

        energenie.start_pair.assert_called_once_with(self.__timeout)

        energenie.stop_pair.assert_called_once_with()

        assert subject.state == 'off'

    @pytest.mark.asyncio
    async def test_find_free_home_id_ener314(
        self,
        subject: EnergeniePairingDevice,
        powerpi_config,
    ):
        type(powerpi_config).is_ener314_rt = PropertyMock(return_value=False)

        type(powerpi_config).devices = PropertyMock(return_value={
            'devices': [{'type': 'energenie_socket', 'home_id': 0}]
        })

        home_id = subject.find_free_home_id()

        assert home_id == 0

    @pytest.mark.asyncio
    async def test_find_free_home_id_ener314_rt(
        self,
        subject: EnergeniePairingDevice,
        powerpi_config,
    ):
        type(powerpi_config).is_ener314_rt = PropertyMock(return_value=True)

        type(powerpi_config).devices = PropertyMock(return_value={
            'devices': [
                {'type': 'energenie_socket', 'home_id': 10},
                {'type': 'energenie_socket_group', 'home_id': 0},
                {'type': 'energenie_pairing'},
                {'type': 'something_else', 'home_id': 2},
                {'type': 'energenie_test', 'home_id': 1},
            ]
        })

        home_id = subject.find_free_home_id()

        assert home_id == 2

    @pytest.mark.asyncio
    async def test_find_free_home_id_ener314_rt_no_free_home_id(
        self,
        subject: EnergeniePairingDevice,
        powerpi_config,
    ):
        type(powerpi_config).is_ener314_rt = PropertyMock(return_value=True)

        type(powerpi_config).devices = PropertyMock(return_value={
            'devices': [{'type': 'energenie_socket', 'home_id': i} for i in range(0, 17)]
        })

        home_id = subject.find_free_home_id()

        assert home_id is None

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        energenie
    ):
        return EnergeniePairingDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            energenie,
            self.__timeout,
            name='EnergeniePairing'
        )

    @pytest.fixture
    def energenie(self, mocker: MockerFixture):
        energenie = mocker.MagicMock()

        future = Future()
        future.set_result(None)
        mocker.patch.object(
            energenie,
            'start_pair',
            return_value=future
        )

        return energenie
