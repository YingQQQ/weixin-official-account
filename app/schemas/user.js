var mongoose=require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
// var bcrypt = require('bcrypt-nodejs')
var bcrypt = require('bcryptjs');

var UserSchema= new mongoose.Schema({
	name :{
		unique:true,
		type :String
	},
	password :String,
	openid:String,
	role:{
		type:Number,
		default:0
	},
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
UserSchema.pre('save', function(next) {
	var user = this
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }
  var SALT_WORK_FACTOR = 10;
  bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
  	if (err) return next(err);

  	bcrypt.hash(user.password,salt,function(err,hash){
  		if (err) return next(err);

  		user.password = hash;
  		next()
  	})
  })
})
UserSchema.methods = {
	comparePassword:function(_password,password){
		return function(cb){
			bcrypt.compare(_password,password,function(err,isMatch){
				cb(err,isMatch)
			})
		}
	}
}

UserSchema.statics={
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
module.exports=UserSchema;