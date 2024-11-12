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
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    recurrence: {
        type: String,
    }
})

module.exports = mongoose.model('Post', PostSchema);