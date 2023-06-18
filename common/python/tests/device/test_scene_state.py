from typing import Optional

import pytest

from powerpi_common.device.mixin import AdditionalState
from powerpi_common.device.scene_state import SceneState


class TestSceneState:
    def test_defaults(self):
        subject = SceneState()

        assert subject.scene == 'default'
        assert subject.scenes == ['default']

        assert subject.state == {}

        current_scene, current_state = subject.get_scene_state()
        assert current_scene == 'default'
        assert current_state == {}

    def test_is_current_scene(self):
        subject = SceneState()

        assert subject.is_current_scene() is True
        assert subject.is_current_scene('current') is True
        assert subject.is_current_scene('default') is True
        assert subject.is_current_scene('other') is False

        subject.scene = 'other'

        assert subject.is_current_scene() is True
        assert subject.is_current_scene('current') is True
        assert subject.is_current_scene('default') is False
        assert subject.is_current_scene('other') is True

    @pytest.mark.parametrize('additional_state,expected_additional_state', [
        [{'brightness': 10}, {'brightness': 10}],
        [None, {}],
        [{}, {}]
    ])
    def test_update_scene_state(
        self,
        additional_state: Optional[AdditionalState],
        expected_additional_state: AdditionalState
    ):
        subject = SceneState()

        assert subject.scene == 'default'
        assert subject.state == {}

        subject.update_scene_state(
            new_state=additional_state
        )

        assert subject.scene == 'default'
        assert subject.state == expected_additional_state

    def test_change_scene(self):
        subject = SceneState()

        assert subject.scene == 'default'
        assert subject.scenes == ['default']
        assert subject.state == {}

        subject.update_scene_state(
            'other',
            {'brightness': 10}
        )

        assert subject.scene == 'default'
        assert subject.scenes == ['default', 'other']
        assert subject.state == {}

        subject.scene = 'other'

        assert subject.scene == 'other'
        assert subject.scenes == ['default', 'other']
        assert subject.state == {'brightness': 10}

        subject.scene = 'another'

        assert subject.scene == 'another'
        assert subject.scenes == ['default', 'other', 'another']
        assert subject.state == {}

    # pylint: disable=line-too-long
    @pytest.mark.parametrize('additional_state,expected', [
        [{'brightness': 10, 'temperature': 4000},
            "[{'scene': <ReservedScenes.DEFAULT: 'default'>, 'brightness': 10, 'temperature': 4000}]"],
        [None, "[{'scene': <ReservedScenes.DEFAULT: 'default'>}]"]
    ])
    def test_str(self, additional_state: Optional[AdditionalState], expected: str):
        subject = SceneState()

        subject.update_scene_state(new_state=additional_state)

        assert f'{subject}' == expected
