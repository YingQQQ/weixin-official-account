var mongoose = require('mongoose');
var CategorySchema = require('../schemas/category');
var Category = mongoose.model('categories', CategorySchema);

module.exports=Category;