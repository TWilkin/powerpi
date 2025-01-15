from typing import List

from zigpy.zcl.clusters import Cluster


class ZigbeeReportMixin:
    '''
    Mixin to be used to bind to a cluster to listen for reports on a schedule.
    Expected to be used alongside ZigbeeMixin.
    '''

    async def _register_reports(self, cluster: Cluster, attributes: List[str], frequency: int):
        '''
        Register for reports for the specified cluster attributes at the specified frequency.
        '''
        if len(attributes) == 0:
            return

        count = 0
        while count <= 2:
            try:
                await cluster.bind()

                reports = {}
                for attribute in attributes:
                    reports[attribute] = (frequency, frequency, 1)

                await cluster.configure_reporting_multiple(reports)

                self.log_info('Registered %d report(s)', len(reports))

                return
            except TimeoutError:
                self.log_warning(
                    'Bind failed, likely the device is not on, will try again when it rejoins'
                )

                count += 1
