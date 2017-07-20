#!flask/bin/python

"""Alternative version of the ToDo RESTful server implemented using the
Flask-RESTful extension."""

from flask import Flask, abort, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, fields, marshal

app = Flask(__name__, static_url_path="")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///list.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

api = Api(app)

task_fields = {
    'id': fields.Integer,
    'list_id': fields.Integer,
    'content': fields.String,
    'done': fields.Boolean,
    'sort_order': fields.Integer
}

list_fields = {
    'id': fields.Integer,
    'title': fields.String,
}

class List(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text)
    tasks = db.relationship('Task', backref='list')

    def __init__(self, title):
        self.title = title

    def as_dict(self):
        return {'id': self.id,
                'title': self.title}

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text)
    done = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)
    list_id = db.Column(db.Integer, db.ForeignKey('list.id'))

    def __init__(self, content, list_id):
        self.content = content
        self.list_id = list_id
        self.done = False
        self.order = 0

    def __repr__(self):
        return '<Content %s>' % self.content

    def as_dict(self):
        return {'id': self.id,
                'content': self.content,
                'done': self.done,
                'sort_order': self.sort_order,
                'list_id': self.list_id}

db.create_all()

class ListsAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('title', type=str, required=True,
            help='No List title provided', location='json')
        super(ListsAPI, self).__init__()

    def get(self):
        lists = List.query.all()
        return {'lists': [marshal(l.as_dict(), list_fields) for l in lists]}

    def post(self):
        args = self.reqparse.parse_args()

        l = List(args['title'])
        db.session.add(l)
        db.session.commit()
        return {'list': marshal(l.as_dict(), list_fields)}, 201

class ListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('title', type=str, location='json')
        super(ListAPI, self).__init__()

    def get(self, id):
        l = List.query.get(id)
        if l == None:
            abort(404)
        return {'list': marshal(l.as_dict(), list_fields)}

    def put(self, id):
        l = List.query.get(id)
        if l == None:
            abort(404)
        args = self.reqparse.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(l, k, v)
        db.session.commit()
        return {'list': marshal(l.as_dict(), list_fields)}

    def delete(self, id):
        l = List.query.get(id)
        if l == None:
            abort(404)

        # Delete tasks for the list
        Task.query.filter_by(list_id=id).delete()
        db.session.delete(l)
        db.session.commit()
        return {'result': True}


class TasksAPI(Resource):
    # decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('content', type=str, required=True,
                                   help='No task content provided',
                                   location='json')
        super(TasksAPI, self).__init__()

    def get(self, list_id):
        tasks = Task.query.filter_by(list_id=list_id).all()
        l = List.query.get(list_id)

        return { 'list': marshal(l.as_dict(), list_fields),
                 'tasks': [marshal(task.as_dict(), task_fields) for task in tasks]}

    def post(self, list_id):
        args = self.reqparse.parse_args()

        task = Task(args['content'], list_id)
        db.session.add(task)
        db.session.commit()

        return {'task': marshal(task.as_dict(), task_fields)}, 201


class TaskAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('content', type=str, location='json')
        self.reqparse.add_argument('done', type=bool, location='json')
        self.reqparse.add_argument('sort_order', type=int, location='json')

        super(TaskAPI, self).__init__()

    def get(self, id):
        task = Task.query.get(id)
        if task == None:
            abort(404)
        return {'task': marshal(task.as_dict(), task_fields)}

    def put(self, id):
        task = Task.query.get(id)
        if task == None:
            abort(404)
        args = self.reqparse.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(task, k, v)
        db.session.commit()
        return {'task': marshal(task.as_dict(), task_fields)}

    def delete(self, id):
        task = Task.query.get(id)
        if task == None:
            abort(404)
        db.session.delete(task)
        db.session.commit()
        return {'result': True}


api.add_resource(ListsAPI, '/lists', endpoint='lists')
api.add_resource(ListAPI, '/list/<int:id>', endpoint='list')
api.add_resource(TasksAPI, '/list/<int:list_id>/tasks', endpoint='tasks')
api.add_resource(TaskAPI, '/tasks/<int:id>', endpoint='task')

@app.route("/s/<path:filename>")
def static_files(filename):
    return send_from_directory("../www/", filename)

@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
    response.headers['Access-Control-Allow-Methods'] = 'GET, PUT, POST, DELETE, HEAD'
    return response

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)
