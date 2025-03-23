from abc import abstractmethod
from dataclasses import dataclass
from typing import List

from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Attribute, GeneralCommand, Status, ZCLHeader

from zigbee_controller.zigbee import ClusterGeneralCommandListener
from .bind import ZigbeeBindMixin


@dataclass
class AttributeReport:
    attribute_reports: List[Attribute]


class ZigbeeReportMixin(ZigbeeBindMixin):
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

        self.__add_report_listener(cluster)

        await self._bind([cluster])

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
                'Registered %d of %d report(s), will try again later',
                success,
                len(reports)
            )
            return

        self.log_info('Registered %d report(s)', len(reports))

    def __add_report_listener(self, cluster: Cluster):
        def on_report(frame: ZCLHeader, report: AttributeReport):
            if frame.command_id != GeneralCommand.Report_Attributes:
                return

            for attribute in report.attribute_reports:
                self.on_report(cluster, attribute)

        cluster.add_listener(
            ClusterGeneralCommandListener(on_report)
        )
