'use strict'

var fs=require('fs');
var Promise = require('bluebird');

exports.readFile=function (filePath,encoding ){
	return new Promise(function(resolve,reject){
		fs.readFile(filePath,encoding,function(err,data){
			if (err) {
				reject(err)}
			else{
				resolve(data)
			}
		})
	})
}

exports.writeFile=function (filePath,data ){
	return new Promise(function(resolve,reject){
		fs.writeFile(filePath,data,function(err,data){
			if (err) {reject(err)}
			else{
				resolve(data)
			}
		})
	})
}
var crypto = require('crypto');

var createNonce = function (){
	return Math.random().toString(36).substr(2,15)
}
var createTimestamp = function (){
	return parseInt(new Date().getTime()/1000,10)+'';
}
var _sign =function(noncestr,ticket,timestamp,url){
	var params =[
		'noncestr=' + noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url=' + url
	]

	var str = params.sort().join('&');

	var shasum = crypto.createHash('sha1');

	shasum.update(str);
	return shasum.digest('hex')

}
exports.sign=function(ticket,url){
	var noncestr = createNonce(),
		timestamp = createTimestamp(),
		signature = _sign(noncestr,ticket,timestamp,url);

	return {
		noncestr : noncestr,
		timestamp : timestamp,
		signature : signature
	}

}
