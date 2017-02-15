'use strict'
var path = require('path')
var wx = require('./index')
var wechatApi = wx.getWechat()
var _ = require('lodash')
const Movie =require('../app/api/movie')

var filepath = {
	jpg2:path.join(__dirname,'../2.jpg'),
	video:path.join(__dirname,'../dengchao.mp4'),
	jpg3:path.join(__dirname,'../3.jpg'),
	jpg4:path.join(__dirname,'../4.jpeg')
};

exports.reply = function *(next) {
	var message = this.weixin;

	if (message.MsgType === 'event') {
		if (message.Event === 'subscribe') {
			this.body = '哈哈，订阅成功\n'+
			'回复 1~3，测试文字回复\n'+
			'回复 4，测试图文回复\n'+
			'回复 首页，进入电影首页\n'+
			'回复 游戏，进入游戏首页\n'+
			'回复 电影名字，查询电影信息\n'+
			'回复 语音，查询电影信息\n'+
			'也可以点击<a href="http://7328164a.ngrok.natapp.cn/wechat/movie">语音查电影</a>\n'
		}

		else if (message.Event === 'unsubscribe') {
			console.log('取消关注');
			this.body='1'
		}
		else if (message.Event === 'LOCATION') {
			console.log('取消关注')
			this.body = 'Your location is: '+message.Latitude;+'/'+
			message.longitude+message.Precision;
		}
		else if (message.Event === 'CLICK') {
			this.body= '你点击了餐单： '+message.EventKey;
		}
		else if (message.Event === 'SCAN') {
			console.log('关注二维码' +message.EventKey+message.Ticket);
			this.body = '看到了扫一下哈'
		}
		else if (message.Event === 'VIEW'){
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}
		else if (message.Event === 'scancode_push'){
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}
		else if (message.Event === 'scancode_waitmsg'){
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}
		else if (message.Event === 'pic_sysphoto'){
			console.log(message.SendPicsInfo.Count)
			console.log(message.SendPicsInfo.PicList)
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}
		else if (message.Event === 'pic_photo_or_album'){
			console.log(message.SendPicsInfo.Count)
			console.log(message.SendPicsInfo.PicList)
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}
		else if (message.Event === 'pic_weixin'){
			console.log(message.SendPicsInfo.Count)
			console.log(message.SendPicsInfo.PicList)
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}
		else if (message.Event === 'location_select'){
			console.log(message.SendLocationInfo.Location_X)
			console.log(message.SendLocationInfo.Location_Y)
			console.log(message.SendLocationInfo.Scale)
			console.log(message.SendLocationInfo.Label)
			console.log(message.SendLocationInfo.Poiname)
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}
		else if (message.Event === 'media_id'){
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}
		else if (message.Event === 'view_limited'){
			this.body  = '你点击了餐单中的链接：'+message.EventKey;
		}

	}
	else if (message.MsgType === 'voice'){
		var voiceText =message.Recognition;
		var movies =yield Movie.searchByName(voiceText)
		console.log('voiceText ')
		console.log(message)
		if (! movies || movies.length === 0) {
			movies =yield Movie.searchByDouBan(voiceText)
		}
		if (movies && movies.length > 0) {
			reply=[];
			movies = movies.slice(0,10);
			movies.forEach(function(movie){
				reply.push({
					title : movie.title,
					description: movie.title,
					picUrl: movie.poster,
					url :'http://347c2f46.ngrok.natapp.cn/wechat/jump/'+movie._id
				})
			})
		}
		else{
		reply  = '没有查选到'+content +'没有匹配到相关电影';
		}
		this.body = reply;
	}
	else if (message.MsgType === 'text'){
		var content = message.Content;
		var reply = '你说的是 '+message.Content+'太复杂了'
		this.body  = '你点击了餐单中的链接：'+message.EventKey;
		if (content === '1') {
			reply = 'WoW';
		}
		else if (content === '2') {
			reply = 'Dota2';
		}
		else if (content === '3') {
			reply = 'LOL';
		}
		else if (content === '4') {
			reply = [{
				title:'技术改变世界',
				description:'只是个描述',
				picUrl:'http://img3.3lian.com/2013/v8/72/d/61.jpg',
				url:'https://www.baidu.com/'
			},{
				title:'湖和小船',
				description:'风景',
				picUrl:'http://img01.taopic.com/150116/240448-15011610051136.jpg',
				url:'www.sina.com'
			}];
		}
		else{
			var movies =yield Movie.searchByName(content)
			// console.log('movies searchByName')
			// console.log(movies)
			if (! movies || movies.length === 0) {
				movies =yield Movie.searchByDouBan(content)
				// console.log('movies searchByDouBan')
				// console.log(movies)
			}
			if (movies && movies.length > 0) {
				reply=[];
				movies = movies.slice(0,10);
				movies.forEach(function(movie){

					reply.push({
						title : movie.title,
						description: movie.title,
						picUrl: movie.poster,
						url :'http://347c2f46.ngrok.natapp.cn/wechat/jump/'+movie._id
					})
				})
			}
			else{
				reply  = '没有查选到'+content +'没有匹配到相关电影';
			}
		}

		// else if (content === '5') {
		// 	var data = yield wechatApi.uploadMaterial('image',filepath.jpg2)

		// 	reply ={
		// 		type:'image',
		// 		media_id: data.media_id
		// 	};
		// }
		// else if (content === '6'){
		// 	var data = yield wechatApi.uploadMaterial('video',filepath.video)
		// 	console.log(data);
		// 	reply ={
		// 		type:'video',
		// 		title:'dengchao',
		// 		description:'dengchao',
		// 		media_id: data.media_id
		// 	};
		// }
		// else if (content === '7'){
		// 	var data = yield wechatApi.uploadMaterial('image',filepath.jpg3)
		// 	reply ={
		// 		type:'music',
		// 		title:'一声所爱',
		// 		description:'大话西游',
		// 		musicUrl:'http://up.haoduoge.com/mp3/2016-06-19/1466311430.mp3',
		// 		thumbMediaId:data.media_id
		// 	};
		// }
		// else if (content === '8') {
		// 	var data = yield wechatApi.uploadMaterial('image',filepath.jpg3,{type:'image'})

		// 	reply ={
		// 		type:'image',
		// 		media_id: data.media_id
		// 	};
		// }
		// else if (content === '9') {
		// 	var data = yield wechatApi.uploadMaterial('video',filepath.video,
		// 		{type:'video',description:'{"title":"one min video","introduction":"No Intering"}'})

		// 	reply ={
		// 		type:'video',
		// 		title:'dengchao',
		// 		description:'dengchao',
		// 		media_id: data.media_id
		// 	};
		// }
		// else if (content === '10') {
		// 	var picData = yield wechatApi.uploadMaterial('image',filepath.jpg4,{})

		// 	var media ={
		// 		articles:[{
		// 			title:'小清新',
		// 			thumb_media_id:picData.media_id,
		// 			author:'IU',
		// 			digest:'夏天的风',
		// 			show_cover_pic:1,
		// 			content:'原来从未忘记,Melody脑海中的旋律转个不停,爱过你 有太多话忘了要告诉你',
		// 			content_source_url:'www.baidu.com'
		// 		}]
		// 	}
		// 	var data = yield wechatApi.uploadMaterial('news',media,{});

		// 	console.log(data);
		// 	var fetchData = yield wechatApi.fetchMaterial('news',data.media_id,{})

		// 	var items =fetchData.news_item;
		// 	var news =[]
		// 	items.forEach (function(val){
		// 		news.push({
		// 			title:val.title,
		// 			description:val.digest,
		// 			picUrl:val.url,
		// 			url:val.content_source_url
		// 		})
		// 	})
		// 	reply = news
		// }
		// else if (content === '11'){
		// 	var count = yield wechatApi.getCountMaterial();

		// 	var result = yield [
		// 		wechatApi.batchgetMaterialList({
		// 			type:'image',
		// 			offset:0,
		// 			count:10
		// 		}),
		// 		wechatApi.batchgetMaterialList({
		// 			type:'video',
		// 			offset:0,
		// 			count:10
		// 		}),
		// 		wechatApi.batchgetMaterialList({
		// 			type:'news',
		// 			offset:0,
		// 			count:10
		// 		}),
		// 		wechatApi.batchgetMaterialList({
		// 			type:'voice',
		// 			offset:0,
		// 			count:10
		// 		})
		// 	]

		// 	console.log(result)
		// 	reply = '11'
		// }
		// else if (content === '12') {
		// 	// var createdata = yield wechatApi.createGroup('IU');
		// 	// console.log('创建分组');
		// 	// console.log(createdata);

		// 	// var fetchdata = yield wechatApi.fetchGroup();
		// 	// console.log('查询所有分组')
		// 	// console.log(fetchdata)

		// 	var checkdata = yield wechatApi.checkGroup(message.FromUserName);

		// 	console.log('查询用户所在分组')
		// 	console.log(checkdata)

		// 	// var updatedata = yield wechatApi.updateGroup(101,'Dota2');
		// 	// var fetchdata = yield wechatApi.fetchGroup();
		// 	// console.log('修改分组名')
		// 	// console.log(fetchdata)
		// 	// console.log(updatedata)

		// 	// var movedata = yield wechatApi.moveGroup(message.FromUserName,100);
		// 	//var fetchdata = yield wechatApi.fetchGroup();
		// 	// console.log('移动用户分组')
		// 	// console.log(movedata)
		// 	// console.log(fetchdata)

		// 	// var movedata = yield wechatApi.moveGroup([message.FromUserName],106);
		// 	// var fetchdata = yield wechatApi.fetchGroup();
		// 	// console.log('移动用户分组')
		// 	// console.log(movedata)
		// 	// console.log(fetchdata)

		// 	// var deldata = yield wechatApi.delGroup(107)
		// 	// var fetchdata = yield wechatApi.fetchGroup();
		// 	// console.log('删除分组')
		// 	// console.log(deldata)
		// 	// console.log(fetchdata)
		// 	reply ='12'
		// }
		// else if (content === '13') {
		// 	/*var fetchUsersData = yield  wechatApi.fetchUsers(message.FromUserName)
		// 	console.log(fetchUsersData);*/

		// 	var opts = [
		// 		{	openid:message.FromUserName,
		// 			lang: "zh_TW "
		// 		},
		// 		{	openid:message.FromUserName,
		// 			lang: "en "
		// 		}
		// 	]
		// 	var fetchUsersDataArray = yield  wechatApi.fetchUsers(opts)
		// 	console.log(fetchUsersDataArray);
		// 	reply = '13';
		// }
		// else if (content === '14') {
		// 	var listUsersData = yield  wechatApi.listUsers()
		// 	console.log(listUsersData)
		// 	reply = '14'

		// }
		// else if (content === '15') {
		// 	var listNewssData = yield  wechatApi.batchgetMaterialList({
		// 		type:'news',
		// 		offset:0,
		// 		count:10
		// 	})
		// 	var ourGroupId = yield wechatApi.checkGroup(message.FromUserName);
		// 	var group_id = ourGroupId.groupid;
		// 	console.log(group_id)
		// 	var newsData = JSON.stringify(listNewssData)
		// 	var newsMediaId =  listNewssData.item;
		// 	console.log(newsMediaId)
		// 	// console.log(_.isArray(newsMediaId))
		// 	var data = [];
		// 	newsMediaId.forEach(function(item){
		// 		data.push(item.media_id)
		// 	})
		// 	message =''+data[0]
		// 	console.log(message)

		// 	var sendMessage = yield  wechatApi.sendByGroup('mpnews',message,group_id)
		// 	console.log(sendMessage)
		// 	//预览接口
		// 	reply = '15'

		// }
		// else if (content === '16') {
		// 	//var delData = yield  wechatApi.deldteGroup()
		// 	/*let text = 'Dota2'
  //           var previewText = yield  wechatApi.previewInterfaces('text',text,message.FromUserName)
  //           console.log(previewText)*/

		// 	var preview = yield  wechatApi.previewInterfaces('mpnews','JM2izjOsm-3E2FhB-vOHikQq8Oui8o_OUxkLLNacK7g',message.FromUserName)
		// 	console.log(preview)
		// 	reply = 'ok'

		// }
		// else if (content === '18') {
		// 	var tempQr ={
		// 		expire_seconds:604800,
		// 		action_name:'QR_SCENE',
		// 		action_info:{
		// 			scene:{
		// 				scene_id:123
		// 			}
		// 		}
		// 	}
		// 	var permQr ={
		// 		action_name:'QR_LIMIT_SCENE',
		// 		action_info:{
		// 			scene:{
		// 				scene_id:123
		// 			}
		// 		}
		// 	}

		// 	var perStrmQr = {
		// 		action_name:'QR_LIMIT_STR_SCENE',
		// 		action_info:{
		// 			scene:{
		// 				scene_str:'123'
		// 			}
		// 		}
		// 	}

		// 	var qr1 =yield wechatApi.createQrcode(tempQr)
		// 	var qr2 =yield wechatApi.createQrcode(permQr)
		// 	var qr3 =yield wechatApi.createQrcode(perStrmQr)
		// 	reply = 'ok'
		// }
		// else if (content === '18') {
		// 	var url = 'https://www.baidu.com/';

		// 	var shortData = yield wechatApi.createShortUrl(null,url);

		// 	reply='createShortUrl is running'
		// }

		this.body = reply;
	}
	yield next
}