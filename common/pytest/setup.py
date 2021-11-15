from setuptools import setup, find_packages

setup(
    name='powerpi-common-test',
    version='0.0.2',
    description='PowerPi Common Python Test Library',
    author='TWilkin',
    classifiers=[
        'Programming Language :: Python :: 3.6',
    ],
    packages=find_packages(),
    install_requires=[
        'pytest~=6.2.2',
        'pytest-mock~=3.5.1'
    ],
    python_requires='>=3.6'
)
