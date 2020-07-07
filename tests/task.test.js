const request = require('supertest');

const app = require('../src/app');
const Task = require('../src/models/task');
const {setupDatabase, userOne, userOneId, userTwo, userTwoId, taskOne, taskTwo, taskThree} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const {tokens: [{token}]} = userOne;

    const {body: {_id}} = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
            description: 'Sleep'
        })
        .expect(201);

    const task = await Task.findById(_id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test('Should fetch user tasks', async () => {
    const {tokens: [{token}]} = userOne;

    const {body} = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(200);

    expect(body.length).toEqual(2);
});

test('Should not delete other users tasks', async () => {
    const {tokens: [{token}]} = userTwo;

    const {body} = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(404);

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});