'use strict'

var Promise=require('bluebird');
var request=Promise.promisify(require('request'));
var prefix='https://api.weixin.qq.com/cgi-bin/';
var _ = require('lodash')
var fs = require('fs')
var util = require('./util')
var api={
	accessTicket:prefix+'ticket/getticket?',
	accessToken:prefix+'token?grant_type=client_credential',
		temporary:{
			upload:prefix+'media/upload?',
			download:prefix+'media/get?'
		},
		permanent:{
			upload:prefix+'material/add_material?',
			fetch:prefix+'material/get_material?',
			uploadNews:prefix+'material/add_news?',
			uploadPic:prefix+'media/uploadimg?',
			delMaterial:prefix+'material/del_material?',
			updateNews:prefix+'material/update_news?',
			countMaterial:prefix+'material/get_materialcount?',
			batchgetMaterial:prefix+'material/batchget_material?'
		},
		group:{
			create:prefix+'groups/create?',
			get:prefix+'groups/get?',
			check:prefix+'groups/getid?',
			update:prefix+'groups/update?',
			move:prefix+'groups/members/update?',
			batchmove:prefix+'groups/members/batchupdate?',
			del:prefix+'groups/delete?'
		},
		user:{
			remark:prefix+'user/info/updateremark?',
			fetch:prefix+'user/info?',
			batch:prefix+'user/info/batchget?',
			list :prefix+'user/get?'
		},
		mass:{
			sendAll:prefix+'message/mass/sendall?',
			delMessageAll:prefix+'message/mass/delete?',
			previewMassage:prefix+'message/mass/preview?',
			checkMassage:prefix+'message/mass/get?',
			OpenID:prefix+'message/mass/send?'
		},
		menu:{
			create:prefix+'menu/create?',
			get:prefix+'menu/get?',
			del:prefix+'menu/delete?',
			current:prefix+'get_current_selfmenu_info?'
		},
		qrcord:{
			create:prefix+'qrcode/create?',
			show:'https://mp.weixin.qq.com/cgi-bin/showqrcode?'
		},
		shortUrl:{
			short:prefix+'shorturl?'
		},
		ticket:{
			get:prefix+'ticket/getticket?'
		}
}


function Wechat(opts){

	this.appID=opts.appID;
	this.appsecret=opts.appsecret;
	this.getAccessToken=opts.getAccessToken;
	this.saveAccessToken=opts.saveAccessToken;
	this.getTicket = opts.getTicket;
	this.saveTicket = opts.saveTicket;
	this.fetchAccessToken()
}

