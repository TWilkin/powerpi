from asyncio import Future
from unittest.mock import PropertyMock

import pytest
from macro_controller.device.condition import ConditionDevice
from powerpi_common.device import DeviceStatus
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import (DeviceOrchestratorMixinTestBase,
                                              PollableMixinTestBase)
from pytest_mock import MockerFixture


class TestCondition(DeviceTestBase, DeviceOrchestratorMixinTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        # pylint: disable=attribute-defined-outside-init
        self.device_manager = mocker.Mock()
        self.variable_manager = mocker.Mock()

        self.device = mocker.Mock()
        future = Future()
        future.set_result(None)
        self.device.turn_on.return_value = future
        self.device.turn_off.return_value = future

        self.device_manager.get_device = lambda name: self.device if name == 'test_device' else None

        return ConditionDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, self.variable_manager,
            name='condition', device='test_device',
            on_condition={
                'when': [{'equals': [{'var': 'device.on.state'}, 'on']}]
            },
            off_condition={
                'when': [{'equals': [{'var': 'device.off.state'}, 'off']}]
            },
            timeout=0.3,
            interval=0.1,
            poll_frequency=60
        )

    async def test_initialise(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.initialise()

        self.variable_manager.get_device.assert_has_calls([
            mocker.call('on'),
            mocker.call('off')
        ])

    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    async def test_poll_updates_state(self, mocker: MockerFixture, state: DeviceStatus):
        subject = self.create_subject(mocker)

        on_device_variable = mocker.Mock()
        type(on_device_variable).state = PropertyMock(
            return_value=state
        )

        off_device_variable = mocker.Mock()
        type(off_device_variable).state = PropertyMock(
            return_value=state
        )

        def get_variable(name: str):
            if name == DeviceStatus.ON:
                return on_device_variable
            if name == DeviceStatus.OFF:
                return off_device_variable
            return None
        self.variable_manager.get_device = get_variable

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.poll()

        assert subject.state == state

    async def test_poll_no_condition(self, subject: ConditionDevice):
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.poll()

        assert subject.state == DeviceStatus.UNKNOWN

        self.variable_manager.get_device.assert_not_called()

    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    async def test_turn_x_condition_true(self, mocker: MockerFixture, state: DeviceStatus):
        subject = self.create_subject(mocker)

        opposite = DeviceStatus.OFF if state == DeviceStatus.ON else DeviceStatus.ON

        device_variable = mocker.Mock()
        type(device_variable).state = PropertyMock(
            side_effect=[opposite, state]
        )

        self.variable_manager.get_device = lambda name: device_variable if name == state else None

        assert subject.state == DeviceStatus.UNKNOWN

        if state == DeviceStatus.ON:
            await subject.turn_on()
        else:
            await subject.turn_off()

        assert subject.state == state

        if state == DeviceStatus.ON:
            self.device.turn_on.assert_called_once()
            self.device.turn_off.assert_not_called()
        else:
            self.device.turn_off.assert_called_once()
            self.device.turn_on.assert_not_called()

    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    async def test_turn_x_condition_false(self, mocker: MockerFixture, state: DeviceStatus):
        subject = self.create_subject(mocker)

        opposite = DeviceStatus.OFF if state == DeviceStatus.ON else DeviceStatus.ON

        device_variable = mocker.Mock()
        type(device_variable).state = PropertyMock(
            side_effect=[opposite, opposite, opposite]
        )

        self.variable_manager.get_device = lambda name: device_variable if name == state else None

        assert subject.state == DeviceStatus.UNKNOWN

        if state == DeviceStatus.ON:
            await subject.turn_on()
        else:
            await subject.turn_off()

        assert subject.state == state

        self.device.turn_on.assert_not_called()
        self.device.turn_off.assert_not_called()

    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    async def test_turn_x_condition_none(self, subject: ConditionDevice, state: DeviceStatus):
        assert subject.state == DeviceStatus.UNKNOWN

        if state == DeviceStatus.ON:
            await subject.turn_on()
        else:
            await subject.turn_off()

        assert subject.state == state

        self.variable_manager.get_device.assert_not_called()

        if state == DeviceStatus.ON:
            self.device.turn_on.assert_called_once()
            self.device.turn_off.assert_not_called()
        else:
            self.device.turn_off.assert_called_once()
            self.device.turn_on.assert_not_called()

    @pytest.fixture
    def subject(self, mocker: MockerFixture):
        self.create_subject(mocker)

        return ConditionDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, self.variable_manager,
            name='condition', device='test_device',
            poll_frequency=60
        )
