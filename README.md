# Ivy Tech Courses Web Application

Welcome to the **Ivy Tech Courses Web Application**, your comprehensive solution for managing, exploring, and discovering courses offered at Ivy Tech Community College. Now featuring user authentication and login functionality.

---

## Features

- **User Authentication**: Register, log in, and manage profiles securely.
- **Search Courses**: Easily find courses by name or subject.
- **Add Courses**: Add new courses with details such as name, subject, and credits.
- **Edit Courses**: Update details about existing courses with ease.
- **Delete Courses**: Remove outdated or unnecessary courses from the system.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop use.
- **Cloud Database Integration**: Uses a remote database for enhanced accessibility and scalability.

---

## How to Use the Site

### User Authentication
- **Register**: Visit [http://localhost:3000/register](http://localhost:3000/register) to create a new account.
- **Log In**: Visit [http://localhost:3000/login](http://localhost:3000/login) to log into your account.
- **Profile Management**: Access your profile at [http://localhost:3000/profile](http://localhost:3000/profile) to view or update your information.

### Home Page
- Visit the home page at [http://localhost:3000/](http://localhost:3000/).
- Navigate to different sections using the responsive navigation bar.

### View All Courses
- Access the complete course list at [http://localhost:3000/courses](http://localhost:3000/courses).
- Use pagination to browse through the catalog.

### Search for Courses
- Use the search bar in the navigation menu to find courses by name or subject.

### Add a New Course
- Navigate to [http://localhost:3000/courses/new](http://localhost:3000/courses/new).
- Fill out the form and click "Add Course."

### Edit an Existing Course
- Select a course from the list and click the "Edit" button.
- Update the details and save changes.

### Delete a Course
- Click the "Delete" button on a course card to remove it.

---

## Cloud Database Configuration

This application is integrated with a cloud-hosted MySQL database for storing course data. The database credentials are:

- **Host**: `sql5.freesqldatabase.com`
- **Database Name**: `sql5748042`
- **User**: `sql5748042`
- **Password**: `76vgfEDKY5`
- **Port**: `3306`

The `server.js` file has been updated to use these credentials for database connectivity.

---

## Dependencies

This application requires the following dependencies:

- **Node.js**: Runtime for the server.
- **Express**: Web framework for routing.
- **EJS**: Templating engine for rendering dynamic HTML.
- **MySQL2**: Library for interacting with the MySQL database.
- **Body-parser**: Middleware for parsing form data.
- **Passport.js**: For user authentication.
- **Bcrypt.js**: For password hashing.
- **Express-session**: Middleware for managing sessions.
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
├── config/
│   └── passportConfig.js      # Configuration for user authentication
├── data/
│   └── courses.json           # Stores initial course data
├── node_modules/              # Installed npm dependencies
├── public/
│   ├── css/                   # CSS files for styling
│   ├── images/                # Images for the site
│   ├── js/                    # Frontend JavaScript
├── views/
│   ├── _flashMessages.ejs     # Partial for flash messages
│   ├── _footer.ejs            # Footer partial
│   ├── courseDetails.ejs      # Page displaying course details
│   ├── courses.ejs            # Page displaying all courses
│   ├── editCourse.ejs         # Form for editing a course
│   ├── index.ejs              # Home page
│   ├── login.ejs              # Login page
│   ├── navbar.ejs             # Navigation bar partial
│   ├── newCourse.ejs          # Form for adding a new course
│   ├── profile.ejs            # User profile page
│   ├── register.ejs           # User registration page
│   ├── schedule.ejs           # User course schedule page
├── package.json               # Node.js project metadata
├── package-lock.json          # Locked dependencies for reproducible builds
├── populateDatabase.js        # Script to populate the database with sample data
├── server.js                  # Main server file
├── README.md                  # Project documentation

```

---

## Known Issues and Future Enhancements

### Known Issues
- None reported at this time.

### Future Enhancements
- Deploy the site to a live server for easier access.
- Add an admin dashboard for managing users and courses.
- Implement a detailed course schedule feature.
- Provide user notifications for course updates.

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
