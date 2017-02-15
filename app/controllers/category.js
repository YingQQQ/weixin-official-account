'use strict'

const mongoose=require('mongoose');
const _ = require('lodash');
const Category=mongoose.model('categories')

exports.new =  function *(next) {
    //express framework callback res's method render view tpl
    yield this.render('pages/category_admin', {
            title: 'imooc 分类录入页',
            category: {
                name:''
            }
         })
}

// admin post movie
exports.save = function *(next){
    let _category = this.request.body.category;
    let category = new Category(_category)

    yield category.save()

    this.redirect('/admin/category/list');

}
exports.list = function *(next) {
    //schema movie's method
    //查询该数据库下所有记录
    let categories = yield Category.find({}).exec();

    yield this.render('pages/categorylist', {
        title: 'imooc 分类列表页',
        categories: categories
    })

}


