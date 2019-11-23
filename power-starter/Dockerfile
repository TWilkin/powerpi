FROM python:3.8.0-alpine3.10
LABEL maintainer="tom@xzi-xzone.com"

# install the dependencies
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install -r requirements.txt

# copy across the application code
COPY . .

# start the application once the container is ready
CMD python src/main.py
