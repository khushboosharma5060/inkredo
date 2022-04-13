
var { Strategy, ExtractJwt } = require('passport-jwt')
const passport = require('passport');
const {companyCollection} = require('./mongodb')

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
}

passport.use(new Strategy(opts, async function (payload, done) {
    const result = companyCollection().findOne({ email: payload.email });
    if (!result) {
        return done(null, false)
    } else {
        return done(null, payload)
    }
}));

module.exports = passport;


 


