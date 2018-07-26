//index.js
//获取应用实例
const app = getApp()
const common = require("../../components/common")
const util = require("../../../utils/util")

Page({
  data: {
  	likeList: [
  		{
  			id: '34535',
  			title: "绣ins半袖t恤",
  			img:'/static/img/my-avatar.jpg',
  			price: "234.00"
  		},
  		{
  			id: '34535',
  			title: "没有什么大不了",
  			img:'/static/img/my-avatar.jpg',
  			price: "234.00"
  		},
  		{
  			id: '34535',
  			title: "也许还有明天",
  			img:'/static/img/my-avatar.jpg',
  			price: "234.00"
  		},
  		{
  			id: '34535',
  			title: "也许还有明天",
  			img:'/static/img/my-avatar.jpg',
  			price: "234.00"
  		},
  		{
  			id: '34535',
  			title: "也许还有明天",
  			img:'/static/img/my-avatar.jpg',
  			price: "234.00"
  		},
  		{
  			id: '34535',
  			title: "也许还有明天",
  			img:'/static/img/my-avatar.jpg',
  			price: "234.00"
  		}

  	],
    ...common.data
  },
  //事件处理函数
  onLoad: function () {

  },

  ...common.methods,
  ...util.methods
})
