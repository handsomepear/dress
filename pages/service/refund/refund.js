const app = getApp()
const { serviceServer } = require('../../../utils/api')
const utils = require('../../../utils/util')
Page({
  data: {
    proofImgList: [], // 凭证图片
    refundReason: [],
    receivedRefundArr: [
      {
        id: 1,
        name: '未收到货（含少发/漏发/错发）'
      },
      {
        id: 2,
        name: '商品描述不符'
      },
      {
        id: 3,
        name: '质量问题'
      },
      {
        id: 4,
        name: '包装/商品破损'
      },
      {
        id: 5,
        name: '商家发货慢'
      }
    ], // 收货后仅退款
    receivedRefundSaleArr: [
      {
        id: 6,
        name: '7天无理由'
      },
      {
        id: 7,
        name: '商品描述不符'
      },
      {
        id: 8,
        name: '质量问题'
      },
      {
        id: 9,
        name: '包装/商品破损'
      },
      {
        id: 10,
        name: '商家发货慢'
      }
    ], // 收货后退款退货
    notSendRefundArr: [
      {
        id: 11,
        name: '不想买了'
      },
      {
        id: 12,
        name: '选错了/订单信息错误'
      },
      {
        id: 13,
        name: '商家发货慢'
      }
    ], // 未发货退款
    reasonIndex: null,
    serviceInfo: {},
    quantity: 1,
    chooseImgCount: 5,
    returnPrice: null
  },
  // todo 退款商品信息传递 七牛上传图片
  onLoad: function(options) {
    var d = this.data
    if (options.applyInfo) {
      var applyInfo = JSON.parse(options.applyInfo)
      var serviceType = applyInfo.serviceType // 售后类型
      if (serviceType == 0) {
        // 未收货仅退款
        d.refundReason = d.notSendRefundArr
      }
      if (serviceType == 1) {
        // 已发货仅退款
        d.refundReason = d.receivedRefundArr
      }
      if (serviceType == 2) {
        // 退货退款
        d.refundReason = d.receivedRefundSaleArr
      }
      d.serviceInfo = applyInfo
      d.reasonIndex = d.refundReason.findIndex(reason => {
        return reason.id == applyInfo.reasonId
      })
      this.setData(d)
    }
  },
  onShow: function() {
    var d = this.data
    var serviceInfo = app.globalData.serviceInfo
    if (serviceInfo) {
      var serviceType = serviceInfo.serviceType
      if (serviceType == 0) {
        // 未收货仅退款
        d.refundReason = d.notSendRefundArr
      }
      if (serviceType == 1) {
        // 已发货仅退款
        d.refundReason = d.receivedRefundArr
      }
      if (serviceType == 2) {
        // 退货退款
        d.refundReason = d.receivedRefundSaleArr
      }
      d.serviceInfo = serviceInfo
      d.quantity = d.serviceInfo.skuList[0].quantity
      this.setData(d)
      this.calculatePrice()
    }
  },
  onHide: function() {
    app.globalData.serviceInfo = null
  },
  // 上传照片凭证
  uploadsImg: function() {
    const me = this
    const d = me.data
    wx.chooseImage({
      count: 5 - d.proofImgList.length, // 最多几张照片
      sizeType: 'compressed',
      sourceType: ['album', 'camera'],
      success: function(res) {
        // 七牛上传
        res.tempFilePaths.forEach(imgItem => {
          me.fileUpload(
            imgItem,
            {
              keys: '',
              mimeType: 'image',
              suffixes: 'jpg'
            },
            function(res) {
              d.proofImgList.push(res.resUrl)
              console.log(d.proofImgList.length)
              me.setData({
                proofImgList: d.proofImgList
              })
            }
          )
        })
      }
    })
  },
  // 退款原因选择
  reasonPickerChange: function(e) {
    this.setData({
      reasonIndex: e.detail.value
    })
  },
  increaseNum: function() {
    var me = this
    var d = me.data
    if (d.quantity >= d.serviceInfo.skuList[0].quantity) {
      wx.showToast({
        title: `最多可申请${d.serviceInfo.skuList[0].quantity}件哦`,
        icon: 'none',
        mask: true
      })
    } else {
      d.quantity = me.increase(d.quantity)
    }
    me.setData(d)
    me.calculatePrice()
  },
  subtractNum: function() {
    var me = this
    var d = me.data
    if (d.quantity <= 1) {
      wx.showToast({
        title: `不能再少了哦`,
        icon: 'none',
        mask: true
      })
    } else {
      d.quantity = me.subtract(d.quantity)
    }
    me.setData(d)
    me.calculatePrice()
  },
  quantityChange: function(e) {
    var me = this
    var d = me.data
    var quantity = e.detail.value
    if (quantity > d.serviceInfo.skuList[0].quantity) {
      wx.showToast({
        title: `最多可申请${d.serviceInfo.skuList[0].quantity}件哦`,
        icon: 'none',
        mask: true,
        success: function() {
          me.setData({
            quantity: d.serviceInfo.skuList[0].quantity
          })
        }
      })
    }
    if (quantity <= 0) {
      wx.showToast({
        title: `不能再少了哦`,
        icon: 'none',
        mask: true,
        success: function() {
          me.setData({
            quantity: 1
          })
        }
      })
    }
    me.calculatePrice()
  },
  // 计算价格
  calculatePrice: function() {
    var d = this.data
    d.returnPrice = parseFloat(d.serviceInfo.skuList[0].price).mul(d.quantity)
    this.setData(d)
  },
  // 仅退款
  submitService: function(e) {
    var params = e.detail.value
    var d = this.data
    if (params.reason === null) {
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none',
        mask: true
      })
    } else {
      wx.showLoading()
      serviceServer.addApply(
        {
          applyType: d.serviceInfo.serviceType,
          detailDesc: params.problemDesc, // 问题详细描述
          orderId: d.serviceInfo.id,
          orderNo: d.serviceInfo.orderNo,
          orderSkuId: d.serviceInfo.isSingle ? d.serviceInfo.skuList[0].id : 0,
          proofUrl: d.proofImgList.join(','),
          quantity: params.quantity || 0,
          reasonId: d.refundReason[params.reason].id // 退款原因ID
        },
        function(res) {
          wx.hideLoading()
          // 提交成功
          wx.showToast({
            title: '申请成功',
            icon: 'none',
            mask: true,
            success: function() {
              // wx.navigateTo({
              //   url:
              //     '../../order/orderDetail/orderDetail?orderId=' + d.serviceInfo.id
              // })
              wx.navigateBack()
            }
          })
        }
      )
    }
  },
  ...utils.methods
})
