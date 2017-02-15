'use strict'

var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var Movie = require('../app/controllers/movie')
var Comment = require('../app/controllers/comment')
var Category = require('../app/controllers/category')
var Game = require('../app/controllers/game')
var Wechat = require('../app/controllers/wechat')

// var multer  = require('multer')
// var upload = multer({ dest: 'public/uploads/'});
// var type = upload.single('uploadPoster');

module.exports = function (router) {
//wechat
router.get('/wechat/movie', Game.guess);
router.get('/wechat/movie/:id', Game.find);
router.get('/wechat/jump/:id', Game.jump);
router.get('/wx', Wechat.hear);
router.post('/wx', Wechat.hear);

//index page
router.get('/',Index.index)

//userlist pages
router.post('/user/signup',User.signup)
router.post('/user/signin',User.signin)
router.get('/signin',User.ShowSignin)
router.get('/signup',User.ShowSignup)
router.get('/logout',User.logout)
router.get('/admin/user/list', User.signinRequired,User.adminRequired, User.list)

//movie pages
router.get('/movie/:id', Movie.detail)
router.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new)
router.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired,Movie.update)
router.post('/admin/movie',User.signinRequired, User.adminRequired,Movie.save)
router.get('/admin/movie/list',  User.signinRequired, User.adminRequired, Movie.list)
router.delete('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.del)

// //Comment
router.post('/user/comment', User.signinRequired, Comment.save)

// //category
// router.get('/admin/category/new',User.signinRequired,User.adminRequired, Category.new)
// router.post('/admin/category', User.signinRequired, User.adminRequired, Category.save)
// router.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)

// //
// router.get('/results', Index.search)

}