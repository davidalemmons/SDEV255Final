const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config(); // Load .env for credentials

// Create a database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                // Query the database for the user by email
                const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

                if (rows.length === 0) {
                    return done(null, false, { message: 'User not found' });
                }

                const user = rows[0];

                // Compare hashed passwords
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    return done(null, user); // Login successful
                } else {
                    return done(null, false, { message: 'Incorrect password' });
                }
            } catch (err) {
                console.error('Error during authentication:', err);
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id); // Serialize the user by ID
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
            if (rows.length > 0) {
                done(null, rows[0]); // User found
            } else {
                done(null, false); // User not found
            }
        } catch (err) {
            console.error('Error deserializing user:', err);
            done(err);
        }
    });
};
