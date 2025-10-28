import os
from unittest.mock import patch

import pytest

from zigbee_controller.config import ZigbeeConfig


class TestZigbeeConfig:
    @pytest.mark.parametrize('env_value,expected', [
        ('/custom/path/zigbee.db', '/custom/path/zigbee.db'),
        ('/another/path.db', '/another/path.db'),
    ])
    def test_database_path_from_env(self, env_value: str, expected: str):
        with patch.dict(os.environ, {'DATABASE_PATH': env_value}):
            config = ZigbeeConfig()
            assert config.database_path == expected

    def test_database_path_default(self):
        with patch.dict(os.environ, {}, clear=True):
            config = ZigbeeConfig()
            assert config.database_path == '/var/data/zigbee.db'

    @pytest.mark.parametrize('env_value,expected', [
        ('bellows', 'bellows'),
        ('znp', 'znp'),
        ('ZNP', 'ZNP'),
    ])
    def test_zigbee_library_from_env(self, env_value: str, expected: str):
        with patch.dict(os.environ, {'ZIGBEE_LIBRARY': env_value}):
            config = ZigbeeConfig()
            assert config.zigbee_library == expected

    def test_zigbee_library_default(self):
        with patch.dict(os.environ, {}, clear=True):
            config = ZigbeeConfig()
            assert config.zigbee_library == 'znp'

    @pytest.mark.parametrize('env_value,expected', [
        ('/dev/ttyUSB0', '/dev/ttyUSB0'),
        ('/dev/ttyACM1', '/dev/ttyACM1'),
    ])
    def test_zigbee_device_from_env(self, env_value: str, expected: str):
        with patch.dict(os.environ, {'ZIGBEE_DEVICE': env_value}):
            config = ZigbeeConfig()
            assert config.zigbee_device == expected

    def test_zigbee_device_default(self):
        with patch.dict(os.environ, {}, clear=True):
            config = ZigbeeConfig()
            assert config.zigbee_device == '/dev/ttyACM0'

    @pytest.mark.parametrize('env_value,expected', [
        ('115200', 115200),
        ('9600', 9600),
        ('57600', 57600),
    ])
    def test_baudrate_from_env(self, env_value: str, expected: str):
        with patch.dict(os.environ, {'ZIGBEE_BAUDRATE': env_value}):
            config = ZigbeeConfig()
            assert config.baudrate == expected
            assert isinstance(config.baudrate, int)

    def test_baudrate_default(self):
        with patch.dict(os.environ, {}, clear=True):
            config = ZigbeeConfig()
            assert config.baudrate is None

    @pytest.mark.parametrize('env_value,expected', [
        ('HARDWARE', 'hardware'),
        ('SOFTWARE', 'software'),
        ('hardware', 'hardware'),
        ('None', 'none'),
    ])
    def test_flow_control_from_env(self, env_value: str, expected: str):
        with patch.dict(os.environ, {'ZIGBEE_FLOW_CONTROL': env_value}):
            config = ZigbeeConfig()
            assert config.flow_control == expected

    def test_flow_control_default(self):
        with patch.dict(os.environ, {}, clear=True):
            config = ZigbeeConfig()
            assert config.flow_control is None
