const { orderServer, serviceServer } = require('../../../utils/api')
Page({
  data: {
    expressArray: [],
    expressIndex: null,
    logisticsNumber: '', // 物流单号
    applyNumber: null,
    telNo: '', // 手机号
    orderId: null,
    orderSkuId: null,
    skuList: null,
    logisticsInfo: null
  },
  onLoad: function(options) {
    if (options.logisticsInfo) {
      this.setData({
        logisticsInfo: JSON.parse(decodeURIComponent(options.logisticsInfo))
      })
    }
    console.log(options)
    this.setData({
      applyNumber: options.applyNumber, // 售后编号
      orderId: options.orderId,
      skuList: JSON.parse(decodeURIComponent(options.skuList)),
      orderSkuId: options.orderSkuId
    })
    this.getExpressCompanys()
  },
  // 修改物流 物流信息回填
  backFillLogistics: function() {
    var d = this.data
    d.logisticsNumber = d.logisticsInfo.logisticsNumber
    d.telNo = d.logisticsInfo.phone
    d.expressIndex = d.expressArray.findIndex(item => {
      return d.logisticsInfo.logisticsName == item.name
    })
    this.setData(d)
  },
  getExpressCompanys: function() {
    var d = this.data
    var me = this
    orderServer.getExpressCompanys(res => {
      d.expressArray = res.list
      me.setData(d)
      if (d.logisticsInfo) {
        me.backFillLogistics()
      }
    })
  },
  expressChange: function(e) {
    this.setData({
      expressIndex: e.detail.value
    })
  },
  scanCode: function() {
    var me = this
    var d = me.data
    wx.scanCode({
      onlyFromCamera: false, // 是否只能从相机扫码，不允许从相册选择图片,
      scanType: ['qrCode', 'barCode'],
      success: function(res) {
        console.log(res)
        d.logisticsNumber = res.result
        me.setData(d)
      }
    })
  },
  submitLogistics: function(e) {
    var warn = ''
    var d = this.data
    var flag = false
    var params = e.detail.value
    var ph = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
    var lg = /^[a-z0-9A-Z]*$/
    var oLg = {
      SF: /^[0-9]{12}$/, // 顺丰
      STO: /^[0-9]{12,13}$/, // 申通
      YD: /^[\s]*[0-9]{13}[\s]*$/, // 韵达
      YTO: /^(0|1|2|3|5|6|7|8|E|D|F|G|V|W|e|d|f|g|v|w|M)[0-9]{9,17}$/, // 圆通快递
      ZTO: /^\d{12}$/, // 中通快递
      EMS: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/, // ems
      HTKY: /^\w{12,14}$/, // 百世快递
      HHTT: /^[0-9]{12,14}$/, // 天天快递
      ZJS: /^[a-zA-Z0-9]{10}$/, // 宅急送
      RFD: /^[0-9]{13,}$/ // 如风达
    }
    if (params.LogisticsCompany == null) {
      warn = '请选择快递公司'
    } else if (params.LogisticsNo == '') {
      warn = '请填写快递单号'
    } else if (!lg.test(params.logisticsNo)) {
      warn = '请填写正确格式的快递单号'
    } else if (params.telNo == '') {
      warn = '请填写手机号'
    } else if (!ph.test(params.telNo)) {
      warn = '请填写正确的手机号'
    } else {
      flag = true
      serviceServer.addReturnInfo(
        {
          applyNumber: d.applyNumber,
          phone: params.telNo,
          companyCode: d.expressArray[params.LogisticsCompany].code,
          shipmentName: d.expressArray[params.LogisticsCompany].name,
          shipmentNumber: params.logisticsNo
        },
        res => {
          wx.navigateBack()
        }
      )
    }

    if (!flag) {
      wx.showToast({
        title: warn,
        icon: 'none',
        mask: true
      })
    }
  }
})
