# pylint: disable=unused-import

import sys
from unittest.mock import MagicMock

# pcap requires libpcap and a C compiler; mock it out since tests never use the real module
sys.modules['pcap'] = MagicMock()

import pytest
from powerpi_common_test.fixture import (
    powerpi_config,
    powerpi_device_manager,
    powerpi_logger,
    powerpi_mqtt_client,
    powerpi_mqtt_producer,
    powerpi_service_provider,
)
