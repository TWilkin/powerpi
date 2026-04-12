import pytest

from network_controller.services.arp import ARPProvider, HostAddress


class ConcreteARPProvider(ARPProvider):
    def __init__(self, table, logger):
        self._logger = logger
        self._table = table

    @property
    def table(self):
        return self._table


class TestARPProvider:

    @pytest.mark.parametrize('table,search,expected', [
        pytest.param(
            [HostAddress(
                mac_address='aa:bb',
                ip_address='1.2.3.4',
                hostname='host1'
            )],
            HostAddress(mac_address='aa:bb'),
            HostAddress(
                mac_address='aa:bb',
                ip_address='1.2.3.4',
                hostname='host1'
            ),
            id='match_by_mac',
        ),
        pytest.param(
            [HostAddress(
                mac_address='aa:bb',
                ip_address='1.2.3.4',
                hostname='host1'
            )],
            HostAddress(ip_address='1.2.3.4'),
            HostAddress(
                mac_address='aa:bb',
                ip_address='1.2.3.4',
                hostname='host1'
            ),
            id='match_by_ip',
        ),
        pytest.param(
            [HostAddress(
                mac_address='aa:bb',
                ip_address='1.2.3.4',
                hostname='host1'
            )],
            HostAddress(hostname='host1'),
            HostAddress(
                mac_address='aa:bb',
                ip_address='1.2.3.4',
                hostname='host1'
            ),
            id='match_by_hostname',
        ),
        pytest.param(
            [
                HostAddress(mac_address='aa:bb', ip_address='5.6.7.8'),
                HostAddress(mac_address='cc:dd', ip_address='1.2.3.4'),
            ],
            HostAddress(mac_address='aa:bb', ip_address='1.2.3.4'),
            HostAddress(mac_address='aa:bb', ip_address='5.6.7.8'),
            id='mac_match_takes_priority',
        ),
        pytest.param(
            [HostAddress(mac_address='aa:bb')],
            HostAddress(mac_address='cc:dd'),
            None,
            id='no_match',
        ),
        pytest.param(
            [],
            HostAddress(mac_address='aa:bb'),
            None,
            id='empty_table',
        ),
        pytest.param(
            [HostAddress(mac_address='aa:bb')],
            HostAddress(),
            None,
            id='all_fields_none',
        ),
    ])
    def test_find(
        self,
        subject,
        table: list[HostAddress],
        search: HostAddress,
        expected: HostAddress | None,
    ):
        reader = subject(table)

        result = reader.find(search)

        if expected is None:
            assert result is None
        else:
            assert result == expected

    @pytest.fixture
    def subject(self, powerpi_logger):
        def build(table: list[HostAddress]) -> ARPProvider:
            return ConcreteARPProvider(table, powerpi_logger)

        return build
