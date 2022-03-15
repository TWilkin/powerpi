from typing import Type


def ismixin(obj: object, object_type: Type[object]):
    return issubclass(type(obj), object_type)
