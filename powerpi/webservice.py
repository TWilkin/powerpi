from argparse import ArgumentParser
from flask import Flask
from jinja2 import Environment, PackageLoader, select_autoescape
from devices import DeviceManager

import json
import sys


# initialise globals
app = Flask(__name__)
env = Environment(
    loader=PackageLoader('powerpi', 'templates'),
    autoescape=select_autoescape(['html'])
)


class CustomArgumentParser(ArgumentParser):
    """Custom ArgumentParser to support printing help text with errors."""

    def error(self, message):
        print(message)
        self.print_help()
        sys.exit(-1)


def main():
    # argument parser
    parser = CustomArgumentParser(prog='powerpi', description='PowerPi Home Automation server')
    parser.add_argument('-c', '--config', metavar='config_file_path', dest='config', required=True,
                        help='The location of the configuration JSON file.')
    args = parser.parse_args()

    # read configuration file
    with open(args.config, 'r') as config_file:
        config = json.load(config_file)

    # set defaults
    if 'ip' not in config:
        config['ip'] = '0.0.0.0'
    if 'port' not in config:
        config['port'] = 5000

    # initialise DeviceManager
    if 'devices' in config:
        DeviceManager.load(config['devices'])

    # start flask
    app.run(host=config['ip'], port=int(config['port']))


# Flask routines
@app.route('/', methods=['GET'])
def index():
    content = 'index.html'
    return __render(content, something='This text!')


def __render(content, **kws):
    layout = env.get_template('layout.html')
    return layout.render(content=content, **kws)


if __name__ == '__main__':
    main()
