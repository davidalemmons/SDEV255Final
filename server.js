const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./config/passportConfig')(passport);
const flash = require('connect-flash');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;
const mysql = require('mysql2/promise');
const db = mysql.createPool({
    host: 'sql5.freesqldatabase.com',
    user: 'sql5748042',
    password: '76vgfEDKY5',
    database: 'sql5748042',
});

db.query('SELECT 1')
    .then(() => console.log('Connected to MySQL'))
    .catch((err) => console.error('MySQL connection error:', err));

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session middleware
app.use(
    session({
        secret: 'yourSecretKey',
        resave: true,
        saveUninitialized: true,
    })
);

// Flash middleware
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add user and flash data to all templates
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Passport-specific errors
    next();
});

// Helper functions to read/write data files
const readUsers = () => {
    const data = fs.readFileSync('./data/users.json');
    return JSON.parse(data);
};

const saveUsers = (users) => {
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
};

const readTeachers = () => {
    try {
        const data = fs.readFileSync('./data/teachers.json', 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading teachers.json:', err);
        return [];
    }
};

// Middleware to ensure authentication and role
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

const ensureTeacher = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'teacher') {
        return next();
    }
    res.status(403).send('Access denied: Only teachers are allowed');
};

const ensureStudent = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'student') {
        return next();
    }
    res.status(403).send('Access denied: Only students are allowed');
};

// Temporary in-memory schedule data
const schedules = {};

// Route to display the schedule
app.get('/schedule', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id; // Get the logged-in user's ID from the session

    try {
        // Query to fetch only the logged-in user's schedule
        const [schedule] = await db.query(
            `SELECT courses.*
            FROM schedule
            JOIN courses ON schedule.courseId = courses.id
            WHERE schedule.userId = ?`,
            [userId]
        );

        res.render('schedule', { schedule, user: req.user });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        req.flash('error_msg', 'Failed to fetch your schedule');
        res.redirect('/');
    }
});

// Route to add a course to the schedule
app.post('/schedule/add', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id; // Logged-in user's ID
    const courseId = req.body.courseId; // ID of the course to be added

    try {
        // Verify the user exists
        const [userExists] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (userExists.length === 0) {
            throw new Error('User does not exist');
        }

        // Verify the course exists
        const [courseExists] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (courseExists.length === 0) {
            throw new Error('Course does not exist');
        }

        // Insert into schedule
        await db.query(
            'INSERT INTO schedule (userId, courseId) VALUES (?, ?)',
            [userId, courseId]
        );

        req.flash('success_msg', 'Course added to your schedule');
        res.redirect('/courses');
    } catch (error) {
        console.error('Error adding course to schedule:', error);
        req.flash('error_msg', 'Failed to add course to your schedule');
        res.redirect('/courses');
    }
});

// Route to remove a course from the schedule
app.post('/schedule/remove', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id; // Logged-in user's ID
    const courseId = req.body.courseId; // ID of the course to be removed

    try {
        await db.query(
            'DELETE FROM schedule WHERE userId = ? AND courseId = ?',
            [userId, courseId]
        );

        req.flash('success_msg', 'Course removed from your schedule');
        res.redirect('/schedule');
    } catch (error) {
        console.error('Error removing course from schedule:', error);
        req.flash('error_msg', 'Failed to remove course from your schedule');
        res.redirect('/schedule');
    }
});

// Routes for user registration
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { name, email, password, password2, role, teacherCode } = req.body;

    // Validation
    if (!name || !email || !password || !password2) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/register');
    }

    if (password !== password2) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/register');
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        if (existingUser.length > 0) {
            req.flash('error_msg', 'Email is already registered');
            return res.redirect('/register');
        }

        // If registering as a teacher, validate teacher code
        if (role === 'teacher') {
            const [teacher] = await db.query('SELECT * FROM teachers WHERE email = ?', [email.toLowerCase()]);
            if (!teacher.length || teacher[0].code !== teacherCode) {
                req.flash('error_msg', 'Invalid teacher code');
                return res.redirect('/register');
            }
        }

        // Hash password and save user
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email.toLowerCase(), hashedPassword, role.toLowerCase()]
        );

        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error);
        req.flash('error_msg', 'Something went wrong during registration');
        res.redirect('/register');
    }
});

