const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const fs = require('fs');

const readUsers = () => {
    const data = fs.readFileSync('./data/users.json');
    return JSON.parse(data);
};

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            const users = readUsers();
            const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect password' });
                }
            });
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        const users = readUsers();
        const user = users.find((u) => u.id === id);
        done(null, user);
    });
};
