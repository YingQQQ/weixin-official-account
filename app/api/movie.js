const mongoose = require('mongoose');
const Category=mongoose.model('categories');//引入模型
const Movie=mongoose.model('movies');//引入模型
const koa_request = require('koa-request')
const co = require('co')
const Promise=require('bluebird');
const request=Promise.promisify(require('request'));
const _ = require('lodash');

function updateMovies(movie){
    var options={
        url :'https://api.douban.com/v2/movie/subject/'+movie.doubanId,
        json:true
    }
    request(options).then(function(response){
        var data = response.body;
        // console.log('updateMovie data')
        // console.log(data)
        _.extend(movie,{
            country:data.countries[0],
            language:data.language,
            summary:data.summary
        })
        var genres = movie.genres
        // console.log('genres')
        // console.log(genres)
        if (genres && genres.length >0) {
            var cateArray=[];

            genres.forEach(function(genre){
                // console.log('genre')
                // console.log(genre)
                cateArray.push(function *(){
                    var cat = yield Category
                                .findOne({name:genre})
                                .exec();
                    if (cat) {
                        console.log('has cat')
                        cat.movies.push(movie._id);
                        yield cat.save()
                    }
                    else{
                        console.log('no cat')
                        cat = new Category({
                            name:genre,
                            movies:[movie._id]
                        })
                        cat = yield cat.save()
                        // console.log('cat')
                        // console.log(cat)
                        movie.category = cat._id
                        yield movie.save()
                    }
                })
            })
            co(function *(){
                yield cateArray
            })
            // console.log(cateArray)
        }
        else{
            movie.save()
        }
    })
}
exports.findAll = function *(){

    var categories = yield Category
        .find({})
        .populate({path : 'movies',select:'title poster',options:{limit :6}})
        .exec();
    return categories;
}

exports.searchByCategory = function *(catId){
   var categories = yield Category
       .find({_id: catId})
       .populate({path : 'movies',select:'title poster',options:{limit :6}})
       .exec();
   return categories;
}

exports.searchByName = function *(q){

    var movies=yield Movie
        .find({title : new RegExp(q +'.*','i')})
        .exec()
    return movies;
}
exports.searchById = function *(id){

    var movie=yield Movie
        .findOne({_id:id})
        .exec()
    return movie;
}
exports.searchByDouBan = function *(q){
    var options={
        url :'https://api.douban.com/v2/movie/search?q='
    }
    options.url += encodeURIComponent(q);
    var res = yield koa_request(options);
    var data = JSON.parse(res.body)
    // console.log('data from douban')
    // console.log(data)
    var subjects = [];
    var movies = [];

    if (data && data.subjects ) {
        subjects =data.subjects;
    }
    // console.log('subjects')
    // console.log(subjects)
    if (subjects.length > 0) {
        var queryArray = [];
        subjects.forEach(function (item){
            queryArray.push(function *(){
                var movie = yield Movie.findOne({doubanId : item.id})
                if (movie) {
                    movies.push(movie)
                }
                else{
                    var directors = item.directors || {};
                    var director = directors[0] || {}
                    movie = new Movie({
                        director:director.name ||'',
                        title:item.title,
                        poster:item.images.large,
                        doubanId:item.id,
                        year:item.year,
                        genres:item.genres||[]
                    })
                    movie = yield movie.save();
                    movies.push(movie);

                }
            })
        })
        yield queryArray
        // console.log('movies')
        // console.log(movies.length)
        movies.forEach(function (movie){
            updateMovies(movie)
        })
    }
    return movies
}
