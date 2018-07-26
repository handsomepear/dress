//index.js
//获取应用实例
const app = getApp()
const common = require('../components/common')
const util = require('../../utils/util')
const { userServer, orderServer, productServer } = require('../../utils/api')
Page({
  data: {
    ...common.data,
    hasCartGoods: true, // 判断购物车是否为空
    isAllSelected: false, // 是否全选
    allQuantity: 0, // 选中商品总数量
    totalPrice: 0, // 选中商品总价格
    isShowSkuModal: false,
    cartList: [],
    isExitSkuModal: false,
    currentProduct: null,
    currentSku: null,
    isPullLoading: false, // 是否下拉刷新
  },
  onLoad: function() {},
  onShow: function() {
    this.getCartList()
  },
  onHide: function() {
    this.setCartList(this.data.cartList, false) // 默认不选中所有购物车商品
    app.globalData.buyAgainList = null 
    
  },
  onPullDownRefresh: function(){
    var me = this 
    var d = me.data
    userServer.getCartList(
      function(res) {
        me.checkCartEmpty(res.cartList)
        me.setCartList(res.cartList, false) // 默认不选中所有购物车商品
        me.setDefaultChecked()
        me.countAllQuantity()
        wx.stopPullDownRefresh() // 停止下拉刷新
        me.setData({
          isPullLoading: false
        })

      },
      function() {}
    )
  },
  // 监测购物车是不是空的
  checkCartEmpty: function(cartList) {
    if (cartList instanceof Array) {
      var hasCartGoods = cartList.some(function(storeItem) {
        return storeItem.productSkuInfoList.length > 0
      })
      this.setData({
        hasCartGoods: hasCartGoods
      })
    }
  },
  // 点击图片查看详情
  viewDetail: function(e) {
    var productId = e.currentTarget.dataset.productId
    wx.navigateTo({
      url: '../detail/detail?productId=' + productId
    })
  },
  // 获取购物车列表
  getCartList: function() {
    var me = this
    var d = me.data
    userServer.getCartList(
      function(res) {
        me.checkCartEmpty(res.cartList)
        me.setCartList(res.cartList, false) // 默认不选中所有购物车商品
        me.setDefaultChecked()
        me.countAllQuantity()
      },
      function() {}
    )
  },
  // 设置购物车默认选中状态
  setDefaultChecked: function() {
    var me = this
    var d = me.data
    var buyAgainList = app.globalData.buyAgainList // 再次购买的商品列表
    var buyAginShop = app.globalData.buyAgainShop
    if (!buyAgainList && !buyAginShop) {
      return
    }
    // 找到当前购买的商店信息
    var store = d.cartList.find(storeItem => {
      return storeItem.shopId == buyAginShop.id
    })
    if(!store) {
      return 
    }
    store.productSkuInfoList.forEach(oItem => {
      buyAgainList.forEach(nItem => {
        if (
          oItem.productSku.id == nItem.skuId &&
          oItem.productSku.inventory > 0
        ) {
          oItem.checked = true
        }
      })
    })
    // 检测库存 设置店铺的选中状态
    var canSelectList = store.productSkuInfoList.filter(function(goodItem) {
      return goodItem.productSku.inventory > 0
    })
    store.checked = this.checkStoreSelect(canSelectList)
    d.isAllSelected = this.checkStoreSelect(
      d.cartList.filter(storeItem => !storeItem.storeDisabled)
    )
    me.countAllQuantity()
    me.setData(d)
  },
  // 设置购物车数据的选中状态
  setCartList: function(cartList, isChecked) {
    var me = this
    var d = me.data
    cartList.forEach(function(storeItem) {
      if (
        typeof storeItem.checked == 'undefined' ||
        storeItem.storeDisabled === false
      ) {
        isChecked === undefined ? null : (storeItem.checked = isChecked)
      }
      storeItem.storeDisabled = true // 商店是否可选
      storeItem.productSkuInfoList.forEach(function(goodItem) {
        if (goodItem.productSku.inventory > 0) {
          // 如果传入的设置的值 那么就设置 否则就不设置
          isChecked === undefined ? null : (goodItem.checked = isChecked)
          storeItem.storeDisabled = false
        } else {
          goodItem.checked = false
        }
      })
    })
    d.isAllSelected = me.checkStoreSelect(
      cartList.filter(storeItem => !storeItem.storeDisabled)
    )
    d.cartList = cartList
    me.setData(d)
  },
  // 去逛逛
  goShopping: function() {
    // 跳转到tabBar页面的话 要用switchTab
    wx.switchTab({
      url: '../index/index'
    })
  },
  // 选择某个店铺
  selectStoreItem: function(e) {
    var d = this.data
    var storeIndex = e.currentTarget.dataset.storeIndex
    var cartList = d.cartList
    if (!cartList[storeIndex].storeDisabled) {
      cartList[storeIndex].checked = !cartList[storeIndex].checked
      cartList[storeIndex].productSkuInfoList.forEach(function(goodItem) {
        if (goodItem.productSku.inventory > 0) {
          goodItem.checked = cartList[storeIndex].checked
        }
      })
      // 全选状态
      d.isAllSelected = this.checkStoreSelect(
        cartList.filter(storeItem => !storeItem.storeDisabled)
      )
      this.setData(d)
      this.countAllQuantity()
    } else {
      cartList[storeIndex].checked = false
    }
  },
  // 选择某个商品
  selectGoodItem: function(e) {
    var d = this.data
    // 当前商品店铺Index
    var storeIndex = e.currentTarget.dataset.storeIndex
    // 当前商品Index
    var goodIndex = e.currentTarget.dataset.goodIndex
    // 拿到当前的商品的库存 判断有货没货 还有 要设定用户选择数量的上限
    var cartList = d.cartList
    var current = cartList[storeIndex].productSkuInfoList[goodIndex]
    // 如果库存 大于 0
    if (current.productSku.inventory > 0) {
      current.checked = !current.checked
      // 获取到有库存的商品列表
      var canSelectList = cartList[storeIndex].productSkuInfoList.filter(
        function(goodItem) {
          return goodItem.productSku.inventory > 0
        }
      )
      cartList[storeIndex].checked = this.checkStoreSelect(canSelectList)
      // 全选状态

      d.isAllSelected = this.checkStoreSelect(
        cartList.filter(storeItem => !storeItem.storeDisabled)
      )
      this.setData(d)
      this.countAllQuantity()
    }
  },
  // 监测选中状态
  checkStoreSelect: function(list) {
    if (list.length) {
      // todo 这里遍历可选的商品或者店铺列表会不会更好
      return list.every(function(item) {
        return item.checked
        // return item.checked
      })
    } else {
      return false
    }
  },
  // 全选
  selectAll: function(e) {
    var d = this.data
    d.isAllSelected = !d.isAllSelected
    this.setCartList(this.data.cartList, d.isAllSelected)
    this.countAllQuantity()
    this.setData(d)
  },
  // 增加商品数
  increaseNum: function(e) {
    var d = this.data
    var me = this
    var cartList = d.cartList
    var storeIndex = e.currentTarget.dataset.storeIndex
    var goodIndex = e.currentTarget.dataset.goodIndex
    var current = cartList[storeIndex].productSkuInfoList[goodIndex]
    wx.showLoading()
    if (current.quantity < current.productSku.inventory) {
      userServer.addCart(
        {
          oldProductSkuId: 0,
          productSkuId: current.productSku.id,
          quantity: 1,
          type: 1
        },
        res => {
          current.quantity = me.increase(current.quantity)
          me.setData(d)
          me.countAllQuantity()
          wx.hideLoading()
        },
        err => {
          wx.hideLoading()
          wx.showToast({
            title: '出错了',
            icon: 'none',
            mask: true
          })
        }
      )
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        mask: true
      })
    }
  },
  // 减少商品数
  subtractNum: function(e) {
    var d = this.data
    var me = this
    var cartList = d.cartList
    var storeIndex = e.currentTarget.dataset.storeIndex
    var goodIndex = e.currentTarget.dataset.goodIndex
    var current = cartList[storeIndex].productSkuInfoList[goodIndex]
    wx.showLoading()
    if (current.quantity > 1) {
      userServer.addCart(
        {
          oldProductSkuId: 0,
          productSkuId: current.productSku.id,
          quantity: 1,
          type: 2
        },
        res => {
          current.quantity = me.subtract(current.quantity)
          me.setData(d)
          me.countAllQuantity()
          wx.hideLoading()
        }
      )
    } else {
      wx.hideLoading()
      wx.showToast({
        title: '不能再少了哦',
        icon: 'none',
        mask: true
      })
    }
  },
  // 计算价格
  countPrice: function(productIdArr) {},
  // 结算
  settle: function() {
    var me = this
    var allQuantity = me.data.allQuantity
    wx.showLoading()
    if (allQuantity > 0) {
      var paramList = [] // 结算订单的商品信息
      var checkedGoodList = me.getCheckedGoodList()
      checkedGoodList.forEach(function(goodItem) {
        paramList.push({
          quantity: goodItem.quantity,
          skuId: goodItem.productSku.id
        })
      })
      orderServer.preOrder(
        paramList,
        function(res) {
          wx.hideLoading()
          wx.navigateTo({
            url:
              '../order/settlement/settlement?preOrderInfo=' +
              encodeURIComponent(JSON.stringify(res.preOrderInfo))
          })
        },
        function(err) {
          wx.showToast({
            title: err.bizMessage,
            icon: 'none',
            mask: true
          })
        }
      )
    }
  },
  // 数量变化
  quantityChange: function(e) {
    var me = this
    var d = this.data
    var cartList = d.cartList
    var storeIndex = e.currentTarget.dataset.storeIndex
    var goodIndex = e.currentTarget.dataset.goodIndex
    var current = cartList[storeIndex].productSkuInfoList[goodIndex]
    var oldQuantity = current.quantity
    if (e.detail.value > current.productSku.inventory) {
      wx.showToast({
        title: '超过库存数量了哦',
        icon: 'none',
        mask: true
      })
      current.quantity = current.productSku.inventory
    } else {
      current.quantity =
        isNaN(parseFloat(e.detail.value)) || e.detail.value == 0
          ? 1
          : parseFloat(e.detail.value)
    }
    userServer.addCart({
      productSkuId: current.productSku.id,
      quantity: Math.abs(current.quantity - oldQuantity),
      type: current.quantity < oldQuantity ? 2 : 1
    }, res => {
      me.setData(d)
      this.countAllQuantity()
    })
    
  },
  // 删除当前商品
  deleteGood: function(e) {
    var d = this.data
    var me = this
    var cartList = d.cartList
    var storeIndex = e.currentTarget.dataset.storeIndex
    var goodIndex = e.currentTarget.dataset.goodIndex
    var skuId = e.currentTarget.dataset.skuId
    var currentList = cartList[storeIndex].productSkuInfoList
    wx.showLoading()
    userServer.removeCart(
      [skuId],
      function(res) {
        // 删除购物车某商品(绑定的自定义属性也会跟着变化)
        currentList.splice(goodIndex, 1)
        me.checkCartEmpty(d.cartList)
        // 删除之后要判断商店的选中状态
        var canSelectList = currentList.filter(function(goodItem) {
          return goodItem.productSku.inventory > 0 // 筛选库存大于0的
        })
        // 删除之后如果有库存的数组为0 那么就将当前店铺设置为不可选
        if (!canSelectList.length) {
          cartList[storeIndex].storeDisabled = true
        }
        cartList[storeIndex].checked = me.checkStoreSelect(canSelectList)
        me.setData(d)
        me.countAllQuantity()
        wx.hideLoading()
      },
      function() {}
    )
    this.setData(d)
    // 计算商品数量
    this.countAllQuantity()
    this.checkCartEmpty(d.cartList)
  },
  // 移入收藏夹
  collect: function(e) {
    var me = this
    var d = me.data
    var cartList = d.cartList
    var productId = e.currentTarget.dataset.productId
    var storeIndex = e.currentTarget.dataset.storeIndex
    var goodIndex = e.currentTarget.dataset.goodIndex
    var id = e.currentTarget.dataset.id
    var skuId = e.currentTarget.dataset.skuId
    var currentList = d.cartList[storeIndex].productSkuInfoList
    userServer.addFavorite(
      productId,
      function() {
        userServer.removeCart(
          [skuId],
          function() {
            currentList.splice(goodIndex, 1)
            me.checkCartEmpty(d.cartList)
            var canSelectList = currentList.filter(function(goodItem) {
              return goodItem.productSku.inventory > 0 // 筛选库存大于0的
            })
            // 删除之后如果有库存的数组为0 那么就将当前店铺设置为不可选
            if (!canSelectList.length) {
              cartList[storeIndex].storeDisabled = true
            }
            cartList[storeIndex].checked = me.checkStoreSelect(canSelectList)
            me.setData(d)
            me.countAllQuantity()
            wx.showToast({
              title: '移入收藏夹成功',
              icon: 'success',
              mask: true
            })
          },
          function() {}
        )
      },
      function(res) {
        if (-1 == res.bizStatus) {
          wx.showToast({
            title: '最多收藏500个',
            icon: 'none',
            mask: true
          })
        }
      }
    )
  },
  // 计算商品总数和总金额
  countAllQuantity: function() {
    var quantity = 0
    var totalPrice = 0
    var checkedGoodList = this.getCheckedGoodList(function(goodItem) {
      totalPrice = totalPrice.add(
        goodItem.productSku.price.mul(goodItem.quantity)
      )
    })
    checkedGoodList.forEach(function(goodItem) {
      quantity += goodItem.quantity
    })
    this.setData({
      allQuantity: quantity,
      totalPrice: totalPrice
    })
  },
  // 获取选中的商品
  getCheckedGoodList: function(cb) {
    var d = this.data
    var checkedGoodList = []
    d.cartList.forEach(function(storeItem) {
      storeItem.productSkuInfoList.forEach(function(goodItem) {
        // 筛选出选中的商品
        if (goodItem.checked) {
          checkedGoodList.push(goodItem)
          cb && cb(goodItem)
        }
      })
    })
    return checkedGoodList
  },
  // 重新选择sku
  chooseSku: function(e) {
    var d = this.data
    var me = this
    var productId = e.currentTarget.dataset.productId // 商品ID
    var storeIndex = e.currentTarget.dataset.storeIndex // 当前商品index
    var goodIndex = e.currentTarget.dataset.goodIndex // 当前商品index
    var currentSku = d.cartList[storeIndex].productSkuInfoList[goodIndex] // 当前商品信息
    // 如果当前点击的是同一个product 那么就不需要发请求了
    if (!d.currentProduct || d.currentProduct.id != productId) {
      productServer.getProductDetail(productId, function(res) {
        me.setData({
          currentProduct: res.product,
          currentSku: currentSku,
          isExitSkuModal: true,
          isShowSkuModal: true
        })
      })
    } else {
      this.setData({
        isShowSkuModal: true,
        isExitSkuModal: true,
        currentSku: currentSku
      })
    }
  },
  // 购物车添加或者更改SKU信息
  addToCart: function(params) {
    var me = this
    var d = me.data
    // 当前点击的商品的 SkuId
    var oldProductSkuId = d.currentSku.productSku.id
    var productSkuInfo = params.detail
    wx.showLoading()
    if (oldProductSkuId === params.detail.productSkuId) {
      // 添加数量
      productSkuInfo.oldProductSkuId = 0
    } else {
      // 更新sku 信息
      productSkuInfo.oldProductSkuId = oldProductSkuId
    }
    userServer.addCart(
      productSkuInfo,
      function(res) {
        wx.hideLoading()
        me.getCartList()
        wx.showToast({
          title: '添加购物车成功',
          icon: 'success',
          mask: true,
          success: function() {
            me.hideSkuModal()
          }
        })
      },
      function(res) {
        if (-1 == res.bizStatus) {
          // 超过数量限制
          wx.showToast({
            title: '购物车最多添加50个商品',
            icon: 'none',
            mask: true
          })
        }
      }
    )
  },
  hideSkuModal: function() {
    var d = this.data
    d.isShowSkuModal = false
    this.setData(d)
  },
  ...common.methods,
  ...util.methods
})
