docker stop python-flask-app
docker run -d --rm --name python-flask-app -v $PWD/app:/app -p 8081:80 python-flask-app

