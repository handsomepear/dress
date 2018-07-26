//index.js
//获取应用实例
const app = getApp()
const common = require('../../components/common')
const util = require('../../../utils/util')
const { orderServer, userServer } = require('../../../utils/api')
Page({
  data: {
    isShowLike: false,
    isShowLogisticsModal: false, // 是否显示物流窗口
    logisticsInfo: null, // 物流信息
    currentSkuList: [], // 查看物流的订单SKU列表
    pageRecord: '', // 分页信息
    pageSize: 5,
    isRefreshOrder: false, // 是否是刷新订单列表
    isRefreshFavorite: false, // 是否是刷新订单列表
    nextPage: '',
    hasFavorite: true,
    hasMoreFavorite: true,
    hasOrder: true,
    hasMoreOrder: true,
    isLoading: false, // 下拉刷新中？
    isShowSkuModal: false,
    isExitSkuModal: false,
    isx: /iphone10|iphone x/i.test(wx.getSystemInfoSync().model),
    coderList: [], // 订单列表
    likeList: [], // 收藏列表
    userInfo: null, // 用户信息
    currentProduct: {},
    scrollTop: 0,
    isPullLoading: false,
    ...common.data
  },
  //事件处理函数
  onLoad: function(options) {
    if (options.mineTab) {
      this.showTab(options.mineTab)
    }
    wx.startPullDownRefresh()
    // if (this.data.isShowLike) {
    //   this.getFavoritesList()
    // } else {
    //   // this.getOrderList()
    // }
  },
  showTab: function(mineTab) {
    if (mineTab == 'order') {
      this.setData({
        isShowLike: false
      })
    } else if (mineTab == 'like') {
      this.setData({
        isShowLike: true
      })
    }
  },
  onPullDownRefresh: function() {
    var me = this
    var d = me.data
    me.setData({
      isLoading: true
    })
    if (d.isShowLike) {
      d.isRefreshFavorite = true
      d.nextPage = ''
      d.isPullLoading = true
      me.setData(d)
      // 收藏
      me.getFavoritesList()
    } else {
      d.isRefreshOrder = true
      d.pageRecord = ''
      d.isPullLoading = true
      me.setData(d)
      // 订单
      me.getOrderList()
    }
  },
  onReachBottom: function() {
    this.setData({
      isRefreshFavorite: false,
      isRefreshOrder: false
    })
    if (!this.data.isShowLike) {
      if (this.data.pageRecord) {
        // 如果还有下一页数据
        this.getOrderList()
      }
    } else {
      if (this.data.nextPage) {
        this.getFavoritesList()
      }
    }
  },
  onShow: function() {
    var me = this
    var d = me.data
    this.showTab(app.globalData.mineTab)
    if (app.globalData.canRefreshOrder) {
      me.setData({
        isRefreshOrder: true,
        pageRecord: ''
      })
      app.globalData.canRefreshOrder = false
      wx.startPullDownRefresh()
    }
    this.setData({
      userInfo: wx.getStorageSync('userInfo') || app.globalData.userInfo
    })
  },
  // onPageScroll: function(e){
  //   this.setData({
  //     scrollTop: e.scrollTop
  //   })
  // },
  exec(e) {
    const me = this
    const d = me.data
    const dataset = e.currentTarget.dataset
    switch (dataset.a) {
      case '我的收藏':
        // d.likeList.length ? null : me.getFavoritesList()
        d.likeList.length ? null : wx.startPullDownRefresh()
        d.isShowLike = true
        app.globalData.mineTab = 'like'
        break
      case '我的订单':
        d.coderList.length ? null : wx.startPullDownRefresh()
        d.isShowLike = false
        app.globalData.mineTab = 'order'
        break
      default:
        break
    }
    me.setData(d)
  },
  // 取消收藏
  removeFavorite: function(e) {
    var me = this
    var d = me.data
    var favoriteId = e.currentTarget.dataset.favoriteId
    var productId = e.currentTarget.dataset.productId
    userServer.cancelFavorite(
      {
        id: favoriteId,
        productId: productId
      },
      res => {
        wx.showToast({
          title: '删除成功',
          icon: 'none',
          mask: true
        })
        d.isRefreshFavorite = true
        d.nextPage = ''
        me.setData(d)
        me.getFavoritesList()
      }
    )
  },
  showSkuModal: function(e) {
    this.setData({
      currentProduct: e.currentTarget.dataset.productInfo,
      isShowSkuModal: true,
      isExitSkuModal: true
    })
  },
  hideSkuModal: function() {
    this.setData({
      isShowSkuModal: false
    })
  },
  // 加入购物车
  addToCart: function(params) {
    var me = this
    var d = me.data
    var productSkuInfo = params.detail
    // 添加数量
    userServer.addCart(
      productSkuInfo,
      function(res) {
        userServer.cancelFavorite(
          {
            id: d.currentProduct.id,
            productId: d.currentProduct.product.id
          },
          res => {
            d.nextPage = ''
            d.likeList = []
            me.setData(d)
            wx.showToast({
              title: '添加购物车成功',
              icon: 'success',
              mask: true,
              success: function() {
                me.hideSkuModal()
                me.getFavoritesList()
              }
            })
          }
        )
      },
      function() {}
    )
  },

  // 获取订单列表
  getOrderList: function() {
    var me = this
    var d = me.data
    orderServer.orderList(
      { pageRecord: d.pageRecord, pageSize: d.pageSize },
      function(res) {
        if (d.isRefreshOrder) {
          me.setData({
            coderList: res.list
          })
        } else {
          d.coderList.push.apply(d.coderList, res.list)
          me.setData({
            coderList: d.coderList
          })
        }
        if(d.coderList.length == 0) {
          me.setData({
            hasOrder: false
          })
        }
        if(res.nextPageRecord == ''){
          me.setData({
            hasMoreOrder: false
          })
        }
        me.setData({
          isPullLoading: false,
          pageRecord: res.nextPageRecord
        })
        if (d.isLoading) {
          wx.stopPullDownRefresh()
          me.setData({
            isLoading: false
          })
        }
      },
      function(err) {
        me.setData({
          isPullLoading: false
        })
      }
    )
  },
  // 获取收藏列表
  getFavoritesList: function() {
    var me = this
    var d = me.data
    userServer.getFavoritesList(this.data.nextPage, function(res) {
      if (d.isRefreshFavorite) {
        d.likeList = res.favoriteList
      } else {
        d.likeList.push.apply(d.likeList, res.favoriteList)
      }
      d.nextPage = res.nextPageRecord
      if(res.nextPageRecord == '') {
        d.hasMoreFavorite = false
      }
      if (d.likeList.length > 0) {
        d.hasFavorite = true
      } else {
        d.hasFavorite = false
      }
      d.isPullLoading = false
      me.setData(d)
      wx.stopPullDownRefresh()
    },err => {
      d.isPullLoading = false
      me.setData(d)
    })
  },
  // 我的收藏中查看商品详情
  viewDetail: function(e) {
    var productId = e.currentTarget.dataset.productId
    wx.navigateTo({
      url: '../../detail/detail?productId=' + productId
    })
  },
  // 看订单详情
  viewOrderDetail: function(e) {
    var me = this
    var d = me.data
    var curOrder = e.currentTarget.dataset.curOrder
    var currentOrderId = curOrder.id
    wx.navigateTo({
      url: '../../order/orderDetail/orderDetail?orderId=' + currentOrderId
    })
  },
  // 查看我的地址
  viewAddress: function() {
    wx.navigateTo({
      url: '../address/address'
    })
  },
  // 再次购买
  buyAgain: function(e) {
    var curOrderInfo = e.currentTarget.dataset.curOrder
    var skuList = []
    curOrderInfo.skuList.forEach(item => {
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
        app.globalData.buyAgainList = curOrderInfo.skuList // 再次购买的商品SKU列表
        app.globalData.buyAgainShop = curOrderInfo.shop // 再次购买的商店信息
        wx.switchTab({
          url: '../../cart/cart'
        })
      },
      err => {}
    )
  },
  // 确认收货
  confirmReceive: function(e) {
    var me = this
    var d = me.data
    var orderId = e.currentTarget.dataset.orderId
    var index = e.currentTarget.dataset.index
    console.log(index)
    wx.showModal({
      title: '您收到货品了吗',
      cancelText: '未收货',
      cancelColor: '#3c3c3c',
      confirmText: '已收货',
      confirmColor: '#0665F3',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '确认收货中'
          })
          orderServer.confirmReceive(
            orderId,
            res => {
              wx.hideLoading()
              console.log(d.coderList)
                  console.log(d.coderList[index])
              wx.showToast({
                title: '已收货',
                icon: 'none',
                mask: true,
                success: function() {
                  d.pageRecord = ''
                  d.isRefreshOrder = true
                  
                  d.coderList[index].status = 3 // 试试手动将订单状态改变行不行
                  me.setData(d)
                }
              })
            },
            res => {
              if (-1 == res.bizStatus) {
                wx.showToast({
                  title: '确认收货失败，请重试',
                  icon: 'none',
                  mask: true
                })
              }
            }
          )
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
  // 查看物流
  queryLogistics: function(e) {
    var me = this
    var d = me.data
    var orderId = e.currentTarget.dataset.orderId
    var index = e.currentTarget.dataset.index
    me.setData({
      currentSkuList: d.coderList[index].skuList
    })
    wx.showLoading({
      title: '加载中'
    })
    orderServer.queryLogistics(
      orderId,
      res => {
        wx.hideLoading()
        d.logisticsInfo = res
        d.isShowLogisticsModal = true
        me.setData(d)
      },
      res => {
        wx.hideLoading()
        wx.showToast({
          title: '查看物流失败，请重试',
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
  ...common.methods,
  ...util.methods
})
