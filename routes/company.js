const express = require("express");
const router = express.Router();
const { employeeCollection, companyCollection, historyCollection } = require('../mongodb')
const passport = require('../auth');
const { ObjectId } = require('mongodb');

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await companyCollection().insertOne(req.body);
    res.send("inserted")
});

router.get('/', async (req, res) => {
    const result = await companyCollection().find({}).toArray();
    res.send(result);
});

router.get('/:id', async (req, res) => {
    const companyId = req.params.id;
    const company = await companyCollection().findOne({_id: new ObjectId(companyId)});
    let currentEmployees = await employeeCollection().find({company: companyId}).toArray();
    currentEmployees = currentEmployees.map(emp => {
        const from = new Date(emp.updated);
        return {
            name: emp.name,
            from: `${from.getDate()}/${from.getMonth()}/${from.getFullYear()}`,
            to: 'Present'
        }
    })
    let oldEmployees = await historyCollection().find({company: companyId}).toArray();
    oldEmployees = await Promise.all(oldEmployees.map(async emp => {
        const from = new Date(emp.from);
        const to = new Date(emp.to);
        let employee = await employeeCollection().findOne({_id: new ObjectId(emp.employee)});
        return {
            name: employee.name,
            from: `${from.getDate()}/${from.getMonth()}/${from.getFullYear()}`,
            to: `${to.getDate()}/${to.getMonth()}/${to.getFullYear()}`,
        }
    }));
    res.send({company: company.name, currentEmployees, oldEmployees});
});

router.post('/:id/join', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userId = req.user.id
    const companyId = req.params.id
    const user = await employeeCollection().findOne({ _id: new ObjectId(userId)});
    if (user.company) {
        res.status(400).send('Please leave existing company before joining')
    } else {
        await employeeCollection().updateOne({ _id: new ObjectId(userId) }, { $set: { company: companyId } });
        res.send("joined") 
    }
});

router.post('/:id/leave', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userId = req.user.id;
    const companyId = req.params.id
    const user = await employeeCollection().findOne({ _id: new ObjectId(userId)});
    if(!user.company) {
        res.status(400).send('Please join a copany before leaving')
    } else if(user.company === companyId){
        const history = {
            employee: userId,
            company: companyId,
            from: user.updated,
            to: new Date(),
        }
        await historyCollection().insertOne(history);
        await employeeCollection().updateOne({ _id: new ObjectId(userId) }, { $set: { company: '', updated: new Date() } });
        res.send('Copany left');
    } else {
        res.send('Please enter correct company id');
    }
});

module.exports = router;