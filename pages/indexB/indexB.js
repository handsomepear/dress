const { productServer } = require('../../utils/api')
Page({
  data: {
    products: [],
    isRefreshStream: false
  },
  onLoad() {
    this.getStream()
  },
  onShow() {
    var videoContext = wx.createVideoContext('video-0')
    videoContext.play()
  },
  getStream() {
    var me = this
    // 获取商品信息
    var d = me.data
    productServer.getStream(
      function(res) {
        if (d.isRefreshStream) {
          d.products = res.products
        } else {
          d.products.push.apply(d.products, res.products)
        }
        me.setData(d)
      },
      function(err) {}
    )
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      isRefreshStream: true
    })
    this.getStream()
  },
  // 上拉加载
  onReachBottom() {
    this.setData({
      isRefreshStream: false
    })
    this.getStream()
  },
  onPageScroll: function(){

  },
  viewDetail(e) {
    var productId = e.currentTarget.dataset.productId
    this.setData({
      canViewDetail: false
    })
    wx.navigateTo({
      url: '../detail/detail?productId=' + productId
    })
  }
})
