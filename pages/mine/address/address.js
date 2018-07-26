//index.js
//获取应用实例
const app = getApp()
const common = require('../../components/common')
const util = require('../../../utils/util')
const { userServer } = require('../../../utils/api')
Page({
  data: {
    region: [],
    defaultAddrId: 0,
    type: 'list',
    customItem: '',
    addressList: [],
    preOrderInfo: [], // 下单页面传过来的参数
    hasAddress: true,
    isx: /iphone10|iphone x/i.test(wx.getSystemInfoSync().model),
    ...common.data
  },
  onLoad: function(options) {
    if (options.preOrderInfo) {
      this.setData({
        preOrderInfo: options.preOrderInfo
      })
    }
  },
  //事件处理函数
  onShow: function() {
    this.getAddressList()
  },
  //获取地址
  getAddressList: function(cb) {
    var me = this
    var d = me.data
    wx.showLoading()
    userServer.getAddressList(res => {
      wx.hideLoading()
      var defaultAddr = res.addressList.find(item => {
        return item.isDefault == 1
      })
      d.defaultAddrId = defaultAddr ? defaultAddr.id : null
      d.addressList = res.addressList
      if (d.addressList.length == 0) {
        d.hasAddress = false
        app.globalData.chooseAddrInfo = null
      }
      wx.setStorageSync('defaultAddr', defaultAddr)
      me.setData(d)
      cb && cb()
    })
  },

  // 默认地址更改
  addrDefaultChange: function(e) {
    var me = this
    var d = me.data
    wx.showLoading()
    userServer.setDefaultAddress(
      {
        oldId: d.defaultAddrId,
        newId: e.detail.value
      },
      res => {
        d.addressList.forEach(item => {
          if (item.id == d.defaultAddrId) {
            item.isDefault = 0
          }
          if (item.id == e.detail.value) {
            item.isDefault = 1
          }
        })
        d.defaultAddrId = e.detail.value
        me.setData(d)
        me.getAddressList(() => {
          wx.hideLoading()
          wx.showToast({
            title: '设置成功',
            icon: 'success',
            mask: true
          })
        })
        // 更新存储的默认地址
        var defaultAddr = d.addressList.find(item => {
          return item.id == d.defaultAddrId
        })
        wx.setStorageSync('defaultAddr', defaultAddr)
      }
    )
  },
  // 编辑地址
  editAddr: function(e) {
    var addrInfo = e.currentTarget.dataset.addrInfo
    wx.navigateTo({
      url: '../addAddr/addAddr?&addrInfo=' + JSON.stringify(addrInfo)
    })
  },
  // 删除地址
  removeAddr: function(e) {
    var me = this
    wx.showModal({
      title: '确认删除地址？',
      success: function(res) {
        if (res.confirm) {
          var addrId = e.currentTarget.dataset.addrId
          userServer.removeAddress(addrId, () => {
            me.getAddressList()
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              mask: true
            })
          })
        }
      }
    })
  },
  chooseAddr: function(e) {
    var me = this
    var d = me.data
    var addrInfo = e.currentTarget.dataset.addrInfo
    if (d.preOrderInfo.length) {
      app.globalData.chooseAddrInfo = addrInfo
      wx.navigateBack()
    }
  },
  loadWxAddr: function() {
    var me = this
    wx.chooseAddress({
      success: function(res) {
        userServer.addOrUpdateAddress(
          {
            id: 0,
            name: res.userName,
            tel: res.telNumber,
            addrProvince: res.provinceName,
            addrCity: res.cityName,
            addrDistrict: res.countyName,
            addrDetail: res.detailInfo
          },
          res => {
            me.getAddressList()
          }
        )
      },
      fail: function(res) {
        wx.showToast({
          title: '导入微信地址失败',
          icon: 'none',
          mask: true
        })
      }
    })
  },
  // 跳转到添加地址页面
  toAddAddr: function() {
    var d = this.data
    wx.navigateTo({
      url: '../addAddr/addAddr?preOrderInfo=' + d.preOrderInfo
    })
  },
  ...common.methods,
  ...util.methods
})
