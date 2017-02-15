'use strict'

const mongoose=require('mongoose');
const Movie=mongoose.model('movies')
const Comment=mongoose.model('comments')
const Category=mongoose.model('categories')

const User=require('../models/user');
const _ = require('lodash');
var fs = require('fs');


// admin updata movie
exports.detail = function *(next){
    let id =this.params.id;
    //console.log(id)
    let movie =yield Movie.findOne({_id:id}).exec();
        //console.log(movie)
    let comments = yield Comment
                .find({movie:id})
                .populate('from','name')
                .populate('reply.from reply.to','name')
                .exec();
    yield this.render('pages/detail',{
            title:'imooc 详情页',
            movie:movie,
            comments:comments
          })

}
exports.new =  function *(next) {
    //express framework callback res's method render view tpl
    let categories = yield Category.find({}).exec();

    yield this.render('pages/admin', {
        title: 'imooc 后台录入页',
        categories: categories,
        movie: {}
    })
}
// update movie
exports.update = function *(next){
    let id = this.params.id;
    //console.log(id)
    if(id){
        let movie = yield Movie.findOne({_id:id}).exec();
        let categories = yield Category.find({}).exec();

        yield this.render('pages/admin',{
            title:"imooc 后台更新页",
            movie:movie,
            categories:categories
        })
    }
}
// // update movie
// exports.savePoster = function *(next){
//     var file =this.file
//     if (this.file) {
//         console.log('savePoster')
//         var originalname = this.file.originalname;
//         console.log(originalname)
//         var posterData = this.file.fieldname;
//         var filePath = this.file.path;
//         var mimetype = this.file.mimetype;
//         var type = mimetype.split('/')[1];
//         var timestamp = Date.now();
//         var poster = timestamp + '.' + type;
//         var target_path = 'public/uploads/' + poster;

//         console.log('savePoster poster :' + poster)
//         var src = fs.createReadStream(filePath);
//         var dest = fs.createWriteStream(target_path);
//         src.pipe(dest);
//         src.on('end', function() {
//             this.poster = poster;
//             next()
//             console.log('savePoster save end')
//         });
//         src.on('error', function(err) { console.log('savePoster save err'+err); });
//     }
//     else{
//         next();
//     }
// }
// admin post movie
exports.save = function *(next){

    var id = this.request.body.movie._id;
    var movieObj = this.request.body.movie;
    var _movie
    console.log('save')
    if (this.poster) {
        movieObj.poster = this.poster;
    }
    console.log(movieObj)
    if(id){
        console.log("admin post movie id"+ id);

        let movie = yield Movie.findOne({_id:id}).exec();
        _movie = _.extend(movie,movieObj);

        yield _movie.save()

        this.redirect('/movie/' + movie._id);
    }
    else{
        console.log('id is undefined')
        _movie = new Movie(movieObj)
        let categoryid = movieObj.category;
        let categoryName = movieObj.categoryName;

        // console.log('categoryid :'+categoryid)
        let movie = yield _movie.save().exec();

        if (categoryid) {
            let category = yield Category.findOne({_id:categoryid}).exec();
            category.movies.push(movie._id)

            yield category.save()

            this.redirect('/movie/' + movie._id)

        }
        else if (categoryName) {
            var category = new Category({
                name : categoryName,
                movies :[movie._id]
            })
            let categories = yield category.save().exec();
            movie.category = categories._id;

            yield movie.save();

            this.redirect('/movie/' + movie._id)
        }

    }
}
//list page
exports.list = function *(next) {
    let movies =yield Movie.find({}).exec();

    yield this.render('pages/list', {
        title: 'imooc 列表页',
        movies: movies
    })

}
//del page
exports.del = function *(next){
    let id = this.query.id
    //console.log(id)
    if(id){
        try{
            yield Movie.remove({_id:id}).exec();
            this.body = {success:1};
        }
        catch(err){
            this.body = {success:0};
        }
    }
}


