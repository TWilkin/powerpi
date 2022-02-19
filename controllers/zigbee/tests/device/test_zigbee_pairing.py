from asyncio import Future
from unittest.mock import PropertyMock
from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.mqtt import mock_producer
from zigbee_controller.device.zigbee_pairing import ZigbeePairingDevice


class TestZigbeePairingDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.zigbee_controller = mocker.Mock()

        self.timeout = 1

        self.publish = mock_producer(mocker, self.mqtt_client)

        future = Future()
        future.set_result(None)
        mocker.patch.object(
            self.zigbee_controller,
            'pair',
            return_value=future
        )

        return ZigbeePairingDevice(
            self.config, self.logger, self.mqtt_client, self.zigbee_controller,
            self.timeout, name='ZigBeePairing'
        )
    
    async def test_pair(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert subject.state == 'unknown'

        await subject.pair()

        self.zigbee_controller.pair.assert_called_once()

        assert subject.state == 'off'
    
    def test_device_joined(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        device = mocker.Mock()

        type(device).ieee = PropertyMock(return_value=[(i * 2) - 1  for i in range(1, 9)])
        type(device).nwk = PropertyMock(return_value=2748)

        subject.device_joined(device)

        topic = 'device/ZigBeePairing/join'
        message = {
            'nwk': '0x0abc',
            'ieee': '0f:0d:0b:09:07:05:03:01'
        }
        self.publish.assert_called_once_with(topic, message)
