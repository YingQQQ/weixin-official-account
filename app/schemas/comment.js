var mongoose=require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var CommentSchema= new mongoose.Schema({
	movie:{type:ObjectId,ref:'movies'},
	from:{type:ObjectId,ref:'users'},
	reply:[{
		from:{type:ObjectId,ref:'users'},
		to:{type:ObjectId,ref:'users'},
		content:String
	}],
	content:String,
	meta:{
		creatAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}

	}
})
CommentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})


CommentSchema.statics={
	fetch:function (cb) {
		return this.find({})
					.sort('meta.updateAt')
						.exec(cb)
	},
	findById:function (id,cb) {
		return this.findOne({_id:id})
						.exec(cb)
	}

}
module.exports=CommentSchema;