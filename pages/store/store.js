const { productServer } = require('../../utils/api')
Page({
  data: {
    page: 1,
    pageSize: 10,
    storeList: [],
    shopId: null,
    shopTitle: '',
    isPullLoading: false,
    isx: /iphone10|iphone x/i.test(wx.getSystemInfoSync().model),
    isNewProductList: true // 是否是新添加的商品列表
  },
  onLoad: function(options) {
    this.setData({
      shopId: parseInt(options.shopId),
      shopTitle: options.shopTitle
    })
    this.getProductListInShop()
  },
  // 获取商店商品列表
  getProductListInShop: function() {
    var me = this
    var d = me.data
    productServer.getProductListInShop(
      {
        page: d.page,
        pageSize: d.pageSize,
        shopId: d.shopId
      },
      function(res) {
        if (d.isNewProductList) {
          d.storeList.push.apply(d.storeList, res.products)
        } else {
          d.storeList = res.products
        }
        wx.stopPullDownRefresh() // 停止下拉刷新
        d.isPullLoading = false
        me.setData(d)
      }
    )
  },
  viewDetail: function(e) {
    var productId = e.currentTarget.dataset.productId
    wx.navigateTo({
      url: '../detail/detail?productId=' + productId
    })
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      isNewProductList: false,
      isPullLoading: true,
      page: 1
    })
    this.getProductListInShop()
  },
  // 上拉加载
  onReachBottom: function() {
    this.setData({
      isNewProductList: true,
      page: ++this.data.page
    })
    this.getProductListInShop()
  }
})
