'use strict'

var sha1=require('sha1')
var Wechat=require('./wechat')
var getRawBody = require('raw-body')
var util = require('./util')
module.exports=function(opts,handler){
	var wechat= new Wechat(opts);

	return function* (next){

		var that = this;
		var Token = opts.Token;
		var signature = this.query.signature;
		var timestamp = this.query.timestamp;
		var nonce = this.query.nonce;
		var echostr	=this.query.echostr;

		var str =[Token,timestamp,nonce].sort().join('');
		var sha=sha1(str);
		if (this.method === 'GET') {
			if (sha === signature) {
				this.body=echostr+'';
			}else{
				this.body='wrong!';
			}
		}
		else if (this.method === 'POST') {
			if (sha !== signature) {
				return false;
			}
			var data = yield getRawBody(this.req,{
				length:this.length,
				limit: '1mb',
    			encoding: this.charset
			})
			var content = yield util.parseXMLAsync(data)
			var message = util.formatMessage(content.xml)
			this.weixin = message;

			yield handler.call(this,next);

			wechat.reply.call(this)
		}
	}
}

