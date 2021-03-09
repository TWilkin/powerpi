from setuptools import setup, find_packages

setup(
    name='powerpi-common',
    version='0.0.1',
    description='PowerPi Common Python Library',
    author='TWilkin',
    classifiers=[
        'Programming Language :: Python :: 3.6',
    ],
    packages=find_packages(),
    install_requires=[
        'dependency-injector~=4.27.0',
        'paho-mqtt~=1.5.1'
    ],
    python_requires='>=3.6'
)
