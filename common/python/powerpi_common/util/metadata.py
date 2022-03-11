import toml

from pathlib import Path


def get_metadata():
    content = Path('pyproject.toml').read_text()
    metadata = toml.loads(content)

    return metadata['tool']['poetry']

def get_name():
    return get_metadata()['name']

def get_version():
    return get_metadata()['version']
