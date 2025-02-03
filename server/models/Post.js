const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    startDay: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    recurrence: {
        type: String,
    },
    eventID: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Post', PostSchema);