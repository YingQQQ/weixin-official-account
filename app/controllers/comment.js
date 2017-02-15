const mongoose=require('mongoose');
const Comment=mongoose.model('comments')

exports.save = function *(next) {
 console.log('222');
 let _comment = this.request.body.comment;
 let movieId = _comment.movie;
 console.log('_comment')
 console.log(_comment)

 if (_comment.cid) {
	let comment = yield Comment.findOne({_id:_comment.cid}).exec();
	let reply = {
		from : _comment.from,
		to : _comment.tid,
		content : _comment.content
	}
	comment.reply.push(reply)
	yield comment.save()

	this.body = {success :1}
 }
 else{
 	let comment = new Comment(_comment)

 	yield comment.save()

	this.body = {success :1}
 }
}