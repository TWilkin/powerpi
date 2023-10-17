from dependency_injector import providers


def add_devices(container):
    common_container = container.common()
    device_container = common_container.device()
