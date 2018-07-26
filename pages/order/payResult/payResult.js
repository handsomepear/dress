
const app = getApp()
Page({
  data: {
    price: '',
    result: 0,
    orderId: null
  },
  onLoad: function(options){
    // 根据支付之后的状态显示不同的支付结果
    var d = this.data 
    d.price = options.amount
    d.result = options.result
    d.orderId = options.orderId
    this.setData(d)
  },
  // 查看支付的订单详情
  viewOrderList: function(){
    app.globalData.mineTab = 'order'
    app.globalData.canRefreshOrder = true
    wx.switchTab({
      url: '../../mine/index/index'
    })
  },
  // 继续逛逛
  continue: function(){
    
    wx.switchTab({
      url: '../../index/index'
    })
  },
})