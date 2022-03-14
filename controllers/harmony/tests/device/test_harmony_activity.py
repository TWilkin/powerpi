from asyncio import Future

from pytest_mock import MockerFixture

from harmony_controller.device.harmony_activity import HarmonyActivityDevice
from powerpi_common_test.device import DeviceTestBase


class TestHarmonyActivityDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()
        self.harmony_hub = mocker.Mock()

        mocker.patch.object(
            self.device_manager,
            'get_device',
            return_value=self.harmony_hub
        )

        future = Future()
        future.set_result(None)
        for method in ['start_activity', 'turn_on', 'turn_off']:
            mocker.patch.object(
                self.harmony_hub,
                method,
                return_value=future
            )

        return HarmonyActivityDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, 'hub', 'my activity',
            name='testactivity'
        )

    async def test_turn_on_hub(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'

        await subject.turn_on()

        assert subject.state == 'on'

        self.harmony_hub.start_activity.assert_called_once_with('my activity')

    async def test_turn_on_hub_error(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        async def start_activity(_: str):
            raise Exception('error')
        self.harmony_hub.start_activity = start_activity

        assert subject.state == 'unknown'

        await subject.turn_on()

        assert subject.state == 'unknown'

    async def test_turn_off_hub(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'

        await subject.turn_off()

        assert subject.state == 'off'

        self.harmony_hub.turn_off.assert_called_once()

    async def test_turn_off_hub_error(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        async def turn_off(_: str):
            raise Exception('error')
        self.harmony_hub.turn_off = turn_off

        assert subject.state == 'unknown'

        await subject.turn_off()

        assert subject.state == 'unknown'
