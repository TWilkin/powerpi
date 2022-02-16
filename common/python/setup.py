from setuptools import setup, find_packages

setup(
    name='powerpi-common',
    version='0.1.0',
    description='PowerPi Common Python Library',
    author='TWilkin',
    classifiers=[
        'Programming Language :: Python :: 3.8',
    ],
    packages=find_packages(),
    install_requires=[
        'dependency-injector~=4.27.0',
        'gmqtt~=0.6.11',
        'jsonpatch~=1.32',
        'paho-mqtt~=1.5.1',
        'schedule~=1.0.0'
    ],
    python_requires='>=3.8'
)