// Routes for user login
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            console.error('Error during authentication:', err);
            req.flash('error_msg', 'An error occurred during authentication');
            return res.redirect('/login');
        }
        if (!user) {
            req.flash('error_msg', info.message || 'Invalid email or password');
            return res.redirect('/login');
        }

        req.logIn(user, async (err) => {
            if (err) {
                console.error('Error during login:', err);
                req.flash('error_msg', 'Failed to log in');
                return res.redirect('/login');
            }

            req.flash('success_msg', 'Login successful');
            res.redirect('/courses');
        });
    })(req, res, next);
});

// Logout Route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the views directory and use EJS as the template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load courses data from JSON file
const courses = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'courses.json'), 'utf-8'));

// Route for the home page
app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle search queries
app.get('/courses/search', ensureAuthenticated, (req, res) => {
    const query = req.query.query?.toLowerCase() || '';
    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.subject.toLowerCase().includes(query)
    );
    res.render('courses', { courses: filteredCourses, currentPage: 1, totalPages: 1 });
});

// Routes to handle subject selection
app.get('/courses/sub-select', ensureAuthenticated, (req, res) => {
    const sub = req.query.sub.toLowerCase();
    const filteredCourses = courses.filter(course =>
        course.subject.toLowerCase().includes(sub)
    );
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
    res.render('courses', {
        courses: paginatedCourses,
        currentPage: page,
        totalPages: Math.ceil(filteredCourses.length / limit)
    });
});

// Route to display paginated courses
app.get('/courses', ensureAuthenticated, async (req, res) => {
    try {
        const limit = 10; // Number of courses per page
        const page = parseInt(req.query.page) || 1; // Current page, default to 1
        const offset = (page - 1) * limit; // Calculate offset

        // Query to fetch total count of courses
        const [totalRows] = await db.query('SELECT COUNT(*) as total FROM courses');
        const totalCourses = totalRows[0].total;
        const totalPages = Math.ceil(totalCourses / limit);

        // Query to fetch paginated courses
        const [courses] = await db.query('SELECT * FROM courses LIMIT ? OFFSET ?', [limit, offset]);

        // Render the courses page with pagination data
        res.render('courses', { courses, currentPage: page, totalPages, user: req.user });
    } catch (error) {
        console.error('Error fetching courses:', error);
        req.flash('error_msg', 'Failed to fetch courses');
        res.redirect('/');
    }
});

// Display the Add Course form (only for teachers)
app.get('/courses/new', ensureAuthenticated, ensureTeacher, (req, res) => {
    res.render('newCourse', { user: req.user });
});

// Handle the Add Course form submission
app.post('/courses', ensureAuthenticated, ensureTeacher, async (req, res) => {
    const { name, description, subject, credits } = req.body;

    try {
        // Insert new course into the database
        await db.query('INSERT INTO courses (name, description, subject, credits) VALUES (?, ?, ?, ?)', [
            name,
            description,
            subject,
            parseInt(credits, 10),
        ]);

        req.flash('success_msg', 'Course added successfully');
        res.redirect('/courses');
    } catch (error) {
        console.error('Error adding course:', error);
        req.flash('error_msg', 'Failed to add course');
        res.redirect('/courses/new');
    }
});

// Route to handle form submission and add a new course
app.post('/courses', ensureTeacher, (req, res) => {
    const newCourse = {
        id: courses.length + 1, // Generate a new ID
        name: req.body.name,
        description: req.body.description,
        subject: req.body.subject,
        credits: parseInt(req.body.credits),
    };
    courses.push(newCourse);

    // Update the courses.json file
    fs.writeFileSync(path.join(__dirname, 'data', 'courses.json'), JSON.stringify(courses, null, 2));

    req.flash('success_msg', 'Course added successfully');
    res.redirect('/courses');
});

// Route to display individual course details
app.get('/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    try {
        const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (course.length === 0) {
            return res.status(404).send('Course cannot be found');
        }
        res.render('courseDetails', { course: course[0] });
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).send('Error fetching course details');
    }
});

// Display the Edit Course form (only for teachers)
app.get('/courses/:id/edit', ensureAuthenticated, ensureTeacher, async (req, res) => {
    const courseId = req.params.id;

    try {
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);

        if (rows.length === 0) {
            req.flash('error_msg', 'Course not found');
            return res.redirect('/courses');
        }

        res.render('editCourse', { course: rows[0], user: req.user });
    } catch (error) {
        console.error('Error fetching course:', error);
        req.flash('error_msg', 'Failed to fetch course');
        res.redirect('/courses');
    }
});

