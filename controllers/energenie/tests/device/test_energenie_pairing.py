import asyncio

from asyncio import Future, sleep
from unittest.mock import PropertyMock
from pytest_mock import MockerFixture

from energenie_controller.device.energenie_pairing import EnergeniePairingDevice
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.mqtt import mock_producer


class TestEnergeniePairingDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture, timeout: float=0.1):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.energenie = mocker.Mock()

        self.timeout = timeout

        self.publish = mock_producer(mocker, self.mqtt_client)

        future = Future()
        future.set_result(None)
        mocker.patch.object(
            self.energenie,
            'start_pair',
            return_value=future
        )

        return EnergeniePairingDevice(
            self.config, self.logger, self.mqtt_client, self.energenie,
            self.timeout, name='EnergeniePairing'
        )
    
    async def test_pair(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        type(self.config).devices = PropertyMock(return_value={'devices': []})

        assert subject.state == 'unknown'

        await subject.pair()

        self.energenie.start_pair.assert_called_once_with(self.timeout)

        assert subject.state == 'off'

        topic = 'device/EnergeniePairing/join'
        message = {
            'home_id': 0
        }
        self.publish.assert_any_call(topic, message)
    
    async def test_pair_no_free_home_id(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        type(self.config).devices = PropertyMock(return_value={
            'devices': [{'type': 'energenie_socket', 'home_id': i } for i in range(0, 17)]
        })

        assert subject.state == 'unknown'

        await subject.pair()

        assert subject.state == 'off'

        self.energenie.start_pair.assert_not_called()
    
    async def test_pair_stop(self, mocker: MockerFixture):
        subject = self.get_subject(mocker, 0.1)
        
        sleeper = asyncio.get_event_loop().create_task(sleep(0.2))
        mocker.patch.object(
            self.energenie,
            'start_pair',
            return_value=sleeper
        )

        type(self.config).devices = PropertyMock(return_value={'devices': []})

        assert subject.state == 'unknown'

        await subject.turn_on()

        assert subject.state == 'on'

        await subject.turn_off()
        await sleeper

        self.energenie.start_pair.assert_called_once_with(self.timeout)

        self.energenie.stop_pair.assert_called_once_with()

        assert subject.state == 'off'

    
    async def test_find_free_home_id_ener314(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        type(self.config).is_ener314_rt = PropertyMock(return_value=False)

        type(self.config).devices = PropertyMock(return_value={
            'devices': [{'type': 'energenie_socket', 'home_id': 0 }]
        })

        home_id = subject.find_free_home_id()

        assert home_id == 0
    
    async def test_find_free_home_id_ener314_rt(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        type(self.config).is_ener314_rt = PropertyMock(return_value=True)

        type(self.config).devices = PropertyMock(return_value={
            'devices': [
                {'type': 'energenie_socket', 'home_id': 10 },
                {'type': 'energenie_socket_group', 'home_id': 0 },
                {'type': 'energenie_pairing' },
                {'type': 'something_else', 'home_id': 2 },
                {'type': 'energenie_test', 'home_id': 1 },
            ]
        })

        home_id = subject.find_free_home_id()

        assert home_id == 2

    async def test_find_free_home_id_ener314_rt_no_free_home_id(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        type(self.config).is_ener314_rt = PropertyMock(return_value=True)

        type(self.config).devices = PropertyMock(return_value={
            'devices': [{'type': 'energenie_socket', 'home_id': i } for i in range(0, 17)]
        })

        home_id = subject.find_free_home_id()

        assert home_id is None
