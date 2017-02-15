'use strict'
var util = require('../../libs/util')
var wx = require('../../weixin/index')
var Movie = require('../api/movie')
const mongoose = require('mongoose');
const User = mongoose.model('users')
const Comment = mongoose.model('comments')
const koa_request = require('koa-request');
exports.guess = function *(next){
	var wechatApi = wx.getWechat()

	var data = yield wechatApi.fetchAccessToken();

	var access_token = data.access_token;

	var ticketData = yield wechatApi.fetchTicket(access_token);

	var ticket = ticketData.ticket;

	var url = this.href;
	//console.log(url)
	var params = util.sign(ticket,url)
	console.log('params');
	console.log(params);

	yield this.render('wechat/game',params);

}
exports.jump = function *(next){
	let id = this.params.id;
	let redirect = 'http://347c2f46.ngrok.natapp.cn/wechat/movie/'+id;
	let url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+ wx.wechatOptions.wechat.appID +'&redirect_uri='+redirect+'&response_type=code&scope=snsapi_base&state='+id+'#wechat_redirect';
	this.redirect(url)
}
exports.find = function *(next){
	var wechatApi = wx.getWechat()
	var id  = this.params.id;
	var code = this.query.code;
	let openUrl ='https://api.weixin.qq.com/sns/oauth2/access_token?appid='+wx.wechatOptions.wechat.appID+'&secret='+wx.wechatOptions.wechat.appsecret+'&code='+ code +'&grant_type=authorization_code'

	let response = yield koa_request({
		url: openUrl
	})
	let body = JSON.parse(response.body)
	let openid = body.openid
	var user = yield User.findOne({openid:openid}).exec();
	if (!user) {
		  user = new User({
			openid:openid,
			name:Math.random().toString(36).substr(2),
			password:'goodgood'
		})
		user = yield user.save()
	}
	this.session.user = user;
	this.state.user = user;
	let comments = yield Comment
	            .find({movie:id})
	            .populate('from','name')
	            .populate('reply.from reply.to','name')
	            .exec();
	var data = yield wechatApi.fetchAccessToken();
	var access_token = data.access_token;

	var ticketData = yield wechatApi.fetchTicket(access_token);

	var ticket = ticketData.ticket;

	var url = this.href;
	//console.log(url)
	var params = util.sign(ticket,url)
	var movie = yield Movie.searchById(id)
	params.movie = movie;
	params.comments = comments
	yield this.render('wechat/movie',params);

}
