var mongoose = require('mongoose');
var MovieSchema = require('../schemas/movie');
var Movie = mongoose.model('movies', MovieSchema);

module.exports=Movie;