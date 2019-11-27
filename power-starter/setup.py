from pip._internal.req import parse_requirements
from setuptools import setup

# read the requirements.txt
requirements = [str(r.req) for r in parse_requirements('requirements.txt', session='hack')]

setup(
    name='power_starter',
    version='0.1.0',
    description='PowerPi Power Starter Home Automation service',
    author='Tom Wilkin',
    author_email='tom@xzi-xzone.com',
    classifiers=[
        'Programming Language :: Python :: 3.8',
    ],
    packages=['power_starter'],
    package_dir={
        'power_starter': 'src/'
    },
    install_requires=requirements,
    extras_require={
        'test': [
            'nose'
        ]
    },
    entry_points={
        'console_scripts': [
            'power_starter=power_starter.main:main'
        ]
    }
)
