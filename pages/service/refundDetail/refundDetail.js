const { serviceServer, orderServer } = require('../../../utils/api')
const app = getApp()
Page({
  data: {
    returnApplyInfo: {},
    proofUrlList: [],
    returnLogList: [],
    isShowLogisticsModal: false,
    logisticsInfo: null,
    orderId: null,
    orderSkuId: null
  },
  onLoad: function(options) {
    this.setData({
      orderId: options.orderId,
      orderSkuId: options.orderSkuId
    })
  },
  onShow: function(){
    var d = this.data
    this.getReturnApplyInfo({
      orderId: d.orderId,
      orderSkuId: d.orderSkuId
    })
  },
  // 获取退款详情
  getReturnApplyInfo: function(params) {
    wx.showLoading()
    var me = this
    var d = me.data
    serviceServer.getReturnApplyInfo(
      {
        orderId: params.orderId,
        orderSkuId: params.orderSkuId
      },
      res => {
        wx.hideLoading()
        d.returnApplyInfo = res.returnApplyInfo
        d.returnLogList = res.returnApplyInfo.returnLogList.reverse()
        d.proofUrlList = res.returnApplyInfo.proofUrl.split(',')
        me.setData(d)
      },
      err => {
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
      d.returnApplyInfo.orderId,
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
  // 修改物流
  changeLogistics: function() {
    wx.navigateTo({
      url:
        '../express/express?applyNumber=' +
        this.data.returnApplyInfo.applyNumber +
        '&orderId=' +
        this.data.orderId +
        '&orderSkuId=' +
        this.data.orderSkuId +
        '&skuList=' + 
        this.data.returnApplyInfo.orderSkuList + 
        '&logisticsInfo=' +
        encodeURIComponent(JSON.stringify(this.data.returnApplyInfo))
    })
  },
  hideLogisticsModal: function() {
    this.setData({
      isShowLogisticsModal: false
    })
  },
  // 填写订单单号
  fillNumber: function() {
    wx.navigateTo({
      url:
        '../express/express?applyNumber=' +
        this.data.returnApplyInfo.applyNumber +
        '&orderId=' +
        this.data.orderId +
        '&orderSkuId=' +
        this.data.orderSkuId + 
        '&skuList=' + 
        encodeURIComponent(JSON.stringify(this.data.returnApplyInfo.orderSkuList))
    })
  },
  // 申请退款
  applyRefund: function() {
    console.log(app.globalData)
    var me = this
    var d = me.data
    var applyInfo = {
      skuList: d.returnApplyInfo.orderSkuList,
      price: d.returnApplyInfo.totalAmount,
      id: d.returnApplyInfo.orderId,
      orderNo: d.returnApplyInfo.orderNo,
      serviceType: d.returnApplyInfo.applyType, // 售后类型
      reasonDesc: d.returnApplyInfo.reasonDesc, // 理由描述
      reasonId: d.returnApplyInfo.reasonId, // 退款理由id
      detailDesc: d.returnApplyInfo.detailDesc, // 详情描述
      proofUrl: d.returnApplyInfo.proofUrl // 凭证图片
    }
    wx.navigateTo({
      url: '../refund/refund?applyInfo=' + JSON.stringify(applyInfo)
    })
  }
})
