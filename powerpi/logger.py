import logging
import logging.handlers
import os


class Logger(object):

    __logger = logging.getLogger('PowerPi')

    @classmethod
    def initialise(cls, log_path, log_level):
        log_file = os.path.join(log_path, 'powerpi.log')
        handler = logging.handlers.RotatingFileHandler(log_file, maxBytes=1024*1024, backupCount=5)

        formatter = logging.Formatter('%(asctime)s:%(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        handler.setFormatter(formatter)

        cls.__logger.setLevel(logging.getLevelName(log_level))
        cls.__logger.addHandler(handler)

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
