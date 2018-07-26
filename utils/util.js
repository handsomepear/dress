const qiniu = require('./qiniu')
function getOpenId() {
  return new Promise(function(resolve, reject) {
    wx.login({
      success: function(res) {
        const code = res.code
        wx.request({
          // url: 'https://krypton-api.j.cn/api/common/fetchOpenIdByJSCode',
          url: 'https://kryptontest.j.cn/api/common/fetchOpenIdByJSCode',
          method: 'POST',
          data: {
            appId: 'wx299543e7945f132f',
            jsCode: code
          },
          success: res => {
            if (res.data.status == 500) {
              reject(res.data)
            } else {
              wx.setStorageSync('openId', res.data.openId)
              resolve(res.data.openId)
            }
          },
          fail: err => {
            reject(err)
          }
        })
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}

function getUserInfo(cb) {
  const me = this
  const d = me
  let userInfo = {}
  try {
    userInfo = wx.getStorageSync('userInfo')
  } catch (e) {
    console.log('本地没存', e)
  }
  if (userInfo) {
    cb && cb(userInfo)
    return
  }
  wx.getUserInfo({
    lang: 'zh_CN',
    success(data) {
      userInfo = data.userInfo
      wx.setStorageSync('userInfo', userInfo)
      cb && cb(userInfo)
    },
    fail() {
      d.isAuthAllow = false
      // me.setData(d)
    }
  })
}

const userInfoHandler = function(opts) {
  const me = this
  const d = me.data

  me.getUserInfo(function(userInfo) {
    if (userInfo === null) {
      d.isAuthAllow = false
      me.setData(d)
      return
    }
    d.isAuthAllow = true
    me.setData(d)
  })
  me.setData(d)
}

function fileUpload(filePath, data, succ, err) {
  //支服务器拿token,成功后开始七牛上传
  wx.showLoading({
    title: '上传中',
    mask: true
  })

  let isTimeout = false
  let uploadTimeout = setTimeout(function() {
    isTimeout = true
    wx.hideLoading()
    wx.showToast({
      title: '上传超时',
      mask: true
    })
  }, 30000)

  wx.request({
    url: 'https://kryptontest.j.cn/api/common/getUploadInfo',
    method: 'POST',
    data: data,
    success: function(jsonToken) {
      qiniu.upload(
        filePath,
        function(qiniuRes) {
          clearTimeout(uploadTimeout)
          if (isTimeout) {
            console.log('虽然上传成功了，但是超时了，不做后续操作')
            return
          }
          wx.hideLoading()
          succ({
            resUrl: jsonToken.data.uploadInfoList[0].finalUrl,
            status: qiniuRes
          })
          wx.showToast({
            title: '成功',
            icon: 'success',
            mask: true,
            duration: 2000
          })
        },
        function(error) {
          err(error)
        },
        {
          region: 'ECN',
          key: jsonToken.data.uploadInfoList[0].key,
          uptoken: jsonToken.data.uploadInfoList[0].token
        }
      )
    },
    fail() {
      err()
      console.log('获取token信息失败')
    }
  })
}

// 数量加1
function increase(num) {
  return ++num
}

function subtract(num) {
  return --num
}

function arrQc(objArr, key) {
  var arr = []
  var newArr = []
  var newArr1 = []
  for (let v of objArr) {
    arr.push(v[key])
  }
  for (var i = 0; i < arr.length; i++) {
    if (newArr.indexOf(arr[i]) < 0) {
      newArr.push(arr[i])
      newArr1.push(objArr[i])
    }
  }
  return newArr1
}

function accMul(arg1, arg2) {
  if (isNaN(arg1)) {
    arg1 = 0
  }
  if (isNaN(arg2)) {
    arg2 = 0
  }
  arg1 = Number(arg1)
  arg2 = Number(arg2)

  var m = 0,
    s1 = arg1.toString(),
    s2 = arg2.toString()
  try {
    m += s1.split('.')[1].length
  } catch (e) {}
  try {
    m += s2.split('.')[1].length
  } catch (e) {}
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m)
}

Number.prototype.add = function(arg){
  var r1, r2, m
  try{
    r1 = this.toString().split('.')[1].length
  }catch(e){
    r1 = 0
  }
  try{
    r2 = arg.toString().split('.')[1].length
  }catch(e){
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1,r2))
  return (this*m + arg*m)/m
}
// 乘法
Number.prototype.mul = function(arg) {
  return accMul(this, arg)
}

Array.prototype.diff = function(a, key) {
  return this.filter(function(item) {
    return !a.some(function(ele) {
      return ele[key] === item[key]
    })
  })
}

function resolution(content) {
  //console.log(content)

  content = content.replace(/\<img .*?\/\>/g, str => {
    return '\n' + str + '\n'
  })

  // content = content.replace(/\<(.*?)\>.*?\<\/(.*?)\>/g, (str) => {
  //   return '\n'
  // })

  const richNodes = content.split('\n').map(function(item, idx) {
    // const re = /(?:\[\w+\])(.*?)(?:\[\/\w+\])/
    const re = /\<img src=\"(.*?)\"\/\>/
    let result = {}

    //console.log(item)
    if (re.test(item)) {
      //console.log(item.match(re)[1].split(",")[0].replace(/static\d+[.]/,'static1.').split("!")[0])
      result = {
        name: 'image',
        attrs: {
          src: item.match(re)[1],
          width: '90%',
          style: 'display: block; margin: 0 auto;'
        }
      }
    } else {
      item = item.replace(/\<\w+\>/g, '')
      item = item.replace(/\<\/\w+\>/g, '')
      result = {
        name: 'text',
        attrs: {
          style: 'margin: 5%;',
          text: item
        }
      }
    }
    return result
    /*d.richNodes = [
      {
        name: 'div',
        attrs: {
          style: 'margin: 20px'
        },
        children: d.richNodes,
      }
    ]*/
  })
  return richNodes
}

module.exports.methods = {
  getOpenId,
  getUserInfo,
  userInfoHandler,
  fileUpload,
  increase,
  subtract,
  arrQc,
  resolution
}
