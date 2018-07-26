var app = getApp()
var util = require('./util')
const base_url = 'https://kryptontest.j.cn/api' // 测试环境
// const base_url = 'https://krypton-api.j.cn/api' // 线上环境

// 公共参数
const clientEnv = {
  app: 'weapp',
  jcnuserid: wx.getStorageSync('openId'),
  v: '1.1.1'
}




var fetch = function(params) {
  // 查询openId
  const openId = wx.getStorageSync('openId')
  if (openId) {
    clientEnv.jcnuserid = openId
    wx.request({
      url: params.url,
      method: params.method || 'POST',
      data: {
        clientEnv: clientEnv,
        ...params.data
      },
      dataType: params.dataType || 'json',
      success: function(res) {
        if (res.statusCode == 200) {
          if (res.data.bizStatus == 0) {
            typeof params.success == 'function' && params.success(res.data)
          } else if (res.data.bizStatus < 0) {
            if (res.data.bizMessage) {
              wx.showToast({
                title: res.data.bizMessage,
                icon: 'none',
                mask: true
              })
            } else {
              wx.showToast({
                title: '系统错误',
                icon: 'none',
                mask: true
              })
            }
          } else {
            // 失败
            typeof params.fail == 'function' && params.fail(res.data)
          }
        } else if (res.statusCode == 500) {
          wx.showToast({
            title: '服务器错误，请稍后重试',
            icon: 'none',
            mask: true,
            duration: 2000
          })
          params.fail && params.fail()
        }
      },
      // 请求超时
      fail: function(err) {
        wx.showToast({
          title: '请求超时',
          icon: 'none',
          mask: true
        })
      }
    })
  } else {
    util.methods
      .getOpenId()
      .then(openId => {
        clientEnv.jcnuserid = openId
        wx.request({
          url: params.url,
          method: params.method || 'POST',
          data: {
            clientEnv: clientEnv,
            ...params.data
          },
          dataType: params.dataType || 'json',
          success: function(res) {
            if (res.data.bizStatus == 0) {
              typeof params.success == 'function' && params.success(res.data)
            } else if (-1 == res.data.bizStatus) {
              // 数量限制
              // methods.getOpenId()
            } else {
              // 失败
              typeof params.fail == 'function' && params.fail(res.data)
            }
          },
          fail: function(err) {
            typeof params.fail == 'function' && params.fail(err)
          }
        })
      })
      .catch(err => {
        wx.showModal({
          title: '获取openId失败，请重试',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }
          }
        })
      })
  }
}

var getServerUrl = function(path) {
  return base_url + path
}

// 商品接口
const productServer = {
  // 获取首页商品列表
  getStream: function(its, resolve, reject) {
    fetch({
      url: getServerUrl('/product/getStream'),
      data: its ? {its: [its]} : {},
      success: resolve,
      fail: reject
    })
  },
  // 获取店铺商品列表
  getProductListInShop: function(params, resolve, reject) {
    fetch({
      url: getServerUrl('/product/getProductListInShop'),
      data: {
        page: params.page,
        pageSize: params.pageSize,
        shopId: params.shopId
      },
      success: resolve,
      fail: reject
    })
  },
  // 获取商品信息
  getProductDetail: function(productId, resolve, reject) {
    fetch({
      url: getServerUrl('/product/getProductDetail'),
      data: { productId: productId },
      success: resolve,
      fail: reject
    })
  }
}

// 订单接口
const orderServer = {
  // 提交当前订单
  commitOrder: function(addrId, resolve, reject) {
    fetch({
      url: getServerUrl('/order/commitOrder'),
      data: { addrId: addrId },
      success: resolve,
      fail: reject
    })
  },
  // 获取订单详情
  orderDetail: function(orderId, resolve, reject) {
    fetch({
      url: getServerUrl('/order/orderDetail'),
      data: { orderId: orderId },
      success: resolve,
      fail: reject
    })
  },
  // 获取订单列表
  orderList: function(params, resolve, reject) {
    fetch({
      url: getServerUrl('/order/orderList'),
      data: { pageRecord: params.pageRecord, pageSize: params.pageSize },
      success: resolve,
      fail: reject
    })
  },
  // 结算订单
  preOrder: function(list, resolve, reject) {
    fetch({
      url: getServerUrl('/order/preOrder'),
      data: { list: list },
      success: resolve,
      fail: reject
    })
  },
  // 确认收货
  confirmReceive: function(orderSubId, resolve, reject) {
    fetch({
      url: getServerUrl('/order/confirmReceive'),
      data: { orderSubId: orderSubId },
      success: resolve,
      fail: reject
    })
  },
  // 查看物流
  queryLogistics: function(orderSubId, resolve, reject) {
    fetch({
      url: getServerUrl('/order/queryLogistics'),
      data: { orderSubId: orderSubId },
      success: resolve,
      fail: reject
    })
  },
  // 获取物流公司
  getExpressCompanys: function(resolve, reject) {
    fetch({
      url: getServerUrl('/order/getExpressCompanys'),
      success: resolve,
      fail: reject
    })
  },
  sendNotify: function(params, resolve, reject) {
    fetch({
      url: getServerUrl('order/sendNotify'),
      data: params,
      success: resolve,
      fail: reject
    })
  }
}

