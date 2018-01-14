import copy
import time


class Device(object):

    def __init__(self, device_type):
        self.__device_type = device_type

    def __call__(self, cls):
        device_type = self.__device_type

        class __Wrapper(cls):

            def __init__(self, name, icon=None, visible=True, **kws):
                self.__name = name
                self.__icon = icon
                self.__device_type = device_type
                self.__status = 'unknown'

                # set the visible flag
                if visible == 'True' or visible == 'true':
                    visible = True
                elif visible == 'False' or visible == 'false':
                    visible = False
                self.__visible = visible

                cls.__init__(self, **kws)

                # register the device instance
                DeviceManager.register(device_type, self)

            def __str__(self):
                return '%s(%s)' % (cls, self.name)

            @property
            def name(self):
                return self.__name

            @property
            def icon(self):
                return self.__icon

            @property
            def device_type(self):
                return self.__device_type

            @property
            def status(self):
                return self.__status

            @status.setter
            def status(self, value):
                if value != 'on' and value != 'off':
                    raise ValueError('Unrecognised status %s.' % value)
                self.__status = value

            @property
            def visible(self):
                return self.__visible

        # register the device type
        DeviceManager.register_type(device_type, __Wrapper)

        return __Wrapper


class DeviceManager(object):

    __types = {}
    __devices = {}

    @classmethod
    def register_type(cls, device_type, device_cls):
        cls.__types[device_type] = device_cls
        print('Registered %s as %s' % (device_cls, device_type))

    @classmethod
    def register(cls, device_type, device):
        # create a list of devices with this type
        if device_type not in cls.__devices:
            device_list = []
            cls.__devices[device_type] = device_list
        else:
            device_list = cls.__devices[device_type]

        # add the device
        device_list.append(device)

        print('Registered %s as a %s' % (device, device_type))

    @classmethod
    def get(cls):
        devices = []
        for _, device_list in cls.__devices.items():
            devices.extend(device_list)
        return devices

    @classmethod
    def get_device(cls, name, device_type=None, device_cls=None):
        # if the class is set, find the device_type
        if device_cls is not None:
            for key, value in cls.__types.items():
                if device_cls == value:
                    device_type = key
                    break

        # if the type is set, search for the device by name
        if device_type is not None:
            for device in cls.__devices[device_type]:
                if name == device.name:
                    print('Found %s' % device)
                    return device

        # search all types
        for _, devices in cls.__devices.items():
            for device in devices:
                if name == device.name:
                    print('Found %s' % device)
                    return device

        # the device could not be found
        return None

    @classmethod
    def load(cls, devices):
        # iterate over the devices and create them
        for device in devices:
            device_type = device['type']
            args = copy.deepcopy(device)
            args.pop('type')

            cls.__instantiate(device_type, **args)

    @classmethod
    def __instantiate(cls, device_type, **kws):
        device_cls = cls.__types[device_type]
        instance = device_cls(**kws)
        print('Created %s' % instance)
        return instance


@Device(device_type='composite')
class CompositeDevice(object):

    def __init__(self, devices):
        self.__devices = []
        for device in devices:
            d = DeviceManager.get_device(device)
            self.__devices.append(d)

    def turn_on(self):
        for device in self.__devices:
            device.turn_on()

    def turn_off(self):
        for device in reversed(self.__devices):
            device.turn_off()


@Device(device_type='delay')
class DelayDevice(object):

    def __init__(self, start=5, end=5):
        self.__start = int(start)
        self.__end = int(end)

    def turn_on(self):
        time.sleep(self.__start)

    def turn_off(self):
        time.sleep(self.__end)
