from common.config import Config

# import the appropriate implementation of SocketDevice
if Config.instance().is_ener314_rt:
    from . ener314rt import SocketDevice, SocketGroupDevice
else:
    from . ener314 import SocketDevice, SocketGroupDevice
