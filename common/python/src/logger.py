import logging


class Logger(object):
    def __init__(self):
        handler = logging.StreamHandler()
        handler.setLevel(logging.INFO)
        handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S'
        ))

        self.__logger = logging.getLogger()
        self.__logger.setLevel(logging.INFO)
        self.__logger.addHandler(handler)

    def info(self, *args):
        self.__logger.info(*args)

    def warn(self, *args):
        self.__logger.warn(*args)

    def error(self, *args):
        self.__logger.error(*args)

    def exception(self, *args):
        self.__logger.exception(*args)
