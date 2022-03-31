import logging

from powerpi_common.config import Config


class Logger:
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

        self.info(r"""
__________                         __________.__ 
\______   \______  _  __ __________\______   \__|
 |     ___/  _ \ \/ \/ // __ \_  __ \     ___/  |
 |    |  (  <_> )     /\  ___/|  | \/    |   |  |
 |____|   \____/ \/\_/  \___  >__|  |____|   |__|
                            \/                   
        """)

    def add_logger(self, name: str):
        logger = logging.getLogger(name)
        logger.addHandler(self.__handler)
        logger.setLevel(self.__logger.level)

    @classmethod
    def set_logger_level(cls, name: str, level: int):
        logger = logging.getLogger(name)
        logger.setLevel(level)

    def debug(self, *args):
        self.__logger.debug(*args)

    def info(self, *args):
        self.__logger.info(*args)

    def warn(self, *args):
        self.__logger.warning(*args)

    def warning(self, *args):
        self.__logger.warning(*args)

    def error(self, *args):
        self.__logger.error(*args)

    def exception(self, *args):
        self.__logger.exception(*args)


class LogMixin:
    '''
    Mixin to add methods for logging to a class.
    '''

    def log_debug(self, *args):
        self._logger.debug(*args)

    def log_info(self, *args):
        self._logger.info(*args)

    def log_warning(self, *args):
        self._logger.warning(*args)

    def log_error(self, *args):
        self._logger.error(*args)

    def log_exception(self, *args):
        self._logger.exception(*args)
