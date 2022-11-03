from collections import OrderedDict
from time import time
from typing import Union

import aiofiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from node_controller.config import NodeConfig
from node_controller.pijuice import PiJuiceInterface
from powerpi_common.logger import Logger, LogMixin

from .dummy import DummyPWMFanInterface
from .interface import PWMFanCurve, PWMFanInterface

# the pins used in the GPIO
FAN_PIN = 18
TACH_PIN = 24

# settings for Noctua fan
PWM_FREQUENCY = 25
PULSE_PER_TURN = 2


class PWMFanController(PWMFanInterface, LogMixin):
    # pylint: disable=too-many-instance-attributes
    def __new__(
        cls,
        config: NodeConfig,
        logger: Logger,
        scheduler: AsyncIOScheduler,
        pijuice: Union[PiJuiceInterface, None]
    ):
        # pylint: disable=broad-except, import-outside-toplevel, unused-argument
        try:
            instance = super().__new__(cls)

            # import the library here so we can capture that exception
            from RPi import GPIO
            instance.__connect(GPIO)

            return instance
        except Exception as ex:
            logger.error(ex)

            if config.device_fatal:
                logger.error('DEVICE_FATAL=true, must be run on Raspberry Pi')
                raise ex

            # for testing off a Pi
            logger.warn(
                'DEVICE_FATAL=false, using dummy device, no fan control'
            )

            return DummyPWMFanInterface()

    def __init__(
        self,
        config: NodeConfig,
        logger: Logger,
        scheduler: AsyncIOScheduler,
        pijuice: Union[PiJuiceInterface, None]
    ):
        # pylint: disable=unused-argument
        self._logger = logger
        self.__scheduler = scheduler
        self.__pijuice = pijuice

        self.__curve: OrderedDict = {}
        self.__curve_keys = []
        self.__curve_values = []

        self.__fan = None
        self.__current_speed = 0
        self.__start_time = time()

        self.__cpu_temps = []
        self.__battery_temps = []
        self.__fan_speeds = []

    @property
    def curve(self):
        return self.__curve

    @curve.setter
    def curve(self, new_value: PWMFanCurve):
        new_curve = {}
        for value in new_value:
            new_curve[value['temperature']] = value['speed']

        self.__curve = OrderedDict(sorted(new_curve.items()))

        self.__curve_keys = list(self.__curve.keys())
        self.__curve_values = list(self.__curve.values())

    @property
    def cpu_temps(self):
        return self.__cpu_temps

    @property
    def battery_temps(self):
        return self.__battery_temps

    @property
    def fan_speeds(self):
        return self.__fan_speeds

    @property
    def fan_speed_percentage(self):
        return self.__current_speed

    def clear(self):
        self.__cpu_temps = []
        self.__battery_temps = []
        self.__fan_speeds = []

    async def initialise(self):
        gpio = self.__gpio

        gpio.setwarnings(False)
        gpio.setmode(gpio.BCM)

        gpio.setup(FAN_PIN, gpio.OUT, initial=gpio.LOW)
        gpio.setup(TACH_PIN, gpio.IN, pull_up_down=gpio.PUD_UP)

        self.__fan = gpio.PWM(FAN_PIN, PWM_FREQUENCY)

        # add to the scheduler
        interval = IntervalTrigger(seconds=1)
        self.__scheduler.add_job(self.update, trigger=interval)

        # add a listener for fan speed change
        gpio.add_event_detect(
            TACH_PIN,
            gpio.FALLING,
            lambda _: self.__get_fan_speed()
        )

        self.__set_fan_speed(100)

    async def deinitialise(self):
        # put it to 100% as we're no longer monitoring it
        self.__set_fan_speed(100)

        self.__gpio.cleanup()

    async def update(self):
        cpu_temp = await self.__get_cpu_temperature()
        battery_temp = await self.__get_battery_temperature()
        temp = max(cpu_temp, battery_temp)

        # identify which value it's between
        position = 0
        low = (0, 0)
        high = (temp, 100)
        for value, speed in self.__curve.items():
            if temp < value:
                # get the previous point on the curve
                if position == 0:
                    low = (0, 0)
                else:
                    low = (
                        self.__curve_keys[position - 1],
                        self.__curve_values[position - 1]
                    )

                # get the next point on the curve
                high = (value, speed)

                break

            position += 1

        # calculate a new value proportionally between the points
        step = (high[1] - low[1]) / (high[0] - low[0])
        adjusted_temp = temp - low[0]
        new_speed = low[1] + (round(adjusted_temp) * step)
        new_speed = min(100, max(new_speed, 0))

        if new_speed != self.__current_speed:
            self.__set_fan_speed(new_speed)

    def __connect(self, gpio):
        # pylint: disable=unused-private-member
        self.__gpio = gpio

    def __set_fan_speed(self, new_value: float):
        if self.__fan is not None:
            self.log_debug(f'Setting fan speed to {new_value}%')

            self.__fan.start(new_value)
            self.__current_speed = new_value

    async def __get_cpu_temperature(self):
        async with aiofiles.open('/sys/class/thermal/thermal_zone0/temp', 'r') as temp_file:
            content = await temp_file.read()

            temp = int(content) / 1000
            self.log_debug(f'CPU temp {temp}°C')

            self.__cpu_temps.append(temp)

            return temp

    async def __get_battery_temperature(self):
        if self.__pijuice:
            temp = self.__pijuice.battery_temperature
            self.log_debug(f'Battery temp {temp}°C')

            self.__battery_temps.append(temp)

            return temp

        return 0

    def __get_fan_speed(self):
        delta_time = time() - self.__start_time

        if delta_time < 0.005:
            return

        freq = 1 / delta_time
        rpm = (freq / PULSE_PER_TURN) * 60

        self.__start_time = time()

        self.__fan_speeds.append(rpm)
