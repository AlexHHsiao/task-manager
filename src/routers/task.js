const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

// limit && skip && completed
router.get('/tasks', auth, async (req, res) => {
    const {user, query} = req;
    const match = {};
    const options = {};
    const sort = {};

    if (query.hasOwnProperty('completed')) {
        match.completed = query.completed === 'true';
    }

    if (query.hasOwnProperty('limit') && !isNaN(query.limit)) {
        options.limit = parseInt(query.limit);
    }

    if (query.hasOwnProperty('skip') && !isNaN(query.skip)) {
        options.skip = parseInt(query.skip);
    }

    if (query.hasOwnProperty('sortBy')) {
        const {sortBy} = query;
        const [part, value] = sortBy.split(':');
        sort[part] = value === 'desc' ? -1 : 1;
    }

    try {
        await user.populate({
            path: 'tasks',
            match,
            options: {
                ...options,
                sort
            }
        }).execPopulate();
        res.send(user.tasks);
    } catch (error) {
        res.status(404).send(error);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const {params: {id}, user: {_id}} = req;

    try {
        const task = await Task.findOne({_id: id, owner: _id});
        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/tasks', auth, async (req, res) => {
    const {body, user: {_id}} = req;
    const task = new Task({
        ...body,
        owner: _id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const {params: {id}, user: {_id}, body} = req;

    const updates = Object.keys(body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try {
        const task = await Task.findOne({_id: id, owner: _id});

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach(update => task[update] = body[update]);
        await task.save();

        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const {params: {id}, user: {_id}} = req;

    try {
        const task = await Task.findOneAndDelete({_id: id, owner: _id});

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
