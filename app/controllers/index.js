'use strict'

const Movie =require('../api/movie');


exports.index = function *(){
    var categories = yield Movie.findAll();
    // console.log('index categories')
    // console.log(categories) no problmes
    yield this.render('pages/index',{
        title:'imooc首页',
        categories:categories
        })
}
exports.search = function *(){
    var catId  = this.query.cat;
    var page  = parseInt(this.query.p) || 0;
    var q = this.query.q;
    var count = 2;
    var index  = page * count;
    if (catId) {
        var categories = yield Movie.searchByCategory(catId);
        var category = categories[0] || {};
        var movies = category.movies || [];
        // console.log('seach movies')
        // console.log(JSON.stringify(movies))
        var results =movies.slice(index, index + count);
        // console.log('seach results')
        // console.log(results)
        yield this.render('pages/results',{
            title:'imooc 结果页',
            keyword:category.name,
            currentPage: (page + 1),
            totalPage:Math.ceil(movies.length/count),
            query:'cat='+catId,
            movies:results
            })

    }
    else{
        var movies = yield Movie.searchByName(q);
        var results =movies.slice(index, index + count);

        yield this.render('pages/results',{
            title:'imooc 结果页',
            keyword:q,
            currentPage: (page + 1),
            totalPage:Math.ceil(movies.length/count),
            query:'q='+q,
            movies:results
            })
    }
}