const mongoose = require('mongoose');

// Define the schema for users
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email addresses are unique
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['teacher', 'student'], // Restrict roles to 'teacher' or 'student'
    },
    schedule: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course', // Reference the Course model
        },
    ],
});

// Create and export the User model
module.exports = mongoose.model('User', UserSchema);
