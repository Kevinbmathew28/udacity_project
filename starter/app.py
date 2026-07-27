from flask import Flask

from routes import bp, set_current_store

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None
}

set_current_store(CURRENT)
app.register_blueprint(bp)


if __name__ == '__main__':
    app.run(debug=True)