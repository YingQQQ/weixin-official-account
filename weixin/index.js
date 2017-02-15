'use strict'
var util=require('../libs/util');
var fs = require('fs')
var path = require('path');
var Wechat = require('../wechat/wechat')
var wechat_file=path.join(__dirname,'../config/wechat_file.txt');
var wechat_ticket_file = path.join(__dirname,'../config/wechat_ticket_file.txt');


var config={
			wechat:{
				appID:'yourself appID',
				appsecret:'yourself appsecret',
				Token:'yourself Token ',
				getAccessToken:function () {
					return util.readFile(wechat_file)
				},
				saveAccessToken:function(data){
					data = JSON.stringify(data)
					return util.writeFile(wechat_file,data);
				},
				getTicket:function () {
					return util.readFile(wechat_ticket_file)
				},
				saveTicket:function(data){
					data = JSON.stringify(data)
					return util.writeFile(wechat_ticket_file,data);
				}
		}

}
exports.wechatOptions= config
exports.getWechat = function () {
	var wechatApi = new Wechat(config.wechat);
	return wechatApi;
}