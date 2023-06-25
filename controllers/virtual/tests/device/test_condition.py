from asyncio import Future
from unittest.mock import MagicMock, Mock, PropertyMock

import pytest
from powerpi_common.device import DeviceStatus
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import (DeviceOrchestratorMixinTestBase,
                                              PollableMixinTestBase)
from pytest_mock import MockerFixture

from virtual_controller.device.condition import ConditionDevice


class TestCondition(
    DeviceTestBase,
    DeviceOrchestratorMixinTestBase,
    PollableMixinTestBase
):

    @pytest.mark.asyncio
    async def test_initialise(
        self,
        subject: ConditionDevice,
        variable_manager: Mock,
        mocker: MockerFixture
    ):
        await subject.initialise()

        variable_manager.get_device.assert_has_calls([
            mocker.call('on'),
            mocker.call('off')
        ])

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    async def test_poll_updates_state(
        self,
        subject: ConditionDevice,
        variable_manager: Mock,
        mocker: MockerFixture,
        state: DeviceStatus
    ):
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
        variable_manager.get_device = get_variable

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.poll()

        assert subject.state == state

    @pytest.mark.asyncio
    async def test_poll_no_condition(
        self,
        no_condition_subject: ConditionDevice,
        variable_manager: Mock
    ):
        subject = no_condition_subject

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.poll()

        assert subject.state == DeviceStatus.UNKNOWN

        variable_manager.get_device.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    async def test_turn_x_condition_true(
        self,
        subject: ConditionDevice,
        device: MagicMock,
        variable_manager: Mock,
        mocker: MockerFixture,
        state: DeviceStatus
    ):
        # pylint: disable=too-many-arguments
        opposite = DeviceStatus.OFF if state == DeviceStatus.ON else DeviceStatus.ON

        device_variable = mocker.Mock()
        type(device_variable).state = PropertyMock(
            side_effect=[opposite, state]
        )

        variable_manager.get_device = lambda name: device_variable if name == state else None

        assert subject.state == DeviceStatus.UNKNOWN

        if state == DeviceStatus.ON:
            await subject.turn_on()
        else:
            await subject.turn_off()

        assert subject.state == state

        if state == DeviceStatus.ON:
            device.turn_on.assert_called_once()
            device.turn_off.assert_not_called()
        else:
            device.turn_off.assert_called_once()
            device.turn_on.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    async def test_turn_x_condition_false(
        self,
        subject: ConditionDevice,
        device: MagicMock,
        variable_manager: Mock,
        mocker: MockerFixture,
        state: DeviceStatus
    ):
        # pylint: disable=too-many-arguments
        opposite = DeviceStatus.OFF if state == DeviceStatus.ON else DeviceStatus.ON

        device_variable = mocker.Mock()
        type(device_variable).state = PropertyMock(
            side_effect=[opposite, opposite, opposite]
        )

        variable_manager.get_device = lambda name: device_variable if name == state else None

        assert subject.state == DeviceStatus.UNKNOWN

        if state == DeviceStatus.ON:
            await subject.turn_on()
        else:
            await subject.turn_off()

        assert subject.state == state

        device.turn_on.assert_not_called()
        device.turn_off.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    async def test_turn_x_condition_none(
        self,
        no_condition_subject: ConditionDevice,
        device: MagicMock,
        variable_manager: Mock,
        state: DeviceStatus
    ):
        subject = no_condition_subject

        assert subject.state == DeviceStatus.UNKNOWN

        if state == DeviceStatus.ON:
            await subject.turn_on()
        else:
            await subject.turn_off()

        assert subject.state == state

        variable_manager.get_device.assert_not_called()

        if state == DeviceStatus.ON:
            device.turn_on.assert_called_once()
            device.turn_off.assert_not_called()
        else:
            device.turn_off.assert_called_once()
            device.turn_on.assert_not_called()

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        device_manager,
        variable_manager
    ):
        # pylint: disable=too-many-arguments
        return ConditionDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, device_manager, variable_manager,
            name='condition',
            device='test_device',
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

    @pytest.fixture
    def no_condition_subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        device_manager,
        variable_manager
    ):
        # pylint: disable=too-many-arguments
        return ConditionDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, device_manager, variable_manager,
            name='condition',
            device='test_device',
            poll_frequency=60
        )

    @pytest.fixture
    def device(self, mocker: MockerFixture):
        device = mocker.MagicMock()

        future = Future()
        future.set_result(None)
        device.turn_on.return_value = future
        device.turn_off.return_value = future

        return device

    @pytest.fixture
    def device_manager(self, device: MagicMock, mocker: MockerFixture):
        manager = mocker.MagicMock()

        manager.get_device = lambda name: device if name == 'test_device' else None

        return manager

    @pytest.fixture
    def variable_manager(self, mocker: MockerFixture):
        return mocker.Mock()
