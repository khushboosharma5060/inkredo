const express = require("express");
const router = express.Router();
const { employeeCollection, historyCollection, companyCollection } = require('../mongodb')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('../auth');
const { ObjectId } = require("mongodb");

router.post('/sign-up', async (req, res) => {
    req.body.created = new Date();
    req.body.updated = new Date();
    const hashedPassword = crypto.createHash('sha256').update(req.body.password).digest('hex');
    await employeeCollection().insertOne({ ...req.body, password: hashedPassword });
    res.status(200).send();
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const result = await employeeCollection().findOne({ email });
    if (!result) {
        res.status(401).send('Unautherized')
    } else if (result && result.password === hashedPassword) {
        const token = jwt.sign({ email, id: result._id }, 'secret', { expiresIn: 86400 });
        res.send(token)
    }
});

router.get('/employment-history', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userId = req.user.id
    const user = await employeeCollection().findOne({ _id: new ObjectId(userId) });
    const currentCompany = user.company && await companyCollection().findOne({ _id: new ObjectId(user.company) });
    const currentCopanyFrom = new Date(user.updated);

    const history = await historyCollection().find({ employee: userId }).toArray();
    let mappedHistory = await Promise.all(history.map(async h => {
        const company = await companyCollection().findOne({ _id: new ObjectId(h.company) });
        const from = new Date(h.from);
        const to = new Date(h.to);
        return {
            company: company.name,
            from: `${from.getDate()}/${from.getMonth()}/${from.getFullYear()}`,
            to: `${to.getDate()}/${to.getMonth()}/${to.getFullYear()}`,
        }
    }));
    res.send([...(currentCompany ?
        [{ company: currentCompany.name, from: `${currentCopanyFrom.getDate()}/${currentCopanyFrom.getMonth()}/${currentCopanyFrom.getFullYear()}`, to: 'Present' }] :
        []
    ),
    ...mappedHistory
    ])
});

module.exports = router;