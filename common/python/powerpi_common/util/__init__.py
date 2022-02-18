from inspect import iscoroutinefunction
from typing import Awaitable, Callable


async def await_or_sync(func: Awaitable or Callable, *args, **kwargs):
    if iscoroutinefunction(func):
        return await func(*args, **kwargs)
    
    return func(*args, **kwargs)
