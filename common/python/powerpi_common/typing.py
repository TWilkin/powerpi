from typing import TYPE_CHECKING


#pylint: disable=invalid-name
AdditionalStateDeviceType = "AdditionalStateDevice"
DeviceType = "Device"
SensorType = "Sensor"


if TYPE_CHECKING:
    import powerpi_common.device.device
    import powerpi_common.device.additional_state
    import powerpi_common.sensor.sensor

    AdditionalStateDeviceType = powerpi_common.device.additional_state.AdditionalStateDevice
    DeviceType = powerpi_common.device.device.Device
    SensorType = powerpi_common.sensor.sensor.Sensor
