from setuptools import setup, find_packages


setup(
    name='powerpi-common-test',
    version='0.1.2',
    description='PowerPi Common Python Test Library',
    author='TWilkin',
    classifiers=[
        'Programming Language :: Python :: 3.8',
    ],
    packages=find_packages(),
    install_requires=[
        'pytest~=6.2.2',
        'pytest-asyncio~=0.16.0',
        'pytest-cov~=3.0.0',
        'pytest-mock~=3.5.1'
    ],
    python_requires='>=3.8'
)
