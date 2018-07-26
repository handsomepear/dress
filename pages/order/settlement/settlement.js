const app = getApp()
const { orderServer } = require('../../../utils/api')
const {userServer} = require('../../../utils/api')
Page({
  data: {
    money: null,
    address: {},
    preOrderInfo: {} // 订单提交信息
  },
  onLoad: function(options) {
    var d = this.data
    d.preOrderInfo = JSON.parse(decodeURIComponent(options.preOrderInfo))
    this.setData(d)
  },
  onShow: function() {
    var d = this.data
    var chooseAddrInfo = app.globalData.chooseAddrInfo
    if (chooseAddrInfo) {
      d.address = chooseAddrInfo
      app.globalData.chooseAddrInfo = null
    } else {
      d.address = wx.getStorageSync('defaultAddr')
    }
    this.setData(d)
  },
  onHide: function(){
    app.globalData.chooseAddrInfo = null
  },
  // 微信支付
  wePay: function() {
    var me = this
    var d = me.data
    var address = d.address
    if (!address) {
      wx.showModal({
        title: '您还未设置收货地址哦！',
        cancelText: '取消',
        confirmText: '去设置',
        confirmColor: '#0665F3',
        success: function(res) {
          if (res.confirm) {
            // 设置地址
            me.setAddress()
          }
        },
        fail: function() {
          wx.showToast({
            title: '操作失败，请重试',
            icon: 'none',
            mask: true
          })
        }
      })
    } else {
      var addrId = address.id
      wx.showLoading({
        title: '加载中'
      })
      orderServer.commitOrder(addrId, function(res) {
        wx.hideLoading()
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: 'prepay_id=' + res.prepayId,
          signType: 'MD5',
          paySign: res.paySign,
          success: function() {
            var productSkuIds = [] // 获取到订单skuId列表， 用来删除购物车对应的商品
            d.preOrderInfo.orderList.forEach(shopItem => {
              shopItem.skuList.forEach(skuItem => {
                productSkuIds.push(skuItem.skuId)
              })
            })
            userServer.removeCart(productSkuIds)
            // 用户支付成功
            wx.navigateTo({
              url: '../payResult/payResult?amount=' + d.preOrderInfo.feeInfo.amount + '&result=0&orderId=' + res.orderId
            })
          },
          fail: function() {
            wx.showToast({
              title: '您取消了支付',
              icon: 'none',
              mask: true
            })
          } // 用户取消支付
        })
      }, err => {
        // 有商品无货
        wx.showToast({
          title: err.bizMessage,
          icon: 'none',
          mask: true
        })
      })
      // 调支付API
    }
  },
  // 设置地址
  setAddress: function() {
    var d = this.data
    wx.navigateTo({
      url: '../../mine/address/address?preOrderInfo=' + encodeURIComponent(JSON.stringify(d.preOrderInfo))
    })
  }
})
