const { orderServer, userServer } = require('../../../utils/api')
const app = getApp()
Page({
  data: {
    isShowRefundModal: false,
    isShowLogisticsModal: false,
    logisticsInfo: null,
    orderId: null,
    orderDetail: {}, // 订单详情
    serviceInfo: null
  },
  onLoad: function(options) {
    var d = this.data
    d.orderId = options.orderId
    this.setData(d)
  },
  onShow: function() {
    this.getOrderDetail()
  },
  // 获取订单详情
  getOrderDetail: function() {
    wx.showLoading()
    var me = this
    var d = me.data
    orderServer.orderDetail(
      d.orderId,
      function(res) {
        wx.hideLoading()
        d.orderDetail = res.detail
        me.setData(d)
      },
      function() {
        wx.hideLoading()
      }
    )
  },
  // 查看物流
  viewLogistics: function() {
    var me = this
    var d = me.data
    wx.showLoading({
      title: '加载中'
    })
    orderServer.queryLogistics(
      d.orderId,
      res => {
        wx.hideLoading()
        d.logisticsInfo = res
        d.isShowLogisticsModal = true
        me.setData(d)
      },
      err => {
        wx.hideLoading()
        wx.showToast({
          title: err.bizMessage,
          icon: 'none',
          mask: true
        })
      }
    )
  },
  hideLogisticsModal: function() {
    this.setData({
      isShowLogisticsModal: false
    })
  },
  // 确认收货弹窗
  showReceiptModal: function() {
    var me = this
    wx.showModal({
      title: '您收到货品了吗',
      cancelText: '未收货',
      cancelColor: '#3c3c3c',
      confirmText: '已收货',
      confirmColor: '#0665F3',
      success: function(res) {
        if (res.confirm) {
          me.confirmReceive()
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
  },
  // 确认收货
  confirmReceive: function() {
    var d = this.data
    var me = this
    wx.showLoading({
      title: '确认收货中'
    })
    orderServer.confirmReceive(d.orderId, res => {
      wx.hideLoading()
      wx.showToast({
        title: '已收货',
        icon: 'none',
        mask: true,
        success: function() {
          me.getOrderDetail()
        }
      })
    })
  },
  // 单个商品申请售后
  applyServiceSingle: function(e) {
    this.showRefundModal()
    var dataset = e.currentTarget.dataset
    var serviceInfo = {}
    serviceInfo.skuList = [dataset.skuInfo]
    serviceInfo.id = dataset.orderId
    serviceInfo.orderNo = dataset.orderNo
    serviceInfo.isSingle = true // 单商品售后
    this.setData({
      serviceInfo: serviceInfo
    })
  },
  // 售后弹窗
  applyService: function(e) {
    this.hideRefundModal()
    var d = this.data
    var type = e.currentTarget.dataset.type // 售后类型
    var status = d.orderDetail.status
    var serviceType
    if (status == 1 && type == 1) {
      serviceType = 0
    } // 未发货 仅退款
    else {
      serviceType = type
    }
    app.globalData.serviceInfo = d.serviceInfo ? d.serviceInfo : d.orderDetail // 进入售后页面的商品信息
    app.globalData.serviceInfo.serviceType = serviceType // 售后类型
    wx.navigateTo({
      url: '../../service/refund/refund'
    })
  },
  // 整单退款的售后详情
  viewAllService: function(e) {
    wx.navigateTo({
      url:
        '../../service/refundDetail/refundDetail?orderSkuId=0&orderId=' +
        this.data.orderId
    })
  },
  // 查看单个商品售后详情
  viewSingleService: function(e) {
    var currentSkuId = e.currentTarget.dataset.skuId
    wx.navigateTo({
      url:
        '../../service/refundDetail/refundDetail?orderSkuId=' +
        currentSkuId +
        '&orderId=' +
        this.data.orderId
    })
  },
  // 再次购买
  buyAgain: function() {
    // userServer.addCart({})
    // 由于 switchTab 不支持 queryString 那么就将信息保存到全局变量中
    var d = this.data
    var skuList = []
    d.orderDetail.skuList.forEach(item => {
      skuList.push({
        productSkuId: item.skuId,
        quantity: item.quantity
      })
    })
    // 再次购买 添加到购物车
    userServer.batchAddCart(
      skuList,
      res => {
        if (res.productSku) {
          wx.showToast({
            title: '非常抱歉，您选购的商品没货了',
            icon: 'none',
            mask: true
          })
          return
        }
        app.globalData.buyAgainList = d.orderDetail.skuList // 再次购买的商品SKU列表
        app.globalData.buyAgainShop = d.orderDetail.shop // 再次购买的商店信息
        wx.switchTab({
          url: '../../cart/cart'
        })
      },
      err => {}
    )
  },
  // 控制售后弹窗
  hideRefundModal: function() {
    this.setData({
      isShowRefundModal: false
    })
  },
  showRefundModal: function() {
    this.setData({
      isShowRefundModal: true
    })
  },
  stopPropagation: function() {}
})