// 用户接口
const userServer = {
  // 加购物车
  /**
   * productInfo [Object] -> productSkuId(商品id),quantity(数量)
   */
  addCart: function(productInfo, resolve, reject) {
    fetch({
      url: getServerUrl('/user/addCart'),
      data: productInfo,
      success: resolve,
      fail: reject
    })
  },
  // 批量添加购物车
  batchAddCart: function(skuList,resolve, reject){
    fetch({
      url: getServerUrl('/user/batchAddCart'),
      data: {skuList: skuList},
      success: resolve,
      fail: reject
    })
  },
  // 加收藏
  addFavorite: function(productId, resolve, reject) {
    fetch({
      url: getServerUrl('/user/addFavorite'),
      data: { productId: productId },
      success: resolve,
      fail: reject
    })
  },
  // 添加或者修改地址
  addOrUpdateAddress: function(addressInfo, resolve, reject) {
    fetch({
      url: getServerUrl('/user/addOrUpdateAddress'),
      data: addressInfo,
      success: resolve,
      fail: reject
    })
  },
  // 取消收藏
  cancelFavorite: function(FavoriteInfo, resolve, reject) {
    fetch({
      url: getServerUrl('/user/cancelFavorite'),
      data: FavoriteInfo,
      success: resolve,
      fail: reject
    })
  },
  // 授权后，提交用户信息
  commitUserInfo: function(userInfo, resolve, reject) {
    fetch({
      url: getServerUrl('/user/commitUserInfo'),
      data: userInfo,
      success: resolve,
      fail: reject
    })
  },
  // 获取地址列表
  getAddressList: function(resolve, reject) {
    fetch({
      url: getServerUrl('/user/getAddressList'),
      success: resolve,
      fail: reject
    })
  },
  // 获取购物车商品列表
  getCartList: function(resolve, reject) {
    fetch({
      url: getServerUrl('/user/getCartList'),
      success: resolve,
      fail: reject
    })
  },
  // 获取收藏列表
  getFavoritesList: function(nextPage, resolve, reject) {
    fetch({
      url: getServerUrl('/user/getFavoritesList'),
      data: { nextPage: nextPage },
      success: resolve,
      fail: reject
    })
  },
  //  删除地址
  removeAddress: function(addressId, resolve, reject) {
    fetch({
      url: getServerUrl('/user/removeAddress'),
      data: { id: addressId },
      success: resolve,
      fail: reject
    })
  },
  // 从购物车移除商品
  removeCart: function(productSkuIds, resolve, reject) {
    fetch({
      url: getServerUrl('/user/removeCart'),
      data: { productSkuIds: productSkuIds },
      success: resolve,
      fail: reject
    })
  },
  // 设置默认收货地址
  setDefaultAddress: function(addrIdInfo, resolve, reject) {
    fetch({
      url: getServerUrl('/user/setDefaultAddress'),
      data: addrIdInfo,
      success: resolve,
      fail: reject
    })
  }
}

// 售后
const serviceServer = {
  // 提交退货/退款申请
  addApply: function(serviceInfo, resolve, reject) {
    fetch({
      url: getServerUrl('/customerService/addApply'),
      data: serviceInfo,
      success: resolve,
      fail: reject
    })
  },
  // 添加退货物流信息
  addReturnInfo: function(logisticsInfo, resolve, reject) {
    fetch({
      url: getServerUrl('/customerService/addReturnInfo'),
      data: logisticsInfo,
      success: resolve,
      fail: reject
    })
  },
  // 获取退货退款申请信息
  getReturnApplyInfo: function(params, resolve, reject) {
    fetch({
      url: getServerUrl('/customerService/getReturnApplyInfo'),
      data: params,
      success: resolve,
      fail: reject
    })
  }
}



exports.productServer = productServer // 商品接口
exports.orderServer = orderServer // 订单接口
exports.userServer = userServer // 用户接口
exports.serviceServer = serviceServer // 售后接口
