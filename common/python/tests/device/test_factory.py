from pytest_mock import MockerFixture

from powerpi_common.device import DeviceFactory, DeviceType


class TestFactory(object):
    def get_subject(self, mocker: MockerFixture):
        self.logger = mocker.Mock()
        self.service_provider = mocker.Mock()
        
        return DeviceFactory(self.logger, self.service_provider)

    def test_build(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        self.service_provider.test_device = lambda **kwargs: kwargs

        result = subject.build(DeviceType.DEVICE, 'test', a=1, b=2, c={'complex': 'thing'})
        assert result == { 'a': 1, 'b': 2, 'c': { 'complex': 'thing' } }
    
    def test_build_no_factory(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        self.service_provider.test_device = None

        result = subject.build(DeviceType.DEVICE, 'test')
        assert result is None
