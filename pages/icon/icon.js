//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    iptValue: '',
    i: 0
  },
  onLoad: function() {
    this.setData({})
  },
  getLine(e) {
    return e.detail.lineCount
  },

  getValue(e) {
    const me = this
    const d = me.data
    d.iptValue = e.detail.value
    console.log(e.detail.value)
    me.setData(d)
  }
})
