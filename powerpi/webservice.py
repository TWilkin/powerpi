from argparse import ArgumentParser
from flask import Flask, request, render_template
from powerpi.devices import DeviceManager
from powerpi.logger import Logger

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

    # initialise logging
    if 'log_path' not in config:
        config['log_path'] = ''
    if 'log_level' not in config:
        config['log_level'] = 'DEBUG'
    Logger.initialise(config['log_path'], config['log_level'])

    # log out configuration
    Logger.info('Starting PowerPi on http://%s:%s' % (config['ip'], config['port']))
    Logger.info('Testing %s' % test)

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
        return __create_error_message(ex)


@app.route('/off', methods=['GET'])
def off():
    global test
    try:
        device = __get_device()
        if not test:
            device.turn_off()
        return status()
    except Exception as ex:
        return __create_error_message(ex)


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


def __create_error_message(ex):
    try:
        message = ex.args[0]
    except IndexError:
        message = ex

    return __render('error', message=message)


if __name__ == '__main__':
    main()
