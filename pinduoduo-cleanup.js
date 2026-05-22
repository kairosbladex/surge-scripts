(function () {
  var CORE_TAB_LINKS = {
    "index.html": true,
    "chat_list.html": true,
    "personal.html": true,
  };

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function textOf(value) {
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value).toLowerCase();
    }
    try {
      return JSON.stringify(value).toLowerCase();
    } catch (_) {
      return "";
    }
  }

  function isCoreTab(tab) {
    var link = textOf(tab && (tab.link || tab.url || tab.jump_url || tab.route || tab.uri));
    return CORE_TAB_LINKS[link] === true || /(^|\/)(index|chat_list|personal)\.html($|[?#])/.test(link);
  }

  function isDuoduoVideoTab(tab) {
    var text = textOf(tab);
    return /多多视频|短视频|duoduo[_-]?video|ddvideo|pdd[_-]?video|pdd[_-]?live[_-]?tab|video[_-]?tab|live[_-]?tab|timeline|video\.html/.test(text);
  }

  function cleanBottomTabs(tabs) {
    if (!Array.isArray(tabs)) {
      return tabs;
    }

    var coreTabs = tabs.filter(isCoreTab);
    if (coreTabs.length >= 2) {
      return coreTabs;
    }

    return tabs.filter(function (tab) {
      return !isDuoduoVideoTab(tab);
    });
  }

  function cleanPinduoduoHomeHub(payload) {
    var next = cloneJson(payload);
    var result = next && next.result;

    if (!result || typeof result !== "object") {
      return next;
    }

    delete result.icon_set;
    delete result.search_bar_hot_query;

    if (result.dy_module && typeof result.dy_module === "object") {
      delete result.dy_module.irregular_banner_dy;
      delete result.dy_module.recommend_fresh_info;
    }

    result.bottom_tabs = cleanBottomTabs(result.bottom_tabs);
    return next;
  }

  function rewriteBody(body) {
    return JSON.stringify(cleanPinduoduoHomeHub(JSON.parse(body)));
  }

  if (typeof $done === "function") {
    try {
      $done({ body: rewriteBody($response.body || "{}") });
    } catch (_) {
      $done({});
    }
    return;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      cleanPinduoduoHomeHub: cleanPinduoduoHomeHub,
      rewriteBody: rewriteBody,
      isDuoduoVideoTab: isDuoduoVideoTab,
    };
    return;
  }
})();
