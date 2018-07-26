//index.js
//获取应用实例
const app = getApp()
const common = require('../components/common')
const util = require('../../utils/util')
const { productServer, userServer, orderServer } = require('../../utils/api')

Page({
  data: {
    isSoldOut: false,
    isShowInfoModal: false,
    isShowServiceModal: false,
    isShowSkuModal: false,
    product: null,
    type: '',
    isExitSkuModal: false,
    ...common.data
  },
  //事件处理函数
  onLoad: function(options) {
    var productId = options.productId
    var d = this.data
    var me = this
    // 获取商品详情
    wx.showLoading()
    productServer.getProductDetail(
      productId,
      function(res) {
        d.product = res.product
        d.detailInfo = util.methods.resolution(res.product.content)
        // 判断是否卖完了
        d.isSoldOut = d.product.skus.every(skuItem => {
          return skuItem.inventory <= 0
        })
        me.setData(d)
        wx.hideLoading()
      },
      function() {}
    )
  },
  hideInfoModal: function(e) {
    var me = this
    var curDom = e.currentTarget.dataset.dom
    if (curDom == 'btn' || curDom == 'wrap') {
      me.setData({
        isShowInfoModal: false
      })
    }
  },
  showInfoModal: function() {
    this.setData({
      isShowInfoModal: true
    })
  },
  hideServiceModal: function(e) {
    var me = this
    var curDom = e.currentTarget.dataset.dom
    if (curDom == 'btn' || curDom == 'wrap') {
      me.setData({
        isShowServiceModal: false
      })
    }
  },
  showServiceModal: function() {
    this.setData({
      isShowServiceModal: true
    })
  },
  stopPropagation() {},
  // 查看购物车
  viewCart: function() {
    wx.switchTab({
      url: '../cart/cart'
    })
  },
  // 加入购物车/立即购买
  showSkuModal: function(e) {
    var d = this.data
    var type = e.currentTarget.dataset.type
    d.isExitSkuModal = true
    d.isShowSkuModal = true
    d.type = type
    this.setData(d)
  },
  // 加入购物车
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
  hideSkuModal: function() {
    var d = this.data
    d.isShowSkuModal = false
    this.setData(d)
  },
  // 立即购买
  buyNow: function(params) {
    var skuInfo = params.detail // 选择的SKU信息
    this.hideSkuModal()
    orderServer.preOrder(
      [skuInfo],
      function(res) {
        wx.navigateTo({
          url: '../order/settlement/settlement?preOrderInfo=' + encodeURIComponent(JSON.stringify(res.preOrderInfo))
        })
      },
      function(err) {
        wx.showToast({
          title: err.bizMessage,
          icon: 'none',
          mask: true
        })
      }
    )
    // wx.navigateTo({
    //   url: '../order/settlement/settlement?'
    // })
  },
  ...common.methods,
  ...util.methods
})
