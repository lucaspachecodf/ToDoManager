const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const taskDAO = require('./taskDAO');
const SEGREDO = 'euvoupracasa';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function cobrarTokenJWT(req, resp, next) {
    console.log(req.url)
    if (req.url == '/login') {
        next();
    }
    var token = req.headers['x-access-token'];
    try {
        var decodificado = jwt.verify(token, SEGREDO);
        next();
    } catch (e) {
        resp.status(500).send({ message: 'Token inválido' })
    }
}
app.use(cobrarTokenJWT);

app.get('/', (req, resp) => {
    resp.send('resposta');
});

app.post('/tasks', (request, response) => {    
    const body = request.body;
    const task = {
        id: uuid(),
        title: body.title,
        description: body.description,
        isDone: body.isDone,
        isPriority: body.isPriority
    };

    taskDAO.insert(task, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.send(data);
        }
    });
});

app.get('/tasks', (request, response) => {
    taskDAO.listAll((err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.send(data);
        }
    });
});

app.get('/tasks/:taskId', (request, response) => {
    taskDAO.findTaskById(request.params.taskId, (err, task) => {
        if (task) {
            response.status(200);
            response.send(task);
        } else if (err) {
            response.status(500);
            response.send(err);
        } else {
            response.status(404);
            response.send();
        }
    });
});

app.put('/tasks/:taskId', (request, response) => {
    const body = request.body;
    const task = {
        id: request.params.taskId,
        title: body.title,
        description: body.description,
        isDone: body.isDone,
        isPriority: body.isPriority
    };
    taskDAO.insert(task, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.send(task);
        }
    });
});

app.delete('/tasks/:taskId', (request, response) => {
    taskDAO.remove(request.params.taskId, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).send(data);
        }
    });
});

app.post('/login', (req, resp) => {
    var body = req.body;
    if (body.username == 'usuario' && body.password == 'teste123') {
        var token = jwt.sign({ username: 'usuario', role: 'admin' }, SEGREDO, {
            expiresIn: '1h'
        });
        resp.send({ auth: true, token });
    } else {
        resp.status(403).send({ auth: false, message: 'usuario invalido' });
    }
})

taskDAO.init((err, data) => {
    if (err) {
        console.log('Servidor não iniciado por erro', err);
    } else {
        app.listen(3000, () => {
            console.log('Servidor iniciado');
        });
    }
});