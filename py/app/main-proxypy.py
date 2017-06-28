from flask import Flask, request, Response
import sys

sys.path.append(".")
import proxypy

app = Flask(__name__)

@app.route("/cors")
def crossdom():
    reply = proxypy.get(request.query_string)
    resp = Response(reply,status=200,mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == "__main__":
    app.run(debug=True)
