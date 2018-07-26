const util = require('../../../utils/util')
Component({
  properties: {
    isShowSkuModal: {
      type: Boolean,
      value: true
    },
    title: {
      type: String,
      value: ''
    },
    skuInfo: {
      type: Object,
      value: {}
    },
    goodQuantity: {
      type: Number,
      value: 1
    },
    type: {
      type: String,
      value: 'cart'
    },
    hideSkuModal: {
      type: Function
    },
    addToCart: {
      type: Function
    },
    buyNow: {
      type: Function
    },
    currentSku: {
      type: Object,
      value: null
    },
  },
  data: {
    currentColor: null, // 当前颜色index
    currentColorName: null,
    currentSize: null, // 当前尺寸index
    currentSizeName: null,
    currentPrice: null,
    btnDisabled: true,
    currentInventory: null,
    colorList: [],
    isShowQuantity: true,
    sizeList: []
  },
  ready: function() {
    console.log('ready')
    var d = this.data
    this.groupSkuInfo()
    // 如果传入了SKU信息 则高亮
    if(d.currentSku) {
      this.setData({
        isShowQuantity: false
      })
    }
    if (d.currentSku && d.currentSku.productSku.inventory > 0) {
      this.highLightSku()
    }
    this.checkSku(
      {
        color: this.data.currentSku
          ? this.data.currentSku.productSku.color
          : null
      },
      'color',
      'size'
    )
    // 检测颜色
    this.checkSku(
      {
        size: this.data.currentSku ? this.data.currentSku.productSku.size : null
      },
      'size',
      'color'
    )

    this.setData(d)
  },
  methods: {
    // 高亮传入的SKU信息
    highLightSku: function() {
      var d = this.data
      var currentColor = d.colorList.findIndex(function(colorItem) {
        return colorItem.color == d.currentSku.productSku.color
      })
      var currentSize = d.sizeList.findIndex(function(sizeItem) {
        return sizeItem.size == d.currentSku.productSku.size
      })
      var currentPrice = d.currentSku.productSku.price.mul(d.goodQuantity) // 计算价格
      this.setData({
        currentColor: currentColor,
        currentSize: currentSize,
        currentPrice: currentPrice,
        currentColorName: d.currentSku.productSku.color,
        currentSizeName: d.currentSku.productSku.size,
        currentInventory: d.currentSku.productSku.inventory, // 库存
        btnDisabled: d.goodQuantity > 0 ? false : true
      })
    },
    // 将颜色跟大小分离出来
    groupSkuInfo: function() {
      var me = this
      var d = me.data
      for (var v of d.skuInfo) {
        if (v.color !== '') {
          d.colorList.push({
            color: v.color,
            disabled: false
          })
        }
        if (v.size !== '') {
          d.sizeList.push({
            size: v.size,
            disabled: false
          })
        }
      }
      d.colorList = me.arrQc(d.colorList, 'color')
      d.sizeList = me.arrQc(d.sizeList, 'size')
      me.setData(d)
    },
    closeModal: function() {
      this.triggerEvent('hideSkuModal') // 隐藏skuModal
    },
    stopPropagation: function() {},
    // 数量加
    increaseNum: function() {
      var d = this.data
      if (d.currentInventory > 0) {
        if (d.goodQuantity < d.currentInventory) {
          d.goodQuantity = this.increase(d.goodQuantity)
          this.countPrice()
          this.setData(d)
        } else {
          wx.showToast({
            title: '库存不足',
            icon: 'none',
            mask: true
          })
        }
      } else {
        wx.showToast({
          title: '请选择商品信息',
          icon: 'none',
          mask: true
        })
      }
    },
    // 数量减
    subtractNum: function() {
      var d = this.data
      if (d.currentInventory > 0) {
        if (d.goodQuantity > 1) {
          d.goodQuantity = this.subtract(d.goodQuantity)
        } else {
          wx.showToast({
            title: '不能再少了哦',
            icon: 'none',
            mask: true
          })
        }
      } else {
        wx.showToast({
          title: '请选择商品信息',
          icon: 'none',
          mask: true
        })
      }

      this.countPrice()
      this.setData(d)
    },
    // 加入购物车
    addCart: function() {
      var d = this.data
      if (!d.btnDisabled) {
        var currentSku = this.getCurrentSkuInfo()
        this.triggerEvent('addToCart', {
          productSkuId: currentSku[0].id,
          quantity:  d.isShowQuantity ? d.goodQuantity : 1,
          type: 1
        })
      }
    },
    // 立即购买
    buyNow: function() {
      var d = this.data
      // 这个buyNow是组件传过来的
      var currentSku = this.getCurrentSkuInfo()
      if (!d.btnDisabled) {
        this.triggerEvent('buyNow', {
          skuId: currentSku[0].id,
          quantity: d.goodQuantity
        })
      }
    },
    // 查询sku信息 禁掉无法被选的属性
    checkSku: function(sku, prop1, prop2) {
      var d = this.data
      // 匹配到含有当前属性的sku组合
      var skuResult = d.skuInfo.filter(item => {
        return item[prop1] == sku[prop1]
      })
      // 如果当前属性为null 那么就返回全部的SKU集合
      skuResult = skuResult.length ? skuResult : d.skuInfo
      // 然后筛选掉无库存的SKU信息
      skuResult = skuResult.filter(skuItem => {
        return skuItem.inventory > 0
      })
      // console.log(skuResult)
      // 商品属性只有一种（一级属性SKU 那么 就将另外的属性值设为''）
      if (skuResult.length == 1 && skuResult[0][prop2] == '') {
        d['current' + (prop2[0].toUpperCase() + prop2.slice(1)) + 'Name'] = ''
      }
      // 根据筛选之后的SKU信息 找出另外一级属性中无法被选取的组合
      var disabledPropList = d[prop2 + 'List'].diff(skuResult, prop2)
      // 然后设置他们的 disabled
      d[prop2 + 'List'].map(function(item) {
        item.disabled = disabledPropList.some(function(disabledItem) {
          return item[prop2] === disabledItem[prop2]
        })
      })
    },
    // 选择颜色
    chooseColor: function(e) {
      var select = e.currentTarget.dataset.select
      var me = this
      var d = me.data
      if (!d.colorList[select].disabled) {
        if (d.currentColor === select) {
          d.currentColor = null // color 置空
          d.currentInventory = null // 库存置空
          //  检测颜色
        } else {
          d.currentColor = select
        }
        // 查看SKU LIST
        var currentColorName =
          d.currentColor !== null ? d.colorList[d.currentColor].color : null
        d.currentColorName = currentColorName
        this.checkSku(
          {
            color: currentColorName
          },
          'color',
          'size'
        )
        this.countPrice()
        me.setData(d)
      }
    },

    // 选择大小
    chooseSize: function(e) {
      var select = e.currentTarget.dataset.select
      var me = this
      var d = me.data
      if (!d.sizeList[select].disabled) {
        if (d.currentSize === select) {
          d.currentSize = null
          d.currentInventory = null
        } else {
          d.currentSize = select
        }
        // 查看SKU LIST
        var currentSizeName =
          d.currentSize !== null ? d.sizeList[d.currentSize].size : null
        d.currentSizeName = currentSizeName
        this.checkSku(
          {
            size: currentSizeName
          },
          'size',
          'color'
        )
        this.countPrice()
        me.setData(d)
      }
    },
    // 获取到当前SKU信息
    getCurrentSkuInfo: function() {
      var d = this.data
      var currentSku = d.skuInfo.filter(function(skuItem) {
        return (
          skuItem.color == d.currentColorName &&
          skuItem.size == d.currentSizeName
        )
      })
      return currentSku
    },
    // 计算价格
    countPrice: function() {
      var d = this.data
      var currentSku = this.getCurrentSkuInfo()
      if (currentSku.length && d.goodQuantity > 0) {
        d.btnDisabled = false
        d.currentInventory = currentSku[0].inventory
        d.currentPrice = currentSku[0].price
      } else {
        d.btnDisabled = true
        d.currentPrice = null
      }
    },
    // 数量输入
    quantityChange: function(e) {
      var d = this.data
      var currentQuantity = e.detail.value
      d.goodQuantity =
        isNaN(parseFloat(currentQuantity)) || currentQuantity == 0
          ? 1
          : parseFloat(currentQuantity)
      this.countPrice()
      this.setData(d)
    },
    ...util.methods
  }
})
