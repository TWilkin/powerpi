# pylint: disable=unused-import

from powerpi_common_test.fixture import (
    powerpi_config,
    powerpi_device_manager,
    powerpi_logger,
    powerpi_mqtt_client,
    powerpi_mqtt_producer,
    powerpi_variable_manager,
    powerpi_service_provider,
)
import pytest
import sys
from unittest.mock import MagicMock

# pcap requires libpcap and a C compiler; mock it out since tests never use the real module
sys.modules['pcap'] = MagicMock()
