const mongoose = require('mongoose');

const user = new mongoose.Schema({
    userID: String,
    roles: Array
});

module.exports = mongoose.model('User', user);