Wechat.prototype.isValidAccessToken = function(data) {
	if (!data || !data.access_token || !data.expires_in) {
		return false;
	}
	var access_token=data.access_token;
	var expires_in=data.expires_in;
	var now = (new Date().getTime())

	if (now < expires_in) {
		return true
	}else{
		return false
	}
};
//jsapi_ticket是否过期
Wechat.prototype.isValidTicket = function(data) {
	if (!data || !data.ticket || !data.expires_in) {
		return false;
	}
	var ticket=data.ticket;
	var expires_in=data.expires_in;
	var now = (new Date().getTime())

	if (ticket && now < expires_in) {
		return true
	}else{
		return false
	}
};
//获取jsapi_ticket
Wechat.prototype.updataTicket = function(access_token) {

	var url=api.accessTicket+'&access_token='+access_token+'&&type=jsapi';

	return new Promise(function(resolve,reject){
		request({url: url , json : true}).then(function(response){

			var data = response.body;

			var now = (new Date().getTime())

			var expires_in = now+(data.expires_in-20)*1000
			data.expires_in = expires_in;

			resolve(data)
		})
	})
}
//获取api_ticket
Wechat.prototype.fetchTicket = function(access_token) {
	var that = this;

	 return this.getTicket()
		.then(function(data){
			try{
				data=JSON.parse(data);
			}
			catch(e){
				return that.updataTicket(access_token)
			}
			if (that.isValidTicket(data)) {
				return Promise.resolve(data)
			}else{
				return that.updataTicket(access_token)
			}
		})
		.then(function(data){

			that.saveTicket(data);
			//console.log(data)
			return Promise.resolve(data);
		})

}
Wechat.prototype.fetchAccessToken = function() {
	var that = this;

	 return this.getAccessToken()
		.then(function(data){
			try{
				data=JSON.parse(data);
			}
			catch(e){
				return that.updataAccessToken()
			}
			if (that.isValidAccessToken(data)) {
				return Promise.resolve(data)
			}else{
				return that.updataAccessToken()
			}
		})
		.then(function(data){

			that.saveAccessToken(data);

			return Promise.resolve(data);
		})

}
//长链接转短链接接口
Wechat.prototype.createShortUrl = function(action,url){
	var long2shortUrl = api.shortUrl.short;
    var that = this;
    var action = action || long2short
    var form = {
    	action :action,
    	long_url:url
    }
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = long2shortUrl + 'access_token=' + data.access_token ;

	            request({method:'POST',url: url, body:form, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("deleteMenu is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//通过ticket换取二维码
Wechat.prototype.showQrcode = function(ticket){
	return api.qrcode.show+'ticket='+encodeURI(ticket)
}
//生成带参数的二维码
Wechat.prototype.createQrcode = function(qrcode){
	var createQrcodeUrl = api.qrcode.create;
    var that = this;

    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = createQrcodeUrl + 'access_token=' + data.access_token ;

	            request({method:'POST',url: url, body:qrcode, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("deleteMenu is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//获取自定义菜单配置接口
Wechat.prototype.getCurrentMenu = function(){
	var getCurrentUrl = api.menu.current;
    var that = this;

    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = getCurrentUrl + 'access_token=' + data.access_token ;

	            request({method:'GET',url: url, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("deleteMenu is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//自定义菜单删除接口
Wechat.prototype.deleteMenu = function(){
	var delMenuUrl = api.menu.del;
    var that = this;

    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = delMenuUrl + 'access_token=' + data.access_token ;

	            request({method:'GET',url: url, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("delMenuUrl is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//自定义菜单查询接口
Wechat.prototype.getMenu = function(){
	var getMenuUrl = api.menu.get;
    var that = this;

    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = getMenuUrl + 'access_token=' + data.access_token ;

	            request({method:'GET',url: url, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("getMenu is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//自定义菜单创建接口
Wechat.prototype.createMenu = function(menu){
	var createMenuUrl = api.menu.create;
    var that = this;

    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = createMenuUrl + 'access_token=' + data.access_token ;

	            request({method:'POST',url: url, body: menu, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("createMenu is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//OpenID列表群发
Wechat.prototype.sendByOpenID = function(msgtype,message,OPENID){
	var sendUrl = api.mass.sendAll;
    var that = this;
    var msg = {
    	touser:OPENID,
    	msgtype:msgtype,
    }
    if (!group_id) {
    	msg.filter.is_to_all = true;
    }else{
    	msg.filter.is_to_all = false;
    	msg.filter.group_id = group_id;
    }

  	var type = msg[msgtype] = {}

    if (msgtype === 'mpnews' ||msgtype === 'voice' || msgtype === 'image' || msgtype === 'mpvideo') {
    	type.media_id = message
    }
    if (msgtype === 'text') {
    	type.content = message
    }
    if (msgtype === 'wxcard' && message ==='object') {
    	type.card_id = message.card_id;
    }
    console.log(msg)
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = sendUrl + 'access_token=' + data.access_token ;

	            request({method:'POST',url: url, body: msg, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("sendByGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//预览接口
Wechat.prototype.previewInterfaces = function(msgtype,message,OPENID){
	var previewUrl = api.mass.previewMassage;
    var that = this;
    var msg = {
    	touser:OPENID,
    	msgtype:msgtype
    }
  	var type = msg[msgtype] = {}
    if (msgtype === 'mpnews' ||msgtype === 'voice' || msgtype === 'image' || msgtype === 'mpvideo') {
    	type.media_id = message
    }
    if (msgtype === 'text') {
    	type.content = message
    }
    if (msgtype === 'wxcard' && message ==='object') {
    	type.card_id = message.card_id;
    	type.card_ext = message.card_ext;
    }
       return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = previewUrl + 'access_token=' + data.access_token ;

	            request({method:'POST',url: url, body: msg, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("previewInterfaces is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//删除群发
Wechat.prototype.deldteGroup = function(msg_id){
	var delUrl = api.mass.delMessageAll;
    var that = this;
    var msg ={
    	msg_id:msg_id
    }
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = delUrl + 'access_token=' + data.access_token ;

	            request({method:'POST',url: url, body: msg, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("deldteGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//根据分组进行群发
Wechat.prototype.sendByGroup = function(msgtype,message,group_id){
	var sendUrl = api.mass.sendAll;
    var that = this;
    var msg = {
    	filter:{},
    	msgtype:msgtype,
    }
    if (!group_id) {
    	msg.filter.is_to_all = true;
    }else{
    	msg.filter.is_to_all = false;
    	msg.filter.group_id = group_id;
    }

  	var type = msg[msgtype] = {}

    if (msgtype === 'mpnews' ||msgtype === 'voice' || msgtype === 'image' || msgtype === 'mpvideo') {
    	type.media_id = message
    }
    if (msgtype === 'text') {
    	type.content = message
    }
    if (msgtype === 'wxcard' && message ==='object') {
    	type.card_id = message.card_id;
    	type.card_ext = message.card_ext;
    }
    console.log(msg)
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = sendUrl + 'access_token=' + data.access_token ;

	            request({method:'POST',url: url, body: msg, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("sendByGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//用户列表
Wechat.prototype.listUsers = function(openid){
	var listUrl = api.user.list;
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = listUrl + 'access_token=' + data.access_token ;
	            if (openid) {
	            	url += '&next_openid=' + openid
	            }
	            request({method:'GET',url: url, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("moveGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//获取用户基本信息
Wechat.prototype.fetchUsers = function(openid,lang){
	var lang = lang || 'zh-CN'
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var options={
	            	json: true,

	            }
	            if (_.isArray(openid)) {
	            	 options.url = api.user.batch + 'access_token=' + data.access_token ;
		             options.body={
		            	user_list:openid
		            }
	            	options.method = 'POST'
	            }else{
	            	options.method = 'GET'
	            	options.url = api.user.fetch+'access_token=' + data.access_token+'&openid='+openid+'&lang='+lang;
	            }

	            request(options).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("moveGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//设置备注名
Wechat.prototype.remarkUsers = function(openid,remark){
	var remarkUrl = api.user.remark;
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = remarkUrl + 'access_token=' + data.access_token ;
	            var form={
	            	openid:openid,
	            	remark:remark
	            }
	            request({method:'POST',url: url, body: form, json: true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("moveGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//删除分组
Wechat.prototype.delGroup = function(id){
	var delUrl = api.group.del;
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = delUrl + 'access_token=' + data.access_token ;
	            var form={
	            	group:{
	            		id:id
	            	}
	            }
	            request({method:'POST',url: url,body :form,json:true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("moveGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//移动用户分组
Wechat.prototype.moveGroup = function(openid,to_groupid){
	var form={
		to_groupid:to_groupid
	}
	if (_.isArray(openid)) {
		var moveUrl = api.group.batchmove;
		form.openid_list = openid;
	}else{
		var moveUrl = api.group.move;
		form.openid = openid
	}

    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {

	            var url = moveUrl + 'access_token=' + data.access_token ;
	            console.log(form)
	            request({method:'POST',url: url,body:form,json:true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("moveGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//修改分组名
Wechat.prototype.updateGroup = function(id,name){
	var updateUrl=api.group.update;
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {

	            var url = updateUrl + 'access_token=' + data.access_token ;
	            var form={
	           		group:{
	           			id:id,
	           			name:name
	           		}
	           	}
	            request({method:'POST',url: url,body:form,json:true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("updateGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//查询用户所在分组
Wechat.prototype.checkGroup = function(openid){
	var checkUrl=api.group.check;
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {

	            var url = checkUrl + 'access_token=' + data.access_token ;
	            var form={
	           		openid:openid
	           	}
	            request({method:'POST',url: url,body:form,json:true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("checkGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//查询所有分组
Wechat.prototype.fetchGroup = function(){
	var getUrl=api.group.get;
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {

	            var url = getUrl + 'access_token=' + data.access_token ;

	            request({method:'GET',url: url,json:true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("getCountMaterial is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
//创建分组
Wechat.prototype.createGroup = function(name){
	var createUrl=api.group.create;
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {

	            var url = createUrl + 'access_token=' + data.access_token ;
	           	var form={
		           		group:{
		           			name:name
		           		}
	           		}
	            request({method:'POST',url: url,body:form,json:true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("createGroup is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
Wechat.prototype.getCountMaterial = function(){
	var countUrl=api.permanent.countMaterial;
    var that = this;
    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {
	            var url = countUrl + 'access_token=' + data.access_token ;

	            request({method:'GET',url: url,json:true}).then(function(response) {
                    var _data = response.body;

                    if (_data) {
                        resolve(_data);
                    } else {
                        throw new Error("getCountMaterial is fails");
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
	        })
	})
}
Wechat.prototype.batchgetMaterialList = function(options){
	var batchUrl=api.permanent.batchgetMaterial;
	var that = this;
	options.type = options.type || 'image';
	options.offset = options.offset || 0;
	options.count = options.count || 10;

    return new Promise(function(resolve, reject) {
	    that.fetchAccessToken()
	        .then(function(data) {

	            var url = batchUrl + 'access_token=' + data.access_token ;

	            request({method:'POST',url:url,json:true,body:options}).then(function(response) {
	                    var _data = response.body;
	                    console.log(_data)
	                    if (_data) {
	                        resolve(_data);
	                    } else {
	                        throw new Error("batchgetMaterialList is fails");
	                    }
	                })
	                .catch(function(err) {
	                    reject(err)
	                })

	        })
	})
}
Wechat.prototype.updateMaterial = function(media_id,news) {
	var updataUrl=api.temporary.updateNews;
	var form ={}
	_.extend(form, news)
	var that = this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken()
            .then(function(data){
            	var url = updataUrl + 'access_token=' + data.access_token+'media_id'+media_id ;
            	var options = {
                	method:'POST',
                	url: url,
                	json:true,
                }

               	options.body = form;

            	request(options).then(function(response) {
		                var _data = response.body;
		                if (_data) {
		                    resolve(_data);
		                } else {
		                    throw new Error("updateMaterial meterial fails");
		                }
		            })
		            .catch(function(err) {
		                reject(err)
		            })
		})
    })
};
Wechat.prototype.delMaterial = function(media_id) {
	var delUrl=api.temporary.delMaterial;
	var that = this;
	var form ={
		media_id:media_id
	}
	return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {

                var url = delUrl + 'access_token=' + data.access_token ;

                var options = {
                	method:'POST',
                	url: url,
                	json:true
                }
                options.body = form

                request(options).then(function(response) {
                        var _data = response.body;

                        if (_data) {
                            resolve(_data);
                        } else {
                            throw new Error("delMaterial is fails");
                        }
                    })
                    .catch(function(err) {
                        reject(err)
                    })

            })
    })
};
Wechat.prototype.fetchMaterial = function(type,media_id,permanent) {

	var fetchUrl= api.temporary.fetch;
	if (permanent) {
		fetchUrl = api.permanent.fetch
	}
	var that = this;
	  return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = fetchUrl + 'access_token=' + data.access_token ;
           		var form = {}
                var options = {
                	method:'POST',
                	url: url,
                	json:true
                }
                if (permanent) {
                	form.media_id = media_id;
                	form.access_token = data.access_token;
                	options.body = form;

                }else{
                	if (type === 'video') {
                		url = url.replace('https://','http://')
                	}
                	url+= 'media_id'+media_id
                }
                if (type === 'video' || type === 'news') {
	                request(options).then(function(response) {
	                        var _data = response.body;
	                        if (_data) {
	                            resolve(_data);
	                        } else {
	                            throw new Error("Upload meterial fails");
	                        }
	                    })
	                    .catch(function(err) {
	                        reject(err)
	                    })
                }else{
                	resolve(url)
                }

            })
    })
}

Wechat.prototype.uploadMaterial = function(type,material,permanent) {
	var form= {};
	var uploadUrl= api.temporary.upload;
	if (permanent) {
		uploadUrl = api.permanent.upload;
		_.extend(form, permanent);

	}
	//控制流是否应该在permanent里面 否则当type传入pic的时候uploadUrl发生了改变，无法判断是不是临时素材
	if (type === 'pic') {
		uploadUrl = api.permanent.uploadPic;
	}

	if (type === 'news') {
		uploadUrl = api.permanent.uploadNews;
		form = material
	}else{
		form.media =fs.createReadStream(material)
	}

	var that = this;

	  return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = uploadUrl + 'access_token=' + data.access_token ;
                if (!permanent) {
                	url+= '&type=' + type
                }else{
                	form.access_token = data.access_token;
                }
                var options = {
                	method:'POST',
                	url: url,
                	json:true
                }
                if (type === 'news') {
                	options.body = form
                }else{
                	options.formData =form
                }
                request(options).then(function(response) {
                        var _data = response.body;
                        if (_data) {
                            resolve(_data);
                        } else {
                            throw new Error("uploadMaterial is fails");
                        }
                    })
                    .catch(function(err) {
                        reject(err)
                    })

            })
    })
}

Wechat.prototype.updataAccessToken = function() {
	var appID = this.appID;
	var appsecret = this.appsecret;
	var url=api.accessToken+'&appid='+appID+'&secret='+appsecret;

	return new Promise(function(resolve,reject){
		request({url: url , json : true}).then(function(response){

			var data = response.body;
			console.log(data)
			var now = (new Date().getTime())

			var expires_in = now+(data.expires_in-20)*1000
			data.expires_in = expires_in;

			resolve(data)
		})
	})
}

Wechat.prototype.reply = function() {
	var content = this.body;
	var message = this.weixin;
	// console.log(content)//wow
	var xml = util.tpl(content,message);
	this.status = 200;
	this.type = 'application/xml';
	this.body = xml
};
module.exports=Wechat;