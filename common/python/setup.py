from setuptools import setup, find_packages

setup(
    name='powerpi-common',
    version='0.0.1',
    description='PowerPi Common Python Library',
    author='TWilkin',
    classifiers=[
        'Programming Language :: Python :: 3.6',
    ],
    packages=['powerpi_common', 'powerpi_common.mqtt'],
    package_dir={
        'powerpi_common': 'powerpi_common/',
        'powerpi_common.mqtt': 'powerpi_common/mqtt/'
    },
    install_requires=[
        'dependency-injector~=4.27.0',
        'paho-mqtt~=1.5.1'
    ],
    python_requires='>=3.6'
)
