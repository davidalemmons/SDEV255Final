const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// MySQL connection
const dbConfig = {
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Look2the1!', // Replace with your MySQL password
    database: 'sdev255final' // Replace with your database name
};

(async () => {
    let connection;

    try {
        // Establish connection
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to the database.');

        // Read and parse teachers.json
        const teachersData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data', 'teachers.json'), 'utf-8')
        );
        for (const teacher of teachersData) {
            await connection.execute(
                'INSERT INTO teachers (email, code) VALUES (?, ?)',
                [teacher.email, teacher.code]
            );
        }
        console.log('Teachers data inserted successfully.');

        // Read and parse users.json
        const usersData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf-8')
        );
        for (const user of usersData) {
            await connection.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [user.name, user.email, user.password, user.role]
            );
        }
        console.log('Users data inserted successfully.');

        // Read and parse courses.json
        const coursesData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data', 'courses.json'), 'utf-8')
        );
        for (const course of coursesData) {
            await connection.execute(
                'INSERT INTO courses (name, description, subject, credits) VALUES (?, ?, ?, ?)',
                [course.name, course.description, course.subject, course.credits]
            );
        }
        console.log('Courses data inserted successfully.');
    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
})();
