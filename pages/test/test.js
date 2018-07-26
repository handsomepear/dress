//logs.js
const util = require('../../utils/util.js')
Page({
  data: {
    iptValue: '',
    i: 0,
    list: [1, 2, 3, 4, 5],
    formContent: ""
  },
  onLoad: function() {
    this.setData({})
  },
  onShow: function(){
    this.createFormIdDom()
  },

  createFormIdDom: function(){
    var me = this
    var d = me.data 
    var arr = ["<div class='aa'></div>"]
    for(var i = 0; i < d.list.length; i++){
      arr.unshift("<button formType='submit' class='btn'>")
      arr.push("</button>")
      arr.unshift("<form bindsubmit='formSubmit' report-submit='{{true}}'>")
      arr.push("</form>")
    }
    var formContent = arr.join('')
  },

  getValue(e) {
    const me = this
    const d = me.data
    d.iptValue = e.detail.value
    console.log(e.detail.value)
    me.setData(d)
  },
  formSubmit: function(e) {
    console.log(e)
    if (e.detail.formId != 'the formId is a mock one') {
      this.setData({
        formIdString: e.detail.formId + ',' + this.data.formIdString
      })
    }
    // console.log(this.data.formIdString)
  }
})
