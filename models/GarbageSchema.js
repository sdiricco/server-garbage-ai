const mongoose = require('mongoose');

const GarbageSchema = new mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    cap: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }

},{
    collection: 'wasteList'
});

module.exports = mongoose.model('GarbageSchema', GarbageSchema);