// Handle the Edit Course form submission
app.post('/courses/:id', ensureAuthenticated, ensureTeacher, async (req, res) => {
    const courseId = req.params.id;
    const { name, description, subject, credits } = req.body;

    try {
        // Update course in the database
        await db.query(
            'UPDATE courses SET name = ?, description = ?, subject = ?, credits = ? WHERE id = ?',
            [name, description, subject, parseInt(credits, 10), courseId]
        );

        req.flash('success_msg', 'Course updated successfully');
        res.redirect('/courses');
    } catch (error) {
        console.error('Error updating course:', error);
        req.flash('error_msg', 'Failed to update course');
        res.redirect(`/courses/${courseId}/edit`);
    }
});

// Route to add a course to the student's schedule
app.post('/courses/:id/schedule', ensureAuthenticated, (req, res) => {
    if (req.user.role !== 'student') {
        req.flash('error_msg', 'Only students can add courses to their schedule.');
        return res.redirect('/courses');
    }

    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        req.flash('error_msg', 'Course not found.');
        return res.redirect('/courses');
    }

    const user = readUsers().find(u => u.email === req.user.email);

    if (user.schedule && user.schedule.some(scheduledCourse => scheduledCourse.id === course.id)) {
        req.flash('error_msg', 'Course is already in your schedule.');
    } else {
        user.schedule = user.schedule || [];
        user.schedule.push(course);

        // Save updated user data
        const users = readUsers().map(u => (u.email === user.email ? user : u));
        saveUsers(users);

        req.flash('success_msg', 'Course added to your schedule.');
    }

    res.redirect('/courses');
});

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg') || [];
    res.locals.error_msg = req.flash('error_msg') || [];
    res.locals.error = req.flash('error') || [];
    next();
});

// Handle course deletion (only for teachers)
app.post('/courses/:id/delete', ensureAuthenticated, ensureTeacher, async (req, res) => {
    const courseId = req.params.id;

    try {
        await db.query('DELETE FROM courses WHERE id = ?', [courseId]);

        req.flash('success_msg', 'Course deleted successfully');
        res.redirect('/courses');
    } catch (error) {
        console.error('Error deleting course:', error);
        req.flash('error_msg', 'Failed to delete course');
        res.redirect('/courses');
    }
});

// Route to render profile page
app.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const [schedule] = await db.query(
            `SELECT c.id, c.name, c.subject
                FROM schedule s
                JOIN courses c ON s.courseId = c.id
                WHERE s.userId = ?`,
            [req.user.id]
        );

        res.render('profile', { user: req.user, schedule });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        req.flash('error_msg', 'Failed to load profile');
        res.redirect('/');
    }
});

// Route to update email
app.post('/profile/update-email', ensureAuthenticated, (req, res) => {
    const { newEmail } = req.body;
    
    // Validate email
    if (!newEmail || !newEmail.includes('@')) {
        req.flash('error_msg', 'Please enter a valid email.');
        return res.redirect('/profile');
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === req.user.email);

    if (userIndex !== -1) {
        users[userIndex].email = newEmail.toLowerCase();
        saveUsers(users);

        req.flash('success_msg', 'Email updated successfully.');
        res.redirect('/profile');
    } else {
        req.flash('error_msg', 'User not found.');
        res.redirect('/profile');
    }
});

// Route to update password
app.post('/profile/update-password', ensureAuthenticated, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = readUsers().find(u => u.email === req.user.email);

    if (!user) {
        req.flash('error_msg', 'User not found.');
        return res.redirect('/profile');
    }

    // Check current password
    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
        if (err || !isMatch) {
            req.flash('error_msg', 'Current password is incorrect.');
            return res.redirect('/profile');
        }

        // Hash and save new password
        bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) throw err;
            user.password = hash;

            const users = readUsers().map(u => (u.email === user.email ? user : u));
            saveUsers(users);

            req.flash('success_msg', 'Password updated successfully.');
            res.redirect('/profile');
        });
    });
});

// Fallback route for unhandled requests
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});