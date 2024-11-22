const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the views directory and use EJS as the template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load courses data from JSON file
const courses = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'courses.json'), 'utf-8'));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route to handle search queries
app.get('/courses/search', (req, res) => {
    console.log('Search route hit with query:', req.query.query); // Debugging log
    const query = req.query.query?.toLowerCase() || '';
    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.subject.toLowerCase().includes(query)
    );
    res.render('courses', { courses: filteredCourses, currentPage: 1, totalPages: 1 });
});

// Route to display paginated courses
app.get('/courses', (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page (default to 1)
    const limit = 12; // Number of courses per page
    const startIndex = (page - 1) * limit; // Start index
    const endIndex = page * limit; // End index

    const paginatedCourses = courses.slice(startIndex, endIndex); // Slice the courses for the current page

    res.render('courses', {
        courses: paginatedCourses,
        currentPage: page,
        totalPages: Math.ceil(courses.length / limit) // Calculate total pages
    });
});

// Route to render the form to add a new course
app.get('/courses/new', (req, res) => {
    res.render('newCourse');
});

// Route to handle form submission and add a new course
app.post('/courses', (req, res) => {
    const newCourse = {
        id: courses.length + 1, // Generate a new ID
        name: req.body.name,
        description: req.body.description,
        subject: req.body.subject,
        credits: parseInt(req.body.credits)
    };
    courses.push(newCourse);

    // Update the courses.json file
    fs.writeFileSync(path.join(__dirname, 'data', 'courses.json'), JSON.stringify(courses, null, 2));

    res.redirect('/courses');
});

// Route to display individual course details
app.get('/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).send('Course not found');
    }
    res.render('courseDetails', { course });
});

// Route to render the form to edit an existing course
app.get('/courses/:id/edit', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).send('Course not found');
    }
    res.render('editCourse', { course });
});

// Route to handle form submission and update the course
app.post('/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).send('Course not found');
    }

    // Update course details
    course.name = req.body.name;
    course.description = req.body.description;
    course.subject = req.body.subject;
    course.credits = parseInt(req.body.credits);

    // Update the courses.json file
    fs.writeFileSync(path.join(__dirname, 'data', 'courses.json'), JSON.stringify(courses, null, 2));

    res.redirect('/courses');
});

// Route to handle course deletion
app.post('/courses/:id/delete', (req, res) => {
    const courseIndex = courses.findIndex(c => c.id === parseInt(req.params.id));
    if (courseIndex === -1) {
        return res.status(404).send('Course not found');
    }

    // Remove the course from the array
    courses.splice(courseIndex, 1);

    // Update the courses.json file
    fs.writeFileSync(path.join(__dirname, 'data', 'courses.json'), JSON.stringify(courses, null, 2));

    res.redirect('/courses');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
