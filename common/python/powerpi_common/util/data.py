from typing import Tuple


def restrict(value: int, value_range: Tuple[int, int]):
    min_value, max_value = value_range

    return max(min_value, min(max_value, value))
