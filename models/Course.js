const mongoose = require('mongoose');

// Define the schema for courses
const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    credits: {
        type: Number,
        required: true,
        min: 1, // Minimum of 1 credit
    },
});

// Create and export the Course model
module.exports = mongoose.model('Course', CourseSchema);
