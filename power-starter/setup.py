from pip._internal.req import parse_requirements
from setuptools import setup, find_packages

# read the requirements.txt
requirements = [str(r.req) for r in parse_requirements('requirements.txt', session='hack')]

setup(
    name='power_starter',
    version='0.4.0',
    description='PowerPi Power Starter Home Automation service',
    author='Tom Wilkin',
    author_email='tom@twilkin.uk',
    classifiers=[
        'Programming Language :: Python :: 3.6',
    ],
    packages=find_packages(),
    package_data={
        'power_starter': [
            'pyenergenie/energenie/drv/radio_rpi.so',
            'power-starter.json'
        ]
    },
    python_requires='>=3.6',
    install_requires=requirements,
    extras_require={
        'test': [
            'nose'
        ]
    }
)
