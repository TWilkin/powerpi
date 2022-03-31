from .aqara import add_aqara_sensors
from .osram import add_osram_sensors


def add_sensors(container):
    add_aqara_sensors(container)
    add_osram_sensors(container)
