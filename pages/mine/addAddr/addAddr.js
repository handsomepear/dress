const { userServer } = require('../../../utils/api')
const app = getApp()
console.log
Page({
  data: {
    region: [],
    userName: '',
    telNumber: '',
    detailInfo: '',
    addrId: 0,
    preOrderInfo: null
  },
  onLoad: function(options) {
    var d = this.data
    var addrInfo = options.addrInfo
    var preOrderInfo = options.preOrderInfo
    if (preOrderInfo) {
      this.setData({
        preOrderInfo: preOrderInfo
      })
    }
    if (addrInfo) {
      addrInfo = JSON.parse(addrInfo)
      d.region = [
        addrInfo.addrProvince,
        addrInfo.addrCity,
        addrInfo.addrDistrict
      ]
      d.userName = addrInfo.name
      ;(d.telNumber = addrInfo.tel), (d.detailInfo = addrInfo.addrDetail)
      d.addrId = addrInfo.id
      this.setData(d)
    }
  },
  // 获取用户定位
  getLocation: function() {
    wx.getLocation({
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.openLocation({
          latitude,
          longitude,
          success: function(res) {
            console.log(res)
          }
        })
      }
    })
  },
  bindRegionChange: function(e) {
    var me = this
    me.setData({
      region: e.detail.value
    })
  },
  // 新增地址
  addAddress: function(e) {
    var warn = ''
    var d = this.data
    var flag = false
    var params = e.detail.value
    var ph = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
    var mb = /^(0[0-9]{2,3}\-)([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/
    if (params.userName == '') {
      warn = '请填写收货人姓名'
    } else if (params.telNumber == '') {
      warn = '请填写联系方式'
    } else if (!ph.test(params.telNumber) && !mb.test(params.telNumber)) {
      warn = '请填写正确的手机/座机号'
    } else if (params.region.length == 0) {
      warn = '请选择您的所在区域'
    } else if (params.detailInfo == '') {
      warn = '请填写具体地址'
    } else {
      flag = true
      userServer.addOrUpdateAddress(
        {
          addrCity: params.region[1],
          addrDetail: params.detailInfo,
          addrDistrict: params.region[2],
          addrProvince: params.region[0],
          id: d.addrId,
          name: params.userName,
          tel: params.telNumber
        },
        res => {
          if (d.preOrderInfo) {
            // 指定当前选择的地址信息
            app.globalData.chooseAddrInfo = res.addressInfo
            wx.navigateTo({
              url:
                '../../order/settlement/settlement?preOrderInfo=' +
                d.preOrderInfo
            })
          } else {
            var title = d.addrId ? '修改成功' : '添加成功'
            wx.showToast({
              title: title,
              icon: 'success',
              mask: true,
              success: function() {
                wx.navigateBack()
              }
            })
          }
        },
        () => {
          wx.showToast({
            title: '出错了',
            icon: 'none',
            mask: true
          })
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
  },
  loadWxAddr: function() {
    var me = this
    var d = me.data
    wx.chooseAddress({
      success: function(res) {
        d.userName = res.userName
        d.telNumber = res.telNumber
        d.detailInfo = res.detailInfo
        d.region = [res.provinceName, res.cityName, res.countyName]
        me.setData(d)
      },
      fail: function(res) {
        wx.showToast({
          title: '导入微信地址失败',
          icon: 'none',
          mask: true
        })
      }
    })
  }
})
