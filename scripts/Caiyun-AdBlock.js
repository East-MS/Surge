/*
 * 彩云天气去广告 — Surge
 * 根据用户提供的 2024-09-05 脚本整理。
 * 修复 A03 判断，增加异常响应保护。
 */

(function () {
  let result = {};

  try {
    const url = String($request.url || "");
    const endpoint =
      /^https:\/\/(api\.caiyunapp\.com|cdn-w\.caiyunapp\.com|wrapper\.cyapi\.cn)\/v1\/activity\/?(?:\?|$)/i.exec(url);

    if (endpoint) {
      let obj = JSON.parse($response.body);

      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        // 支持 type_id 位于查询参数开头、中间或末尾。
        const isA03 = /[?&]type_id=A03(?:&|$)/.test(url);

        if (isA03) {
          // 保留原响应结构，将已有的刷新间隔改为 30 天。
          if (Object.prototype.hasOwnProperty.call(obj, "interval")) {
            obj.interval = 2592000;
          }

          if (Array.isArray(obj.activities)) {
            if (endpoint[1].toLowerCase() !== "wrapper.cyapi.cn") {
              // 底栏控制项目：主页图标、天气助手、彩云 AI。
              for (const item of obj.activities) {
                if (item && item.name && item.type && item.feature) {
                  item.feature = false;
                }
              }
            } else {
              // wrapper 接口：清空活动推广。
              obj.activities = [];
            }
          }
        } else {
          // 其他活动请求返回空列表。
          obj = {
            status: "ok",
            activities: [{ items: [] }]
          };
        }

        result = { body: JSON.stringify(obj) };
      }
    }
  } catch (error) {
    // 非 JSON 或异常响应原样放行。
    console.log("[Caiyun-AdBlock] " + error.message);
  }

  $done(result);
})();
