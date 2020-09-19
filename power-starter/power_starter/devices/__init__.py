from . devices import DeviceManager

try:
    from . energenie import SocketDevice
except:
    # not running on a Pi
    pass

from . harmony import HarmonyActivityDevice, HarmonyHubDevice
from . lifx import LightDevice
