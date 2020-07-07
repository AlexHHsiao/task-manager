const request = require('supertest');

const app = require('../src/app');
const User = require('../src/models/user');
const {setupDatabase, userOne, userOneId} = require('./fixtures/db');


beforeEach(setupDatabase);

test('Should signup a new user ', async () => {
    const createdUser = {
        name: 'Alex',
        email: 'alex.hongquan.xiao@example.com',
        password: '1234567'
    };

    const {body} = await request(app).post('/users').send(createdUser).expect(201);
    const user = await User.findById(body.user._id);
    expect(user).not.toBeNull();

    expect(body).toMatchObject({
        user: {
            name: createdUser.name,
            email: createdUser.email
        },
        token: user.tokens[0].token
    });

    expect(user.password).not.toBe(createdUser.password);
});

test('Should login existing user ', async () => {
    const {email, password} = userOne;

    const {body} = await request(app).post('/users/login').send({
        email, password
    }).expect(200);

    const user = await User.findById(userOneId);
    expect(body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistent user ', async () => {
    await request(app).post('/users/login').send({
        email: 'xx@xx.com',
        password: '1231231'
    }).expect(400);
});

test('Should get profile for user', async () => {
    const {tokens: [{token}]} = userOne;

    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send().expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send().expect(401);
});

test('Should delete account for user', async () => {
    const {tokens: [{token}]} = userOne;

    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send().expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send().expect(401);
});

test('Should upload avatar image', async () => {
    const {tokens: [{token}]} = userOne;

    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', 'tests/fixtures/cat1.jpg')
        .expect(200);

    const {avatar} = await User.findById(userOneId);
    expect(avatar).toEqual(expect.any(Buffer));
});

test('Should update valid uer fields', async () => {
    const {tokens: [{token}]} = userOne;
    const userName = 'XXX';

    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({name: userName})
        .expect(200);

    const {name} = await User.findById(userOneId);
    expect(name).toEqual(userName);
});

test('Should not update invalid uer fields', async () => {
    const {tokens: [{token}]} = userOne;
    const userName = 'XXX';

    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({xx: userName})
        .expect(400);
});