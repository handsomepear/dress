const app = getApp()

Component({
  properties: {
    checked: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },
  data: {
    num: 2
  },
  methods: {
    // toggleChecked: function() {
    //   var disabled = this.data.disabled
    //   if (!disabled) {
    //     this.setData({
    //       checked: !this.data.checked
    //     })
    //   }
    // }
  }
})
