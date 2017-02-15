'use strict'

var wechat = require('../../wechat/g');
var reply = require('../../weixin/reply')
var wx = require('../../weixin/index')

exports.hear =function *(next){
	this.middle =wechat(wx.wechatOptions.wechat,reply.reply);
	yield this.middle(next)
}