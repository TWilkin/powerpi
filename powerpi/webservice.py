from argparse import ArgumentParser
from flask import Flask, request
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
    parser.add_argument('-t', '--test', dest='test', action='store_true',
                        help='Whether to run in test mode, and not actually turn devices on/off.')
    args = parser.parse_args()

    # read configuration file
    with open(args.config, 'r') as config_file:
        config = json.load(config_file)

    # set defaults
    if 'ip' not in config:
        config['ip'] = '0.0.0.0'
    if 'port' not in config:
        config['port'] = 5000
    global test
    test = args.test

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


@app.route('/on', methods=['GET'])
def on():
    global test
    try:
        device = __get_device()
        if not test:
            device.turn_on()
        return status()
    except Exception as ex:
        return '{"error": "%s"}' % ex.args[0]


@app.route('/off', methods=['GET'])
def off():
    global test
    try:
        device = __get_device()
        if not test:
            device.turn_off()
        return status()
    except Exception as ex:
        return '{"error": "%s"}' % ex.args[0]


@app.route('/status', methods=['GET'])
def status():
    try:
        response = '['
        first = True
        for device in DeviceManager.get():
            if first:
                first = False
            else:
                response += ', '

            response += '{"device": "%s", "status": "%s"}' % (device.name, device.status)
        response += ']'

        return response
    except Exception as ex:
        return '{"error": "%s"}' % ex.args[0]


def __render(content, **kws):
    layout = env.get_template('layout.html')
    return layout.render(content=content, **kws)


def __get_device():
    device = request.args.get('device')
    if device is None or device.strip() == '':
        raise ValueError('device is a required parameter.')

    instance = DeviceManager.get_device(device)
    if instance is None:
        raise ValueError('Cannot find device %s.' % device)

    return instance


if __name__ == '__main__':
    main()
