const express = require('express');
const sharp = require('sharp');

const User = require('../models/user');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account');

const router = new express.Router();

router.get('/users/:id/avatar', async (req, res) => {
    const {user, params: {id}} = req;

    try {
        const user = await User.findById(id);

        if (!user) {
            throw new Error();
        }

        const {avatar} = user;

        res.set('Content-Type', 'image/png');
        res.send(avatar);
    } catch (error) {
        res.status(404).send();
    }
});

router.get('/users/me', auth, async (req, res) => {
    const {user} = req;
    res.send(user);
});

router.post('/users/logoutAll', auth, async (req, res) => {
    const {user} = req;

    try {
        user.tokens = [];
        await user.save();

        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    const {user, token: curToken} = req;

    try {
        user.tokens = user.tokens.filter(({token}) => token !== curToken);
        await user.save();

        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/users/login', async (req, res) => {
    const {body: {email, password}} = req;

    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/users', async (req, res) => {
    const {body} = req;
    const user = new User(body);
    const {email, name} = user;

    try {
        await user.save();
        sendWelcomeEmail(email, name);
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const {user, file: {buffer}} = req;
    const size = 250;

    try {
        const newBuffer = await sharp(buffer).resize({width: size, height: size}).png().toBuffer();
        user.avatar = newBuffer;
        await user.save();
        res.send();
    } catch (error) {
        res.status(400).send(error);
    }
}, ({message}, req, res, next) => {
    res.status(400).send({message});
});

router.patch('/users/me', auth, async (req, res) => {
    const {user, body} = req;

    const updates = Object.keys(body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try {
        updates.forEach(update => user[update] = body[update]);
        await user.save();

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    const {user} = req;
    user.avatar = undefined;

    try {
        await user.save();

        res.send();
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    const {user} = req;
    const {name, email} = user;

    try {
        await user.remove();
        sendCancellationEmail(email, name);

        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
