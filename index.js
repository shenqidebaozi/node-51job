/*
 * @Author: Baozi 
 * @Date: 2018-01-13 23:15:41 
 * @Last Modified by: Baozi
 * @Last Modified time: 2018-02-06 22:53:07
 */
//实现http请求
var http = require('http');
// Cheerio 是一个Node.js的库， 它可以从html的片断中构建DOM结构，然后提供像jquery一样的css选择器查询
var cheerio = require('cheerio');
//编码转换库
var iconv = require('iconv-lite');
//mysql
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '970221',
    port: '3306',
    database: '51job',
});

connection.connect();

var addSql = 'INSERT INTO joblist(Id,title,address,yx,date,href) VALUES(0,?,?,?,?,?)';

for (i = 1; i <= 59; i++) {
    //51job招聘信息列表页
    var url = 'http://search.51job.com/list/010000,000000,0000,00,9,99,%25E5%2589%258D%25E7%25AB%25AF%25E5%25BC%2580%25E5%258F%2591,2,' + i + '.html';


    http.get(url, function (res) {
        var html = '';
        // 获取页面数据
        res.on('data', function (data) {
            html += iconv.decode(data, 'GBK');
        });
        // 数据获取结束
        res.on('end', function () {

            filterSlideList(html);
        });
    }).on('error', function () {
        console.log('获取数据出错！');
    });
}
console.log('采集完毕');

/* 过滤页面信息 */
function filterSlideList(html) {
    if (html) {

        var $ = cheerio.load(html);

        var slideList = $('div.dw_table');

        var slideListData = [];


        slideList.find('div.el').each(function (item) {

            var pic = $(this);

            var href = pic.find('span').children('a').attr('href');
            var title = pic.find('span.t2').children('a').attr('title');
            var dz = pic.find('span.t3').text();
            var yx = pic.find('span.t4').text();
            var rq = pic.find('span.t5').text();
            if (title == null) {
                return;
            } else {
                slideListData.push({
                    title: title,
                    address: dz,
                    yx: yx,
                    date: rq,
                    href: href,
                });
                connection.query(addSql, [title, dz, yx, rq, href], function (err, result) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        return;
                    }

                });
            }

        });


    } else {
        console.log('无数据传入！');
        //呵呵呵呵
    }
}
