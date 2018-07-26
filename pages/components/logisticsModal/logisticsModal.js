
Component({
  properties: {
    logisticsInfo: {
      type: Object,
      value: {}
    },
    skuList: {
      type: Array,
      value: []
    }
  },
  data: {
    traces: []
  },
  ready: function(){
    this.setData({
      traces: this.data.logisticsInfo.traces.reverse()
    })
  },
  methods: {
    closeModal: function(){
      this.triggerEvent('hideLogisticsModal')
    },
    stopPropagation:function(){},
    // 复制单号
    copyNum: function(){
      var me = this 
      var d = me.data
      wx.setClipboardData({
        data: d.logisticsInfo.expressNo,// 物流单号
        success: function() {
          wx.showToast({
            title: '单号复制成功',
            icon: 'success',
            mask: true
          })
        }
      })
    }
  }
})