from typing import Any, Dict
from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.device import DeviceStatus
from pytest_mock import MockerFixture

from event.services.actions import ActionFactory
from event.services.actions.factory import ActionNotFoundException


class TestActionFactory:
    @pytest.mark.parametrize('action', [
        {'unrecognisable': 'action'},
        {'state': 'wrong'},
    ])
    def test_build_no_action(
        self,
        subject: ActionFactory,
        powerpi_service_provider: MagicMock,
        action: Dict[str, Any]
    ):
        with pytest.raises(ActionNotFoundException) as ex:
            subject.build(action)

        assert ex.match('^Cannot find action type for')

        powerpi_service_provider.action_device_power.assert_not_called()
        powerpi_service_provider.action_device_additional_state.assert_not_called()
        powerpi_service_provider.action_device_scene.assert_not_called()

    @pytest.mark.parametrize('state', [DeviceStatus.ON, DeviceStatus.OFF])
    def test_build_power(
        self,
        subject: ActionFactory,
        powerpi_service_provider: MagicMock,
        mocker: MockerFixture,
        state: DeviceStatus
    ):
        factory = mocker.MagicMock()
        type(powerpi_service_provider).action_device_power = PropertyMock(
            return_value=factory
        )

        result = subject.build({'state': state})

        assert result is not None
        assert result.action_type == 'action_device_power'

        powerpi_service_provider.action_device_power.assert_called_once()
        powerpi_service_provider.action_device_additional_state.assert_not_called()
        powerpi_service_provider.action_device_scene.assert_not_called()

        factory.assert_called_once_with(state=state)

    @pytest.mark.parametrize('scene', ['SomeScene', None])
    def test_build_additional_state(
        self,
        subject: ActionFactory,
        powerpi_service_provider: MagicMock,
        mocker: MockerFixture,
        scene: str | None
    ):
        factory = mocker.MagicMock()
        type(powerpi_service_provider).action_device_additional_state = PropertyMock(
            return_value=factory
        )

        result = subject.build({'scene': scene, 'patch': {'something'}})

        assert result is not None
        assert result.action_type == 'action_device_additional_state'

        powerpi_service_provider.action_device_power.assert_not_called()
        powerpi_service_provider.action_device_additional_state.assert_called_once()
        powerpi_service_provider.action_device_scene.assert_not_called()

        factory.assert_called_once_with(scene=scene, patch={'something'})

    def test_build_scene(
        self,
        subject: ActionFactory,
        powerpi_service_provider: MagicMock,
        mocker: MockerFixture
    ):
        factory = mocker.MagicMock()
        type(powerpi_service_provider).action_device_scene = PropertyMock(
            return_value=factory
        )

        result = subject.build({'scene': 'SomeScene'})

        assert result is not None
        assert result.action_type == 'action_device_scene'

        print(powerpi_service_provider.action_device_power)

        powerpi_service_provider.action_device_power.assert_not_called()
        powerpi_service_provider.action_device_additional_state.assert_not_called()
        powerpi_service_provider.action_device_scene.assert_called_once()

        factory.assert_called_once_with(scene='SomeScene')

    @pytest.fixture
    def subject(self, powerpi_service_provider: MagicMock):
        return ActionFactory(powerpi_service_provider)
