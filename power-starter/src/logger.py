import logging
import logging.handlers
import os
import sys


class Logger(object):

    __logger = logging.getLogger('PowerStarter')
    __handler = None

    @classmethod
    def initialise(cls, log_path='/dev/stdout', log_level='INFO'):
        if log_path == '/dev/stdout':
            # write to stdout
            cls.__handler = logging.StreamHandler(stream=sys.stdout)
            formatter = logging.Formatter('%(levelname)s:%(name)s: %(message)s')
        else:
            # write to a file
            log_file = os.path.join(log_path, 'power_starter.log')
            cls.__handler = logging.handlers.RotatingFileHandler(log_file, maxBytes=1024*1024, backupCount=5)
            formatter = logging.Formatter('%(asctime)s:%(levelname)s:%(name)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        
        cls.__handler.setFormatter(formatter)

        cls.__logger.setLevel(logging.getLevelName(log_level))
        cls.__logger.addHandler(cls.__handler)

    @classmethod
    def info(cls, msg, *args, **kwargs):
        cls.__logger.info(msg, *args, **kwargs)

    @classmethod
    def warning(cls, msg, *args, **kwargs):
        cls.__logger.warning(msg, *args, **kwargs)

    @classmethod
    def error(cls, msg, *args, **kwargs):
        cls.__logger.error(msg, *args, **kwargs)

    @classmethod
    def critical(cls, msg, *args, **kwargs):
        cls.__logger.critical(msg, *args, **kwargs)

    @classmethod
    def exception(cls, msg, *args, **kwargs):
        cls.__logger.exception(msg, *args, **kwargs)

    @classmethod
    def add_logger(cls, name):
        logger = logging.getLogger(name)
        logger.addHandler(cls.__handler)
        logger.setLevel(cls.__logger.level)
