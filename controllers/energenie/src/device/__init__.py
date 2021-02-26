from common.config import Config

# import the appropriate implementation of SocketDevice
try:
    if Config.instance().is_ener314_rt:
        from . ener314rt import SocketDevice, SocketGroupDevice
    else:
        from . ener314 import SocketDevice, SocketGroupDevice
except:
    if Config.instance().device_fatal:
        raise
    
    # for testing off a Pi
    from . device import SocketDevice, SocketGroupDevice
