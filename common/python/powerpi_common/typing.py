from typing import TYPE_CHECKING, TypeAlias

if TYPE_CHECKING:
    import powerpi_common.device.additional_state
    import powerpi_common.device.device
    import powerpi_common.device.manager
    import powerpi_common.sensor.sensor

    AdditionalStateDeviceType = powerpi_common.device.additional_state.AdditionalStateDevice
    DeviceType = powerpi_common.device.device.Device
    DeviceManagerType = powerpi_common.device.manager.DeviceManager
    SensorType = powerpi_common.sensor.sensor.Sensor
else:
    AdditionalStateDeviceType: TypeAlias = "AdditionalStateDevice"
    DeviceType: TypeAlias = "Device"
    DeviceManagerType: TypeAlias = "DeviceManager"
    SensorType: TypeAlias = "Sensor"
