require('./db/mongoose');

const express = require('express');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get('', (req, res) => {
    res.send({
        availableRouters: {
            user: [
                {
                    location: '/users/:id/avatar',
                    method: 'GET',
                    authentication: true
                },
                {
                    location: '/users/me',
                    method: 'GET',
                    authentication: true
                },
                {
                    location: '/users/logoutAll',
                    method: 'POST',
                    authentication: true
                },
                {
                    location: '/users/logout',
                    method: 'POST',
                    authentication: true
                },
                {
                    location: '/users/login',
                    method: 'POST',
                    authentication: true
                },
                {
                    location: '/users',
                    method: 'POST',
                    authentication: true
                },
                {
                    location: '/users/me/avatar',
                    method: 'POST',
                    authentication: true
                },
                {
                    location: '/users/me',
                    method: 'PATCH',
                    authentication: true
                },
                {
                    location: '/users/me/avatar',
                    method: 'DELETE',
                    authentication: true
                },
                {
                    location: '/users/me',
                    method: 'DELETE',
                    authentication: true
                }
            ],
            task: [
                {
                    location: '/tasks',
                    method: 'GET',
                    authentication: true
                },
                {
                    location: '/tasks/:id',
                    method: 'GET',
                    authentication: true
                },
                {
                    location: '/tasks',
                    method: 'POST',
                    authentication: true
                },
                {
                    location: '/tasks/:id',
                    method: 'PATCH',
                    authentication: true
                },
                {
                    location: '/tasks/:id',
                    method: 'DELETE',
                    authentication: true
                }
            ]
        }
    });
});

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});
