from dependency_injector import providers


class DeviceScheduleFactory:
    '''
    Builds the appropriate DeviceSchedule instance based on the config.
    '''

    def __init__(
        self,
        device_interval_schedule_factory: providers.Factory
    ):
        self.__device_interval_schedule_factory = device_interval_schedule_factory

    def build(self, **kwargs):
        return self.__device_interval_schedule_factory(**kwargs)
