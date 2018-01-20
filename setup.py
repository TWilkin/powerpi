from pip.req import parse_requirements
from setuptools import setup, find_packages

# read the requirements.txt
requirements = [str(r.req) for r in parse_requirements('requirements.txt', session='hack')]

setup(
    name='powerpi',
    version='0.0.1',
    description='PowerPi Home Automation',
    long_description="""
        Thanks for the icons from https://deleket.deviantart.com/art/Gaming-Icons-Pack-42723812.
    """,
    author='Tom Wilkin',
    author_email='tom@xzi-xzone.com',
    classifiers=[
        'Programming Language :: Python :: 2.7',
    ],
    packages=find_packages(exclude=['tests']),
    install_requires=requirements,
    extras_require={
        'test': ['nose']
    },
    package_data={
        ''
        'powerpi': [
            'templates/*.html',
            'templates/*.json',
            'static/*.css',
            'static/devices/*.png'
        ]
    },
    entry_points={
        'console_scripts': [
            'powerpi=powerpi.webservice:main'
        ]
    }
)
