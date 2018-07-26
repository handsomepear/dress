//app.js

var { userServer } = require("./utils/api");
const util = require("./utils/util");
App({
  onLaunch: function() {
    this.getUserInfo();
  },
  globalData: {
    isAuthAllow: false,
    userInfo: null,
    buyAgainList: null,
    buyAgainShop: null,
    chooseAddrInfo: null, // 用户选择的地址
    serverInfo: null, // 售后信息
    mineTab: "order", // 我的页面展示哪个Tab
    canRefreshOrder: false // 付款之后 点击 查看订单 按钮 要刷新我的订单页面
  },
  getUserInfo() {
    var me = this;
    wx.getUserInfo({
      lang: "zh_CN",
      success: function(res) {
        var userInfo = res.userInfo;
        me.globalData.userInfo = userInfo;
        // 提交用户信息
        wx.setStorageSync("userInfo", userInfo);
        // 登录
        userServer.commitUserInfo(
          {
            avatar: userInfo.avatarUrl,
            gender: userInfo.gender,
            nickName: userInfo.nickName,
            source: 1
          },
          function(res) {
            me.globalData.isAuthAllow = true
          },
          function() {}
        );
      },
      fail: function() {
        wx.showModal({
          title: "您还没有授权，是否要跳转到授权窗口"
        });
      }
    });
  }
});
