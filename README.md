# Ivy Tech Courses Web Application

Welcome to the **Ivy Tech Courses Web Application**, your one-stop solution for managing, exploring, and discovering courses offered at Ivy Tech Community College.

---

## Features

- **Search Courses**: Find courses by name or subject.
- **Add Courses**: Add new courses with details like name, subject, and credits.
- **Edit Courses**: Update information about existing courses.
- **Delete Courses**: Remove outdated or unnecessary courses.
- **Responsive Design**: Fully functional across mobile, tablet, and desktop screens.

---

## How to Use the Site

### Home Page
- Visit the home page at [http://localhost:3000/](http://localhost:3000/).
- Navigate to different sections using the responsive navigation bar.

### View All Courses
- Access the full course list at [http://localhost:3000/courses](http://localhost:3000/courses).
- Use pagination to browse through the course catalog.

### Search for Courses
- Use the search bar in the navigation menu to find courses by name or subject.

### Add a New Course
- Click on the "Add Course" button in the navigation bar or visit [http://localhost:3000/courses/new](http://localhost:3000/courses/new).
- Fill out the form and click "Add Course."

### Edit an Existing Course
- Select a course from the list and click the "Edit" button.
- Update the details and save changes.

### Delete a Course
- Click the "Delete" button on a course card to remove it.

---

## Dependencies

This application requires the following dependencies:

- **Node.js**: Runtime for the server.
- **Express**: Web framework for routing.
- **EJS**: Templating engine for rendering dynamic HTML.
- **Body-parser**: Middleware for parsing form data.
- **Nodemon** (dev dependency): Automatically restarts the server during development.

---

## Installing Dependencies

Run the following command in the project directory:

```bash
npm install
```

---

## Hardware Requirements

### Development Environment
- **Processor**: Dual-core 2.0 GHz or better
- **Memory**: 4 GB RAM minimum
- **Storage**: 1 GB available space
- **OS**: Windows 10/11, macOS, or Linux

### For Users Running the Site Locally
- Any device capable of running a modern web browser (e.g., Chrome, Firefox, Edge).

---

## How to Run the Project

### Clone the Repository
```bash
git clone <your-repo-url>
cd <project-directory>
```

### Install Dependencies
```bash
npm install
```

### Start the Server
```bash
npm start
```

The application will run at [http://localhost:3000](http://localhost:3000).

### Development Mode (Optional)
To use Nodemon for development, run:
```bash
npm run dev
```

---

## Project Structure

```plaintext
.
├── data/
│   └── courses.json          # Stores course data
├── public/
│   ├── css/                  # CSS files for styling
│   ├── images/               # Images for the site
│   ├── js/                   # Frontend JavaScript
├── views/
│   ├── courses.ejs           # Page displaying all courses
│   ├── editCourse.ejs        # Form for editing a course
│   ├── newCourse.ejs         # Form for adding a new course
│   ├── courseDetails.ejs     # Page displaying course details
│   ├── _footer.ejs           # Footer partial
│   ├── index.html            # Home page
├── server.js                 # Main server file
├── package.json              # Node.js project metadata
└── README.md                 # Project documentation
```

---

## Known Issues and Future Enhancements

### Known Issues
- None reported at this time.

### Future Enhancements
- Add user authentication for course management.
- Implement a dedicated About page and Contact form.
- Deploy the site to a live server for easier access.

---

## Contributing

If you’d like to contribute:

1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push to your forked repository.
4. Submit a pull request for review.

---

## License

This project is licensed under the **MIT License**.
