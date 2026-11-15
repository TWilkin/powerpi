from abc import ABC, abstractmethod
from asyncio import get_event_loop
from dataclasses import dataclass

from zigpy.device import Device as ZigPyDevice
from zigpy.types import EUI64
from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Attribute, GeneralCommand, Status, ZCLAttributeDef, ZCLHeader
from zigpy.zcl.helpers import ReportingConfig

from zigbee_controller.zigbee import (
    AttributeListener,
    DeviceJoinListener,
    ClusterGeneralCommandListener
)


@dataclass
class AttributeReport:
    attribute_reports: list[Attribute]


class ZigbeeReportMixin(ABC):
    '''
    Mixin to be used to bind to a cluster to listen for reports on a schedule.
    Expected to be used alongside ZigbeeMixin.
    '''

    @abstractmethod
    def on_report(self, cluster: Cluster, attribute: Attribute):
        '''
        Override this method to listen to the attribute values registered in the reports.
        '''

    async def _register_reports(self, cluster: Cluster, attributes: list[str], frequency: int):
        '''
        Register for reports for the specified cluster attributes at the specified frequency.
        '''
        if len(attributes) == 0:
            return

        registered = False
        attribute_listener: AttributeListener | None
        join_listener: DeviceJoinListener | None

        async def register():
            try:
                await cluster.bind()

                reports: dict[ZCLAttributeDef, ReportingConfig] = {}
                for attribute in attributes:
                    attribute_def = getattr(cluster.AttributeDefs, attribute)

                    reports[attribute_def] = ReportingConfig(
                        min_interval=frequency,
                        max_interval=frequency,
                        reportable_change=0
                    )

                result = await cluster.configure_reporting_multiple(reports)

                success = sum(
                    1 for record in result
                    if record.status == Status.SUCCESS
                )
                if success != len(reports):
                    self.log_warning(
                        'Registered %d of %d report(s), will try again when it reappears',
                        success,
                        len(reports)
                    )
                    return

                self.log_info('Registered %d report(s)', len(reports))

                nonlocal registered
                registered = True

                nonlocal attribute_listener
                if attribute_listener is not None:
                    self._zigbee_controller.remove_listener(attribute_listener)

                nonlocal join_listener
                if join_listener is not None:
                    self._zigbee_controller.remove_listener(join_listener)

                return
            except TimeoutError:
                self.log_warning(
                    'Bind failed, likely the device is not on, will try again when it reappears'
                )

        def on_device_appear(device: ZigPyDevice):
            nonlocal registered

            self.log_info('Device appeared, re-attempting bind')

            ieee = EUI64(device.ieee)

            if not registered and ieee == self.ieee and device.nwk == self.nwk:
                # this is the current device, so we can call register again
                loop = get_event_loop()
                loop.run_until_complete(register())

        attribute_listener = AttributeListener(on_device_appear)
        join_listener = DeviceJoinListener(on_device_appear)

        self._zigbee_controller.add_listener(attribute_listener)
        self._zigbee_controller.add_listener(join_listener)

        self.__add_report_listener(cluster)

        await register()

    def __add_report_listener(self, cluster: Cluster):
        def on_report(frame: ZCLHeader, report: AttributeReport):
            if frame.command_id != GeneralCommand.Report_Attributes:
                return

            for attribute in report.attribute_reports:
                self.on_report(cluster, attribute)

        cluster.add_listener(
            ClusterGeneralCommandListener(on_report)
        )
