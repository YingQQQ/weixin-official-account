var mongoose = require('mongoose');
var CommentSchema = require('../schemas/comment');
var Comment = mongoose.model('comments', CommentSchema);

module.exports=Comment;