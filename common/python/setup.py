from setuptools import setup, find_packages

setup(
    name='powerpi-common',
    version='0.1.0',
    description='PowerPi Common Python Library',
    author='TWilkin',
    license='GPLv3',
    url='https://github.com/TWilkin/powerpi/common/python',
    classifiers=[
        'Programming Language :: Python :: 3.8',
    ],
    packages=find_packages(),
    install_requires=[
        'apscheduler~=3.8.1',
        'dependency-injector~=4.27.0',
        'gmqtt~=0.6.11',
        'jsonpatch~=1.32'
    ],
    python_requires='>=3.8'
)
