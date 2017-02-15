'use strict'

const User=require('../models/user');
const _ = require('lodash');

exports.ShowSignup = function *(next){
	yield this.render('pages/signup', {
	    title: '注册'
	})
}
exports.ShowSignin = function *(next){
	yield this.render('pages/signin', {
	    title: '登录'
	})
}

exports.signinRequired = function *(next){
	var user = this.session.user;
	console.log('wechat user');
	console.log(user);
	if (!user) {
		this.redirect('/signin')
	}
	else{
		yield next;
	}
}
exports.adminRequired = function *(next){
	var user = this.session.user;
	console.log('adminRequired user')
	console.log(user.role)
	if (user.role <=10) {
		this.redirect('/signin')
	}
	else{

		yield next;
	}
}
exports.list = function *(s) {
    //schema movie's method
    //查询该数据库下所有记录
    let users= yield User.find({})
							    .sort('meta.updateAt')
							    .exec();

    yield this.render('pages/userlist', {
        title: 'imooc 用户列表页',
        users: users
    })

}
	//singup
exports.signup = function *(next){
    var _user = this.request.body.user;
    //console.log(_user)
    let user =yield User.findOne({name:_user.name}).exec();
  	if (user) {
  		this.redirect('/signin')

  	}
  	else{
	  	user = new User(_user);
	    yield user.save()

    	this.redirect('/')
  	}
}
	// signin
exports.signin = function *(next){
	var _user = this.request.body.user;
	var name = _user.name;
	var password = _user.password;
	let user = yield User.findOne({name:name}).exec();
		if (!user) {
			this.redirect('/signup')
			return next;
		}

		var isMatch =yield user.comparePassword(password,user.password)
			if (isMatch) {
				this.session.user = user;
				console.log('password OK')
				this.redirect('/')
			}else{
				this.redirect('/signin')
				console.log('Your Password is wrong')
			}
}
	//logout
exports.logout= function *(next){
	delete this.session.user ;
	//delete app.locals.user;
	this.redirect('/')
}