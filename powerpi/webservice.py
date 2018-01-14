from flask import Flask
from jinja2 import Environment, PackageLoader, select_autoescape


# initialise globals
app = Flask(__name__)
env = Environment(
    loader=PackageLoader('powerpi', 'templates'),
    autoescape=select_autoescape(['html'])
)


def main(args=None):
    # start flask
    app.run(host='0.0.0.0')


@app.route('/', methods=['GET'])
def index():
    content = 'index.html'
    return __render(content, something='This text!')


def __render(content, **kws):
    layout = env.get_template('layout.html')
    return layout.render(content=content, **kws)


if __name__ == '__main__':
    main()
