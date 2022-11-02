from collections import OrderedDict
from typing import Dict, Union

import aiofiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from node_controller.pijuice import PiJuiceInterface
from powerpi_common.device.mixin import InitialisableMixin
from powerpi_common.logger import Logger, LogMixin
from RPi import GPIO

# the pins used in the GPIO
FAN_PIN = 18

# settings for Noctua fan
PWM_FREQUENCY = 25


class PWMFanService(InitialisableMixin, LogMixin):
    # pylint: disable=too-many-instance-attributes
    def __init__(
        self,
        logger: Logger,
        scheduler: AsyncIOScheduler
    ):
        self._logger = logger
        self.__scheduler = scheduler
        self.__pijuice: Union[PiJuiceInterface, None] = None

        self.__curve: OrderedDict = {}
        self.__curve_keys = []
        self.__curve_values = []

        self.__fan = None
        self.__current_speed = 0

    @property
    def curve(self):
        return self.__curve

    @curve.setter
    def curve(self, new_value: Dict[int, int]):
        self.__curve = OrderedDict(sorted(new_value.items()))
        self.__curve_keys = list(self.__curve.keys())
        self.__curve_values = list(self.__curve.values())

    @property
    def current_speed(self):
        return self.__current_speed

    @property
    def pijuice(self):
        return self.__pijuice

    @pijuice.setter
    def pijuice(self, pijuice: Union[PiJuiceInterface, None]):
        self.__pijuice = pijuice

    async def initialise(self):
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)

        GPIO.setup(FAN_PIN, GPIO.OUT, initial=GPIO.LOW)

        self.__fan = GPIO.PWM(FAN_PIN, PWM_FREQUENCY)

        # add to the scheduler
        interval = IntervalTrigger(seconds=1)
        self.__scheduler.add_job(self.update, trigger=interval)

    async def deinitialise(self):
        # put it to 100% as we're no longer monitoring it
        self.__set_fan_speed(100)

        GPIO.cleanup()

    async def update(self):
        cpu_temp = await self.__get_cpu_temperature()
        battery_temp = await self.__get_battery_temperature()
        temp = max(cpu_temp, battery_temp)

        # identify which value it's between
        position = 0
        low = (0, 0)
        high = (100, 100)
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

            return temp

    async def __get_battery_temperature(self):
        if self.__pijuice:
            temp = self.__pijuice.battery_temperature
            self.log_debug(f'Battery temp {temp}°C')

            return temp

        return 0
