from os import getuid

from icmplib import async_ping


async def ping(network_address: str, count=1):
    is_root = getuid() == 0

    return await async_ping(
        network_address,
        count=count,
        interval=0.2,
        timeout=2,
        privileged=is_root
    )
