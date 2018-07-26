//index.js
//获取应用实例
const app = getApp()
const common = require("../../components/common")
const util = require("../../../utils/util")

Page({
  data: {
  	couponList: [
  		{
  			id: '34535',
  			title: "绣ins半袖t恤",
  			img:'/static/img/my-avatar.jpg',
  			price: "24",
        over: "1000",
        timer: '2018-08-09--2018-10-11',
        status: '1'
  		},
  		{
  			id: '34535',
  			title: "没有什么大不了",
  			img:'/static/img/my-avatar.jpg',
  			price: "234",
        over: "1000",
        timer: '2018-08-09--2018-10-11',
        status: '2'
  		},
  		{
  			id: '34535',
  			title: "也许还有明天",
  			img:'/static/img/my-avatar.jpg',
  			price: "24",
        over: "1000",
        timer: '2018-08-09--2018-10-11',
        status: '1'
  		},
  		{
  			id: '34535',
  			title: "也许还有明天",
  			img:'/static/img/my-avatar.jpg',
  			price: "100",
        over: "1000",
        timer: '2018-08-09--2018-10-11',
        status: '0'
  		},


  	],
    ...common.data
  },
  //事件处理函数
  onLoad: function () {

  },

  ...common.methods,
  ...util.methods
})
