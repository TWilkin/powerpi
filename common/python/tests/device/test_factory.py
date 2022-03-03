from pytest_mock import MockerFixture

from powerpi_common.device import DeviceFactory, DeviceType


class TestFactory(object):
    def get_subject(self, mocker: MockerFixture):
        self.logger = mocker.Mock()
        self.service_provider = mocker.Mock()
        
        return DeviceFactory(self.logger, self.service_provider)

    def test_build(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        self.args = None
        def build(**kwargs):
            self.args = kwargs
            return True
        self.service_provider.test_device = build

        result = subject.build(DeviceType.DEVICE, 'test', a=1, b=2)
        assert result is not None
        assert self.args == { 'a': 1, 'b': 2}
    
    def test_build_no_factory(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        self.service_provider.test_device = None

        result = subject.build(DeviceType.DEVICE, 'test')
        assert result is None
