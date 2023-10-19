from dataclasses import dataclass
from typing import Dict, List

from dacite import from_dict


@dataclass
class Host:
    ip: str
    name: str
    mac: str


@dataclass
class Client:
    id: str
    connected: bool
    host: Host


@dataclass
class Group:
    id: str
    muted: bool
    name: str
    stream_id: str
    clients: List[Client]


@dataclass
class Stream:
    id: str
    status: str


@dataclass
class Server:
    groups: List[Group]
    streams: List[Stream]


@dataclass
class StatusResponse:
    server: Server

    @classmethod
    def from_dict(cls, data: Dict):
        return from_dict(StatusResponse, data)
