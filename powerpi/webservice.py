from argparse import ArgumentParser
from flask import Flask, request, render_template
from devices import DeviceManager

import json
import sys


# initialise globals
app = Flask(__name__)


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
    print('Testing %s' % test)

    # initialise DeviceManager
    if 'devices' in config:
        DeviceManager.load(config['devices'])

    # start flask
    app.run(host=config['ip'], port=int(config['port']))


# Flask routines
@app.route('/', methods=['GET'])
def index():
    return __render('status', html=True, devices=DeviceManager.get())


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
    show_all = False
    if 'show_all' in request.args:
        show_all = True
    return __render('status', devices=DeviceManager.get(), show_all=show_all)


def __render(template, html=False, **kws):
    if html or request.args.get('format') == 'html':
        return render_template('layout.html', content='%s.html' % template, **kws)
    else:
        return render_template('%s.json' % template, **kws)


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
