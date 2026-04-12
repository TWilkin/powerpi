from os import getenv, getuid

from powerpi_common.config import Config
from powerpi_common.config.config import as_int


class NetworkConfig(Config):
    @property
    def is_root(self):
        return getuid() == 0

    @property
    def arp_cache_expiry(self):
        value = as_int(getenv("ARP_CACHE_EXPIRY"))
        return value if value is not None else 60
