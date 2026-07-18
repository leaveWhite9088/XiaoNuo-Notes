const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');

wrapper(axios);

class Bilibili {
  constructor(cookies = {}) {
    this.jar = new tough.CookieJar();
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.bilibili.com',
      'Origin': 'https://www.bilibili.com'
    };
    
    if (cookies) {
      Object.entries(cookies).forEach(([key, value]) => {
        this.jar.setCookieSync(`${key}=${value}`, 'https://www.bilibili.com');
      });
    }

    this.api = axios.create({
      jar: this.jar,
      withCredentials: true,
      headers: this.headers,
      baseURL: 'https://www.bilibili.com'
    });

    this.mainApi = axios.create({
      jar: this.jar,
      withCredentials: true,
      headers: this.headers,
      baseURL: 'https://api.bilibili.com'
    });
  }

  async getVideoDetail(bvid) {
    const res = await this.api.get(`/video/${bvid}`);
    const html = res.data;
    
    const playInfoMatch = html.match(/window\.__playinfo__\s*=\s*({.+?})/);
    const videoInfoMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
    
    if (!videoInfoMatch) {
      throw new Error('Failed to fetch video info');
    }

    const videoInfo = JSON.parse(videoInfoMatch[1]);
    const videoData = videoInfo.videoData;

    let playUrl = null;
    if (playInfoMatch) {
      try {
        const playInfo = JSON.parse(playInfoMatch[1]);
        const video = playInfo.data.dash.video[0];
        playUrl = video.baseUrl || video.base_url;
      } catch (e) {
        playUrl = null;
      }
    }

    return {
      bvid: videoData.bvid,
      aid: videoData.aid,
      title: videoData.title,
      desc: videoData.desc,
      cover: videoData.pic,
      owner: videoData.owner,
      stat: videoData.stat,
      pubdate: videoData.pubdate,
      tname: videoData.tname,
     cid: videoData.cid,
      duration: videoData.duration,
      playUrl
    };
  }

  async getRecommendVideos() {
    const res = await this.api.get('/index/icon/channel');
    const html = res.data;
    const match = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
    
    if (!match) {
      return await this.getPopularVideos();
    }

    const data = JSON.parse(match[1]);
    return data?.misc?.item?.list || [];
  }

  async getPopularVideos() {
    const res = await this.mainApi.get('/x/web-interface/popular', {
      params: { ps: 20, pn: 1 }
    });
    return res.data.data.list || [];
  }

  async getRegionVideos(rid) {
    const res = await this.mainApi.get('/x/web-interface/ranking/v2', {
      params: { rid, type: 'origin' }
    });
    return res.data.data.list || [];
  }

  async getLoginQRCode() {
    const res = await this.mainApi.post('/x/passport-login/web/qrcode/generate', {}, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return {
      qrcodeUrl: res.data.data.url,
      oauthKey: res.data.data.oauth_key,
      qrcodeKey: res.data.data.qrcode_key
    };
  }

  async getLoginStatus(qrcodeKey) {
    const res = await this.mainApi.get('/x/passport-login/web/qrcode/poll', {
      params: { qrcode_key: qrcodeKey }
    });
    
    const data = res.data.data;
    
    if (data.code === 0 && data.is_login) {
      const cookies = {};
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        setCookie.forEach(cookie => {
          const match = cookie.match(/(\w+)=([^;]+)/);
          if (match) {
            cookies[match[1]] = match[2];
          }
        });
      }
      return { isLogin: true, cookies };
    }
    
    return { isLogin: data.is_login || false, code: data.code };
  }

  async getUserInfo() {
    const res = await this.mainApi.get('/x/space/myinfo');
    return res.data.data;
  }

  async getComments(bvid, sort = 0, page = 1, pageSize = 20) {
    const videoInfo = await this.getVideoDetail(bvid);
    const res = await this.mainApi.get('/x/v2/reply/wbi/main', {
      params: {
        oid: videoInfo.aid,
        type: 1,
        sort,
        ps: pageSize,
        pn: page
      }
    });
    return res.data.data;
  }

  async sendComment(bvid, message, replyId = 0) {
    const videoInfo = await this.getVideoDetail(bvid);
    const res = await this.mainApi.post('/x/v2/reply/add', null, {
      params: {
        type: 1,
        oid: videoInfo.aid,
        message,
        plat: 1,
        reply_id: replyId
      }
    });
    return res.data.data;
  }

  async replyComment(bvid, rootId, message) {
    return this.sendComment(bvid, message, rootId);
  }

  async likeComment(bvid, rpid, action = 1) {
    const videoInfo = await this.getVideoDetail(bvid);
    await this.mainApi.post('/x/v2/reply/action', null, {
      params: {
        type: 1,
        oid: videoInfo.aid,
        rpid,
        action
      }
    });
    return { success: true };
  }

  async getDanmaku(bvid) {
    const videoInfo = await this.getVideoDetail(bvid);
    const res = await this.api.get(`https://comment.bilibili.com/${videoInfo.cid}.xml`);
    
    const parser = require('xml2js');
    const result = await parser.parseStringPromise(res.data);
    
    return (result.i.d || []).map(item => ({
      p: item.$.p,
      content: item._
    }));
  }

  async sendDanmaku(bvid, content, progress, mode = 1, color = 16777215, fontsize = 25) {
    const videoInfo = await this.getVideoDetail(bvid);
    const res = await this.mainApi.post('/x/v2/dm/post', null, {
      params: {
        type: 1,
        oid: videoInfo.aid,
        content: Buffer.from(content).toString('base64'),
        progress: progress * 1000,
        mode,
        color,
        fontsize,
        random: 16,
        plat: 1,
        spmid: 'main.ugc-video-detail.0.0'
      }
    });
    return res.data.data;
  }

  async getDanmakuConfig(bvid) {
    const videoInfo = await this.getVideoDetail(bvid);
    const res = await this.mainApi.get('/x/v2/dm/web/view', {
      params: { oid: videoInfo.aid, type: 1 }
    });
    return res.data.data;
  }

  async getUserFavorites() {
    const res = await this.mainApi.get('/x/v3/fav/folder/created/list-all');
    return res.data.data.count || 0;
  }

  async getFavoriteVideos(mediaId, page = 1, pageSize = 20) {
    const res = await this.mainApi.get('/x/v3/fav/resource/list', {
      params: {
        media_id: mediaId,
        pn: page,
        ps: pageSize,
        order: 'mtime'
      }
    });
    return res.data.data;
  }

  async getFavoriteFolders() {
    const res = await this.mainApi.get('/x/v3/fav/folder/created/list-all');
    return res.data.data.list || [];
  }

  async manageFavorite(avid, addMediaIds = [], cancelMediaIds = []) {
    const res = await this.mainApi.post('/x/v3/fav/resource/deal', null, {
      params: {
        aid: avid,
        add_media_ids: addMediaIds.join(','),
        del_media_ids: cancelMediaIds.join(','),
        platform: 'web'
      }
    });
    return res.data.data;
  }

  async search(keyword, page = 1, pagesize = 20) {
    const res = await this.mainApi.get('/x/web-interface/search/type', {
      params: {
        search_type: 'video',
        keyword,
        page,
        pagesize
      }
    });
    return res.data.data;
  }

  async getSearchSuggestion(term) {
    const res = await this.mainApi.get('/x/web-interface/search/suggestion', {
      params: { term }
    });
    return res.data.data;
  }
}

module.exports = { Bilibili };
