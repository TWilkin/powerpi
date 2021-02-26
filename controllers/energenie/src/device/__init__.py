from common.config import Config

config = Config.instance()
logger = config.logger()

# import the appropriate implementation of SocketDevice
try:
    if config.is_ener314_rt:
        from . ener314rt import SocketDevice, SocketGroupDevice
    else:
        from . ener314 import SocketDevice, SocketGroupDevice
except:
    if config.device_fatal:
        logger.error('DEVICE_FATAL=true, must be run on Raspberry Pi')
        raise
    
    # for testing off a Pi
    logger.warn('DEVICE_FATAL=false, no sockets will turn on/off')
    from . socket import SocketDevice, SocketGroupDevice
