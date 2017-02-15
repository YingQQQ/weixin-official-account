'use strict'

var Koa = require('koa');
var fs  = require('fs')


var mongoose = require('mongoose')
var dbUrl = 'mongodb://localhost/wechat';
mongoose.connect(dbUrl);

var models_path = __dirname + '/app/models';
var walk = function(path){
    fs
      .readdirSync(path)
      .forEach(function(file){
        var newPath = path + '/' + file
        var stat = fs.statSync(newPath)
        if (stat.isFile) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath)
            }
        }
        else if (stat.isDirectory()){
            walk(newPath)
        }
      })
}
walk(models_path)

var menu = require('./weixin/menu')
var wx = require('./weixin/index')
var wechatApi = wx.getWechat()

wechatApi.deleteMenu().then(function(){
	return wechatApi.createMenu(menu)
}).then(function(msg){
	console.log(msg)
})
var app = Koa();
var router = require('koa-router')();
var session = require('koa-session');
var bodyParser = require('koa-bodyparser');
var serve = require('koa-static');


var User = mongoose.model('users')
var game = require('./app/controllers/game')
var wechat = require('./app/controllers/wechat')

var views = require('koa-views');
app.use(views(__dirname+'/app/views',{
	extension:'jade'
}))

app.use(serve(__dirname + '/public'));

app.keys = ['imooc'];
app.use(session(app))
app.use(bodyParser());

app.use(function *(next){
	let user = this.session.user;
	if (user && user._id) {
		this.session.user =yield User.findOne({_id:user._id}).exec();
		// console.log('this.session.user')
		// console.log(this.session.user) No problmes
		this.state.user = this.session.user;
		yield next
	}
	else{
		this.state.user = null
		yield next;
	}
})

require('./config/routes')(router)

app
  .use(router.routes())
  .use(router.allowedMethods());




app.listen(80)

console.log('listen start 3000')

