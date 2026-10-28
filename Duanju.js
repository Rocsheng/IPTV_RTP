var _k='NJSUL7cLRncFIj';
var _e='5e9793b349623d8499abd839dbfe781dd8dc9735fa64d8fb0dfacc2f3e61206e1d92c29b6e8483b89d358f8beada3d2c690f70f3bfa955e00ab73597f229c144824ef6019628868cc0c859f7873f4d7c38dd6937f4acb1fd4e55dda347913488db42a9d56ee687f24f2fa2f9d95e1fee2cfa5d3425d2a3e5f82235eeb1eb5cb50dc1eac69202c4480d2f0319aabd9da5cde83f7740cd6bdf4a537bf3737017ed7fb6d6c214fbfb58e6c859928aec44bc987024ae6964ee75b4519aa75c021769d1ec3589b54d72e78fedcc1578de8b5d6193cc00df18bfa3c5236679e59c8c03f07d3c0d4e24e046422507cbe343a8ea19855016733a3453234edc7612986faf23459c3e77eddc1dfa75063182af946d4a7a42544eba34f2a87cb1f235a18702e18dcf302552645293e6d8031fd935b320a2e557d01a486806f9c471068d52fc2396854dbac3ede484ae0789b21b2c007ce7591e7485224bb56e6e52622b9c406a0842a9ee8de72a32973781a23cc9f93a93dc138e9aa514dea3306bdee557f7cfaaf0e7d16b06594e72deb8e3fa1b957270333e03ad5dc3df9fa4de4790c1e3284f44ab6c6d71f2f7beb65889dd963fc8c8594b82a78c48d5225f0ddaf7d56ab3da0d5d6f2ae7295c773368d542a2c7d44116bf45420718eac6291f28d2884354b477bf0af0e9f581f77d8d2e08985b22dd747946337b402c99e94eb74ed86a6b3455bfd3b7513e163983aa5af1c1b1f2a21625962647b98dfdcc657138430254c4e0550c822b852dec4990f5d46786d593ee51549975d90d1146bd67d927fa33a102ba6207f96cd7f0c80402e8a38d149c8c54b4db03ea7ec786f9cc8f98bb22e6e12e676d00ed51b7dad224c9edf51cffe56ad0f83dc61c7f2c648ba93339e703c77a741edf1fb2456b4056ac9716c4855ee9f5a71584f4cf9a2c317f6a65a0038053566108bf43fbb8cf6401fde2641154cc0af0b4fb60b0d7954123d46db074c9cd9e9d0daf6dde9d5116be2330864d6b793d72155b6a92a844e52084485393d8ef3ffd59b316a0df03fcbe6f76dd5dc14ccfda43d19e8838e1629140ef05fb7c51ec6614e8a95b384763a03c1081f2f31d0ba81c0e3fd0bf58732c3729ea095eeb3352d7a6779bd6';
var _p=[1,36,28,19,8,57,45,54,32,35,18,27,23,6,10,41,9,30,21,15,7,34,33,25,24,49,4,11,17,53,20,3,31,12,46,48,39,5,43,40,44,22,26,55,51,56,50,2,47,42,37,13,58,38,14,29,0,16,52];
function _hx(h){var r=[],i;for(i=0;i<h.length;i+=2)r.push(parseInt(h.substr(i,2),16));return r;}
function _rc4(b,k){var s=[],i,j=0,x,t,o=[];for(i=0;i<256;i++)s[i]=i;for(i=0;i<256;i++){j=(j+s[i]+k.charCodeAt(i%k.length))%256;x=s[i];s[i]=s[j];s[j]=x;}i=0;j=0;for(t=0;t<b.length;t++){i=(i+1)%256;j=(j+s[i])%256;x=s[i];s[i]=s[j];s[j]=x;o.push(b[t]^s[(s[i]+s[j])%256]);}return o;}
var _d=_rc4(_hx(_e),_k),_z='',_q;
for(_q=0;_q<_d.length;_q++)_z+=String.fromCharCode(_d[_q]);
var _t=JSON.parse(_z);
function _s(_x){return _t[_p[_x]];}



