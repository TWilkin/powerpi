from abc import ABC, abstractmethod
from asyncio import get_event_loop
from dataclasses import dataclass
from typing import List

from zigpy.types import EUI64
from zigpy.typing import DeviceType
from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Attribute, GeneralCommand, Status, ZCLHeader

from zigbee_controller.zigbee import DeviceJoinListener, ClusterGeneralCommandListener


@dataclass
class AttributeReport:
    attribute_reports: List[Attribute]


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

    async def _register_reports(self, cluster: Cluster, attributes: List[str], frequency: int):
        '''
        Register for reports for the specified cluster attributes at the specified frequency.
        '''
        if len(attributes) == 0:
            return

        registered = False

        async def register():
            try:
                await cluster.bind()

                reports = {}
                for attribute in attributes:
                    reports[attribute] = (frequency, frequency, 0)

                result = await cluster.configure_reporting_multiple(reports)

                success = sum(
                    1 if record is not None and record.status == Status.SUCCESS else 0
                    for record in result.status_records
                )
                if success != len(reports):
                    self.log_warning(
                        'Registered %d of %d reports(s), will try again later',
                        success,
                        len(reports)
                    )
                    return

                self.log_info('Registered %d report(s)', len(reports))

                nonlocal registered
                registered = True

                return
            except TimeoutError:
                self.log_warning(
                    'Bind failed, likely the device is not on, will try again when it rejoins'
                )

        def on_device_join(device: DeviceType):
            nonlocal registered

            ieee = EUI64(device.ieee)

            if not registered and ieee == self.ieee and device.nwk == self.nwk:
                # this is the current device, so we can call register again
                loop = get_event_loop()
                loop.run_until_complete(register())

        self._zigbee_controller.add_listener(
            DeviceJoinListener(on_device_join)
        )

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
