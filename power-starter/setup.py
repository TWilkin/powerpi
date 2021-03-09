import os
from setuptools import setup, find_packages


def get_package_name(package):
    '''
    Find the package name in a git+https repo URL.
    '''
    search_str = '#egg'
    try:
        index = package.index(search_str) + len(search_str) + 1
        return package[index:]
    except:
        return package


here = lambda *a: os.path.join(os.path.dirname(__file__), *a)

# read the requirements.txt
with open(here('requirements.txt'), 'r') as requirements_file:
    requirements = [get_package_name(x.strip())
                    for x in requirements_file.readlines()]

setup(
    name='power_starter',
    version='0.7.0',
    description='PowerPi Power Starter Home Automation service',
    author='Tom Wilkin',
    classifiers=[
        'Programming Language :: Python :: 3.6',
    ],
    packages=find_packages(),
    python_requires='>=3.6',
    install_requires=requirements,
    extras_require={
        'test': [
            'nose'
        ]
    }
)
