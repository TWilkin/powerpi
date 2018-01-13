from pip.req import parse_requirements
from setuptools import setup, find_packages

# read the requirements.txt
requirements = [str(r.req) for r in parse_requirements('requirements.txt', session='hack')]

setup(
    name='powerpi',
    version='0.0.1',
    description='PowerPi Home Automation',
    author='Tom Wilkin',
    author_email='tom@xzi-xzone.com',
    classifiers=[
        'Programming Language :: Python :: 3.6',
    ],
    packages=find_packages(exclude=['tests']),
    install_requires=requirements,
    extras_require={
        'test': ['nose']
    },
    package_data={
        'templates': ['templates/']
    }
)