const DEFAULT_HOST = _s(56);
const UA =
  _s(0);

const CATEGORIES = [
  { type_name: _s(47), type_id: _s(31) },
  { type_name: _s(26), type_id: _s(37) },
  { type_name: _s(13), type_id: _s(20) },
  { type_name: _s(4), type_id: _s(16) },
];

function createSpider() {
  var host = DEFAULT_HOST;
  var headers = {};

  function setHeaders() {
    headers = {
      [_s(14)]: UA,
      Accept: _s(27),
      [_s(33)]: _s(51),
      Referer: host + _s(54),
    };
  }

  function playHeaders() {
    return {
      [_s(14)]: UA,
      Referer: host + _s(54),
      Origin: host,
      Accept: _s(19),
    };
  }

  function fullUrl(u) {
    if (!u) return _s(57);
    u = String(u)
      .trim()
      .replace(/\\u002F/g, _s(54))
      .replace(/\\\//g, _s(54))
      .replace(/&amp;/g, _s(28));
    if (u.indexOf(_s(10)) === 0) return _s(3) + u;
    if (/^https?:\/\//i.test(u)) return u;
    return host.replace(/\/$/, _s(57)) + (u.charAt(0) === _s(54) ? u : _s(54) + u);
  }

  function httpGet(pathOrUrl) {
    var url = /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : fullUrl(pathOrUrl);
    try {
      if (typeof req === _s(30)) {
        var rsp = req(url, { headers: headers, timeout: 20000 });
        if (typeof rsp === _s(18) && rsp.length > 80) return rsp;
        if (rsp && typeof rsp === _s(41)) {
          var c =
            rsp.content != null
              ? rsp.content
              : rsp.body != null
              ? rsp.body
              : rsp.data != null
              ? rsp.data
              : _s(57);
          if (typeof c === _s(18) && c.length > 80) return c;
        }
      }
    } catch (e) {}
    try {
      if (typeof request === _s(30)) {
        var html = request(url, { headers: headers });
        if (html && String(html).length > 80) return String(html);
      }
    } catch (e2) {}
    return _s(57);
  }

  function decodeImgPath(src) {
    if (!src) return _s(57);
    src = String(src).trim().replace(/&amp;/g, _s(28));
    if (/^https?:\/\//i.test(src)) return src;
    var m = /\/_img\/([A-Za-z0-9_\-+/=]+)/.exec(src);
    if (m) {
      try {
        var b64 = m[1].replace(/-/g, _s(12)).replace(/_/g, _s(54));

        b64 = b64.replace(/\.(jpe?g|png|webp)$/i, _s(57));
        while (b64.length % 4) b64 += _s(24);
        var real = typeof atob === _s(30) ? atob(b64) : _s(57);
        if (real && /^https?:\/\//i.test(real)) return real;
      } catch (e) {}
    }
    if (src.charAt(0) === _s(54)) return fullUrl(src);
    return fullUrl(src);
  }

  function goodTitle(t) {
    t = String(t || _s(57))
      .replace(/&amp;/g, _s(28))
      .replace(/&quot;/g, _s(23))
      .replace(/&#39;/g, _s(42))
      .replace(/&lt;/g, _s(11))
      .replace(/&gt;/g, _s(2))
      .trim();
    if (!t) return _s(57);
    if (t === _s(55) || t === _s(17) || t === _s(32) || t === _s(8))
      return _s(57);
    if (t.indexOf(_s(22)) >= 0) return _s(57);
    return t;
  }

  function mergeList(html) {
    var items = [];
    if (!html) return items;
    var seen = {};

    var reA =
      /<a[^>]*href="\/play\/(\d+)\/(\d+)\/"([^>]*)>/gi;
    var m;
    while ((m = reA.exec(html))) {
      var vid = m[1];
      if (seen[vid]) continue;
      var attrs = m[3] || _s(57);
      var title = _s(57);
      var am = /aria-label="([^"]+)"/i.exec(attrs);
      if (am) title = goodTitle(am[1]);
      if (!title) {
        var tm = /title="([^"]+)"/i.exec(attrs);
        if (tm) title = goodTitle(tm[1]);
      }

      var start = Math.max(0, m.index - 1800);
      var end = Math.min(html.length, m.index + 200);
      var block = html.slice(start, end);
      if (!title) {
        var alts = block.match(/alt="([^"]{2,80})"/g) || [];
        for (var i = alts.length - 1; i >= 0; i--) {
          var av = /alt="([^"]*)"/.exec(alts[i]);
          var gt = av ? goodTitle(av[1]) : _s(57);
          if (gt) {
            title = gt;
            break;
          }
        }
      }
      if (!title) {
        var ptext = /<p[^>]*>\s*([^<]{2,60})\s*</.exec(block);
        if (ptext) title = goodTitle(ptext[1]);
      }
      if (!title) title = _s(21) + vid;

      var pic = _s(57);
      var pm =
        /(?:data-src|src)="((?:https?:\/\/|\/_img\/)[^"]+)"/i.exec(block);
      if (pm) pic = decodeImgPath(pm[1]);

      var remark = _s(57);
      var rm = /(全\d+集|共\d+集|\d+集|\d+(?:\.\d+)?[Ww万]?播放)/.exec(block);
      if (rm) remark = rm[1];

      seen[vid] = 1;
      items.push({
        vod_id: String(vid),
        vod_name: title,
        vod_pic: pic,
        vod_remarks: remark,
      });
    }

    var reB =
      /href="(\/play\/(\d+)\/(\d+)\/)"[^>]*>[\s\S]{0,1200}?alt="([^"]*)"/g;
    while ((m = reB.exec(html))) {
      var v2 = m[2];
      if (seen[v2]) continue;
      var t2 = goodTitle(m[4]);
      if (!t2) continue;
      var blk = m[0];
      var pic2 = _s(57);
      var pm2 =
        /(?:data-src|src)="(https?:\/\/[^"]+|\/_img\/[^"]+)"/i.exec(blk);
      if (pm2) pic2 = decodeImgPath(pm2[1]);
      seen[v2] = 1;
      items.push({
        vod_id: String(v2),
        vod_name: t2,
        vod_pic: pic2,
        vod_remarks: _s(57),
      });
    }

    var reC =
      /(\d{4,}),"([^"]{1,80})","[^"]*","(https:(?:\\u002F|\/)[^"]+)",(\d+)/g;
    while ((m = reC.exec(html))) {
      var v3 = m[1];
      if (seen[v3]) continue;
      seen[v3] = 1;
      items.push({
        vod_id: String(v3),
        vod_name: goodTitle(m[2]) || _s(21) + v3,
        vod_pic: m[3].replace(/\\u002F/g, _s(54)).replace(/\\\//g, _s(54)),
        vod_remarks: m[4] ? _s(9) + m[4] + _s(1) : _s(57),
      });
    }

    return items;
  }

  function parseDetailMeta(html, vid) {
    var info = {
      vod_name: _s(57),
      vod_content: _s(57),
      vod_pic: _s(57),
      episodes: 1,
    };
    if (!html) return info;
    var ldRe =
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    var m;
    while ((m = ldRe.exec(html))) {
      try {
        var data = JSON.parse(m[1]);
        if (data && data[_s(50)] === _s(53)) {
          var name = String(data.name || _s(57))
            .replace(/第\d+集\s*$/, _s(57))
            .trim();
          if (name) info.vod_name = name;
          if (data.description) info.vod_content = String(data.description);
          var thumb = data.thumbnailUrl || _s(57);
          if (thumb && thumb.indexOf(_s(36)) < 0) info.vod_pic = thumb;
          var ne = parseInt(data.numEpisodes || _s(39), 10);
          if (ne > 0) info.episodes = ne;
        }
      } catch (e) {}
    }
    if (!info.vod_name) {
      var tm = /<title>([^<]+)<\/title>/i.exec(html);
      if (tm) {
        var t = tm[1].split(_s(15))[0].trim();
        t = t.replace(/第\d+集\s*$/, _s(57)).trim();
        info.vod_name = t;
      }
    }
    if (!info.vod_pic) {
      var pm =
        /(https:\/\/pic\.[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/i.exec(html);
      if (pm) info.vod_pic = pm[1];
      if (!info.vod_pic) {
        var im = /(?:data-src|src)="(\/_img\/[^"]+)"/i.exec(html);
        if (im) info.vod_pic = decodeImgPath(im[1]);
      }
    }
    if (!info.vod_name) info.vod_name = _s(21) + vid;
    if (info.episodes < 1) info.episodes = 1;
    return info;
  }

  function extractM3u8(html) {
    if (!html) return _s(57);
    var ms = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/g) || [];
    var i, u;
    for (i = 0; i < ms.length; i++) {
      u = ms[i].replace(/&amp;/g, _s(28));
      if (u.indexOf(_s(49)) >= 0 || u.indexOf(_s(38)) >= 0) return u;
    }
    if (ms.length) return ms[0].replace(/&amp;/g, _s(28));
    return _s(57);
  }

  function isVideoFormat(url) {
    return /\.(?:m3u8|mp4|flv)(?:$|[?#])/i.test(String(url || _s(57)));
  }

  function pageNumber(pg) {
    var n = parseInt(pg, 10);
    return isFinite(n) && n > 0 ? n : 1;
  }

  function init(extend) {
    host = DEFAULT_HOST;
    var ext = _s(57);
    if (typeof extend === _s(18)) ext = extend;
    else if (extend && typeof extend === _s(41)) {
      ext = extend.ext || extend.extend || _s(57);
    }
    ext = String(ext || _s(57)).trim();
    if (/^https?:\/\//i.test(ext)) host = ext.replace(/\/$/, _s(57));
    else if (ext.charAt(0) === _s(40)) {
      try {
        var cfg = JSON.parse(ext);
        if (cfg && cfg.host) host = String(cfg.host).replace(/\/$/, _s(57));
      } catch (e) {}
    }
    setHeaders();
  }

  function homeContent(filter) {
    var html = httpGet(_s(54));
    var videos = mergeList(html);
    return {
      class: CATEGORIES.slice(),
      filters: {},
      list: videos.slice(0, 30),
    };
  }

  function homeVideoContent() {
    var html = httpGet(_s(54));
    return { list: mergeList(html).slice(0, 30) };
  }

  function categoryContent(tid, pg, filter, extend) {
    var page = pageNumber(pg);
    tid = String(tid || _s(31));
    var path;
    if (tid === _s(31)) path = _s(54);
    else if (tid === _s(37) || tid === _s(16)) path = _s(6);
    else if (tid === _s(20)) path = _s(34);
    else {
      path = _s(34) + tid + _s(54);
      if (page > 1) path = _s(34) + tid + _s(48) + page;
    }
    var html = httpGet(path);
    var videos = mergeList(html);
    var pagecount = videos.length ? page + 1 : page;
    return {
      list: videos,
      page: page,
      pagecount: pagecount,
      limit: videos.length || 24,
      total: pagecount * 24,
    };
  }

  function searchContent(key, quick, pg) {
    var kw = encodeURIComponent(String(key || _s(57)).trim());
    var html = httpGet(_s(35) + kw);
    var videos = mergeList(html);
    return {
      list: videos,
      page: 1,
      pagecount: 1,
      limit: videos.length || 24,
      total: videos.length,
    };
  }

  function detailContent(ids) {
    if (!ids) return { list: [] };
    var raw = String(Array.isArray(ids) ? ids[0] : ids).trim();
    var vid = _s(57);
    var m = /\/play\/(\d+)\//.exec(raw);
    if (m) vid = m[1];
    else {
      var m2 = /(\d+)/.exec(raw);
      vid = m2 ? m2[1] : raw;
    }
    var html = httpGet(_s(25) + vid + _s(46));
    if (!html) return { list: [] };
    var meta = parseDetailMeta(html, vid);
    var epCount = meta.episodes;
    if (epCount <= 1) {
      var nums = [];
      var re = new RegExp(_s(25) + vid + _s(44), _s(58));
      var mm;
      while ((mm = re.exec(html))) nums.push(parseInt(mm[1], 10));
      if (nums.length) {
        var mx = nums[0];
        for (var i = 1; i < nums.length; i++) if (nums[i] > mx) mx = nums[i];
        if (mx > epCount) epCount = mx;
      }
      var em = /"episodes"\s*:\s*(\d+)/.exec(html);
      if (em) {
        var n = parseInt(em[1], 10);
        if (n > epCount) epCount = n;
      }
    }
    if (epCount < 1) epCount = 1;
    var episodes = [];
    for (var e = 1; e <= epCount; e++) {
      episodes.push(_s(29) + e + _s(7) + vid + _s(54) + e);
    }
    return {
      list: [
        {
          vod_id: vid,
          vod_name: meta.vod_name,
          vod_pic: meta.vod_pic,
          vod_content: meta.vod_content || meta.vod_name,
          vod_play_from: _s(17),
          vod_play_url: episodes.join(_s(43)),
          vod_remarks: _s(9) + epCount + _s(1),
        },
      ],
    };
  }

  function playerContent(flag, id, vipFlags) {
    var val = String(id || _s(57)).trim();
    if (val.indexOf(_s(45)) >= 0) {
      var parts = val.split(_s(45));
      val = parts[parts.length - 1].trim();
    }
    if (isVideoFormat(val) && /^https?:\/\//i.test(val)) {
      return { parse: 0, url: val, header: playHeaders() };
    }
    var vid = _s(57);
    var ep = _s(39);
    var m = /(?:\/play\/)?(\d+)\/(\d+)/.exec(val);
    if (m) {
      vid = m[1];
      ep = m[2];
    } else {
      var m2 = /(\d+)/.exec(val);
      if (m2) vid = m2[1];
    }
    if (!vid) return { parse: 0, url: _s(57), msg: _s(5) };
    var page = _s(25) + vid + _s(54) + ep + _s(54);
    var html = httpGet(page);
    var m3u8 = extractM3u8(html);
    if (m3u8) {
      return { parse: 0, url: m3u8, header: playHeaders() };
    }
    return { parse: 1, url: fullUrl(page), header: playHeaders() };
  }

  return {
    init: init,
    homeContent: homeContent,
    homeVideoContent: homeVideoContent,
    categoryContent: categoryContent,
    detailContent: detailContent,
    searchContent: searchContent,
    playerContent: playerContent,
    home: function (f) {
      return JSON.stringify(homeContent(f));
    },
    homeVod: function () {
      return JSON.stringify(homeVideoContent());
    },
    category: function (tid, pg, filter, extend) {
      return JSON.stringify(categoryContent(tid, pg, filter, extend));
    },
    detail: function (ids) {
      return JSON.stringify(detailContent(ids));
    },
    search: function (key, quick, pg) {
      return JSON.stringify(searchContent(key, quick, pg));
    },
    play: function (flag, id, vipFlags) {
      return JSON.stringify(playerContent(flag, id, vipFlags));
    },
    getName: function () {
      return _s(17);
    },
    getDependence: function () {
      return [];
    },
    isVideoFormat: isVideoFormat,
    isVideo: isVideoFormat,
    manualVideoCheck: function () {
      return false;
    },
    action: function () {},
    destroy: function () {},
    live: function () {
      return _s(52);
    },
    sniffer: function () {
      return false;
    },
  };
}

export default createSpider;
