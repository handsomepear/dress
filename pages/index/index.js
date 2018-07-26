//index.js
//获取应用实例
const app = getApp()
const common = require('../components/common')
const util = require('../../utils/util')
const { productServer, userServer } = require('../../utils/api')

Page({
  data: {
    products: [],
    currentIndex: 0,
    isExitSkuModal: false,
    isShowSkuModal: false,
    videoContext: null,
    canViewDetail: true,
    canNextBtn: true,
    ...common.data
  },
  //事件处理函数
  onLoad: function(options) {
    if (options.its) {
      this.getStream(options.its)
    } else {
      this.getStream()
    }
  },
  onShow: function() {
    console.log('onShow')
    var videoContext = wx.createVideoContext('video-context', this)
    this.setData({
      videoContext
    })
    this.data.videoContext.play() // 播放视频
  },
  onHide: function() {
    this.data.videoContext.pause() // 暂停视频
    this.setData({
      canViewDetail: true
    })
  },
  onUnload: function() {
    this.data.videoContext.pause() // 暂停视频
    this.setData({
      canViewDetail: true
    })
  },
  error: function(e) {
    console.log(e)
  },
  getStream: function(its) {
    var me = this
    // 获取商品信息
    var d = me.data
    productServer.getStream(
      its,
      function(res) {
        d.canNextBtn = true
        d.products.push.apply(d.products, res.products)
        me.setData(d)
      },
      function(err) {}
    )
  },
  error: function(e) {
    console.log(e)
  },
  goStorePage: function(e) {
    var shopId = e.currentTarget.dataset.shopId
    var shopTitle = e.currentTarget.dataset.shopTitle
    wx.navigateTo({
      url: '../store/store?shopId=' + shopId + '&shopTitle=' + shopTitle
    })
  },
  onGotUserInfo: function(e) {
    if (!wx.getStorageSync('userInfo')) {
      var userInfo = e.detail.userInfo
      app.globalData.userInfo = userInfo
      // 提交用户信息
      wx.setStorageSync('userInfo', e.detail.userInfo)
      userServer.commitUserInfo(
        {
          avatar: userInfo.avatarUrl,
          gender: userInfo.gender,
          nickName: userInfo.nickName,
          source: 1
        },
        function(res) {
          console.log(res)
        },
        function() {}
      )
    }
    var productId = e.currentTarget.dataset.productId

    if (this.data.canViewDetail) {
      this.setData({
        canViewDetail: false
      })
      wx.navigateTo({
        url: '../detail/detail?productId=' + productId
      })
    }
  },
  next: function() {
    var d = this.data
    if (d.canNextBtn) {
      if (d.currentIndex < d.products.length - 1) {
        d.currentIndex++
        this.setData(d)
        if (d.currentIndex == d.products.length - 2) {
          d.canNextBtn = false
          this.setData(d)
          this.getStream()
        }
      } else {
        wx.showToast({
          title: '没有更多了',
          icon: 'none',
          mask: true
        })
      }
    } else {
      // wx.showToast({
      //   title: '您点太快了',
      //   icon: 'none'
      // })
    }
  },
  showSkuModal: function() {
    this.setData({
      isShowSkuModal: true
    })
  },
  hideSkuModal: function() {
    this.setData({
      isShowSkuModal: false
    })
  },
  checkVersion: function(){
    var SDKVersion = wx.getSystemInfoSync().SDKVersion
    var versionNum = parseFloat(SDKVersion.split('.').join(''))
    if(versionNum < 210) {
      wx.showModal({
        title: '提示',
        content: '微信版本过低无法分享，快去升级微信吧！',
        showCancel: false
      })
    }
  },
  // 分享
  onShareAppMessage: function(res) {
    var d = this.data
    var shareObj = {}
    if (res.from == 'button') {
      // 单个商品分享
      shareObj = {
        title: d.products[d.currentIndex].title, // 商品描述
        imageUrl: d.products[d.currentIndex].shareImg,
        path: '/pages/index/index?its=' + d.products[d.currentIndex].id
      }
    }
    if (res.from == 'menu') {
      // 整个小程序分享（右上角三个点）
      shareObj = {
        title: '每天推荐100件流行新款女装~',
        imageUrl: '/static/img/shareImg.jpg',
        path: '/pages/index/index'
      }
    }
    return shareObj
  },
  // 收藏
  collect: function(e) {
    var me = this
    var d = me.data
    if(app.globalData.isAuthAllow) {
      if (d.products[d.currentIndex].favorite) {
        wx.showToast({
          title: '您已收藏过该商品',
          icon: 'none'
        })
      } else {
        var productId = e.currentTarget.dataset.productId
        userServer.addFavorite(productId, res => {
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            mask: true
          })
          d.products[d.currentIndex].favorite = true
        })
      }
    }else {
      d.isShowAuthModal = true
    }
    me.setData(d)
    
  },
  addToCart: function(params) {
    var me = this
    wx.showLoading()
    userServer.addCart(
      params.detail,
      function(res) {
        wx.hideLoading()
        wx.showToast({
          title: '加入购物车成功',
          icon: 'success',
          mask: true,
          success: function() {
            me.hideSkuModal()
          }
        })
      },
      function() {}
    )
  },
  ...common.methods,
  ...util.methods
})
