from flask import Flask

app = Flask(__name__)

@app.route("/")
def root():
    return "Lesson 2 live coding!"

if __name__ == '__main__':
    app.debug = True
    app.run(port = 5000)

