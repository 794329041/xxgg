/*************************************
 * 瓜子影视 - 广告数据净化 (Loon 适配版)
 * 原脚本：ZenmoFeiShi/Qx
 * 功能：清理响应体中的广告数据，使其返回空列表或错误码
 *************************************/

const $ = new API("瓜子净化");
const url = $request.url;
let obj = JSON.parse($response.body);

// 通用清理函数：将广告数据设为空
function cleanAdData(data) {
  if (data.data) {
    // 处理列表型广告数据
    if (Array.isArray(data.data)) {
      data.data = [];
    }
    // 处理对象型广告数据
    else if (typeof data.data === 'object' && data.data !== null) {
      // 如果有广告列表字段，清空它
      if (data.data.list) data.data.list = [];
      if (data.data.ads) data.data.ads = [];
      if (data.data.advertisement) data.data.advertisement = [];
    }
    // 设置错误码，让客户端认为没有广告
    data.code = -1;
    data.msg = "No ad available";
  }
  return data;
}

// 针对不同接口的精细化清理
if (url.includes("/App/Resource/Config/getNav")) {
  // 清理导航栏广告配置
  if (obj.data && obj.data.nav) {
    obj.data.nav = obj.data.nav.filter(item => !item.is_ad && !item.ad_url);
  }
} else if (url.includes("/App/Ad/")) {
  // 通用广告接口清理
  obj = cleanAdData(obj);
} else if (url.includes("/vodAdvertisement") || url.includes("/showOne") || url.includes("/vurlDetail")) {
  // 视频详情和播放页广告清理
  if (obj.data && obj.data.vod_ad) {
    obj.data.vod_ad = [];
  }
  if (obj.data && obj.data.player_ad) {
    obj.data.player_ad = null;
  }
}

$.done({ body: JSON.stringify(obj) });

// Loon API 封装
function API(name) {
  this.name = name;
  this.log = (msg) => console.log(`[${name}] ${msg}`);
  this.msg = (title, subtitle, message) => $notification.post(title, subtitle, message);
  this.done = (obj) => $done(obj);
}
