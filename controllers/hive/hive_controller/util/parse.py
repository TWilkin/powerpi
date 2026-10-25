from typing import Type, TypeVar

from dacite import from_dict

TRESULT = TypeVar('TRESULT')


def parse(target: Type[TRESULT], alias_map: dict, result: dict) -> TRESULT:
    def remap_recursive(data: dict) -> dict | list:
        if isinstance(data, dict):
            return {
                alias_map.get(key, key): remap_recursive(value)
                for key, value in data.items()
            }

        if isinstance(data, list):
            return [remap_recursive(item) for item in data]

        return data

    aliased = remap_recursive(result)

    return from_dict(target, aliased)
