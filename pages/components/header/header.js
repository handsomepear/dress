const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fixed: {
      type:Boolean,
      value: true
    },
    color: {
      type: String,
      value: '#000'
    },
    backgroundColor: {
      type: String,
      value: '#fff'
    },
    isShowBack: {
      type: Boolean,
      value: false
    },
    delta: {
      type: Number,
      value: 1
    },
    isShare:Boolean,
    isFromTemp:Boolean,
    pagesLength:Number,
  },

  /**
   * 组件的初始数据
   */
  data: {
    isx: /iphone10|iphone x/i.test(wx.getSystemInfoSync().model),
    isAndroid: /android/i.test(wx.getSystemInfoSync().system)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    backHandler: function (e) {
      const curData = e.currentTarget.dataset.a
      wx.navigateBack({
        delta:this.data.delta
      })
      /*if(curData === '去首页') {
        this.triggerEvent('exec',{dataA: '去首页'})
      } else if (curData === 'back') {
      }*/
    },
    queryMultipleNodes: function(){
      var query = wx.createSelectorQuery().in(this)
      query.select('.header-placeholder').boundingClientRect((rect) => {
        app.globalData.headerHeight = rect.height
      }).exec()
    },
  },
  ready(){
    const me = this
    me.queryMultipleNodes()
  }
})
