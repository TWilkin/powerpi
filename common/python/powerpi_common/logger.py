import logging

from powerpi_common.config import Config


class Logger(object):
    def __init__(self, config: Config):
        log_level = logging.getLevelName(config.log_level)

        self.__handler = logging.StreamHandler()
        self.__handler.setLevel(log_level)
        self.__handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S'
        ))

        self.__logger = logging.getLogger()
        self.__logger.setLevel(log_level)
        self.__logger.addHandler(self.__handler)

    def add_logger(self, name):
        logger = logging.getLogger(name)
        logger.addHandler(self.__handler)
        logger.setLevel(self.__logger.level)

    def debug(self, *args):
        self.__logger.debug(*args)

    def info(self, *args):
        self.__logger.info(*args)

    def warn(self, *args):
        self.__logger.warn(*args)

    def error(self, *args):
        self.__logger.error(*args)

    def exception(self, *args):
        self.__logger.exception(*args)
