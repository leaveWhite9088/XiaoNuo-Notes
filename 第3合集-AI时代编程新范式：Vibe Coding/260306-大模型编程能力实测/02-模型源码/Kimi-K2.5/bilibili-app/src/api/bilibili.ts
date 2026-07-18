// Bilibili API 封装
import axios from 'axios';
import type { VideoInfo, VideoUrl, Comment, Danmaku, UserInfo, FavoriteItem, SearchResult } from '../types';

const API_BASE = 'https://api.bilibili.com';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// 获取推荐视频
export const getRecommendVideos = async (_page = 1, pagesize = 20): Promise<VideoInfo[]> => {
  try {
    const response = await apiClient.get('/x/web-interface/index/feed/rcmd', {
      params: { ps: pagesize, fresh_type: 3 },
    });
    if (response.data?.data?.item) {
      return response.data.data.item.map((item: any) => ({
        bvid: item.bvid,
        aid: item.id,
        title: item.title,
        description: item.desc || '',
        pic: item.pic,
        duration: item.duration,
        owner: {
          mid: item.owner?.mid || item.mid,
          name: item.owner?.name || item.name,
          face: item.owner?.face || '',
        },
        stat: {
          view: item.stat?.view || 0,
          danmaku: item.stat?.danmaku || 0,
          reply: item.stat?.reply || 0,
          favorite: item.stat?.favorite || 0,
          coin: item.stat?.coin || 0,
          share: item.stat?.share || 0,
          like: item.stat?.like || 0,
        },
        pubdate: item.pubdate || Date.now() / 1000,
      }));
    }
    return [];
  } catch (error) {
    console.error('获取推荐视频失败:', error);
    return [];
  }
};

// 获取视频详情
export const getVideoInfo = async (bvid: string): Promise<VideoInfo | null> => {
  try {
    const response = await apiClient.get('/x/web-interface/view', {
      params: { bvid },
    });
    if (response.data?.data) {
      const data = response.data.data;
      return {
        bvid: data.bvid,
        aid: data.aid,
        title: data.title,
        description: data.desc,
        pic: data.pic,
        duration: data.duration,
        owner: {
          mid: data.owner.mid,
          name: data.owner.name,
          face: data.owner.face,
        },
        stat: {
          view: data.stat.view,
          danmaku: data.stat.danmaku,
          reply: data.stat.reply,
          favorite: data.stat.favorite,
          coin: data.stat.coin,
          share: data.stat.share,
          like: data.stat.like,
        },
        pubdate: data.pubdate,
      };
    }
    return null;
  } catch (error) {
    console.error('获取视频详情失败:', error);
    return null;
  }
};

// 获取视频播放地址
export const getVideoUrl = async (bvid: string, cid: number, quality = 80): Promise<VideoUrl[]> => {
  try {
    const response = await apiClient.get('/x/player/playurl', {
      params: {
        bvid,
        cid,
        qn: quality,
        fnver: 0,
        fnval: 80,
        fourk: 1,
      },
    });
    if (response.data?.data?.durl) {
      return response.data.data.durl.map((item: any) => ({
        url: item.url,
        quality: response.data.data.quality,
        format: response.data.data.format,
      }));
    }
    return [];
  } catch (error) {
    console.error('获取视频地址失败:', error);
    return [];
  }
};

// 获取视频cid
export const getVideoCid = async (bvid: string): Promise<number | null> => {
  try {
    const response = await apiClient.get('/x/player/pagelist', {
      params: { bvid },
    });
    if (response.data?.data?.[0]) {
      return response.data.data[0].cid;
    }
    return null;
  } catch (error) {
    console.error('获取cid失败:', error);
    return null;
  }
};

// 获取评论列表
export const getComments = async (aid: number, page = 1, type = 1): Promise<Comment[]> => {
  try {
    const response = await apiClient.get('/x/v2/reply', {
      params: {
        oid: aid,
        type,
        pn: page,
        sort: 2,
      },
    });
    if (response.data?.data?.replies) {
      return response.data.data.replies;
    }
    return [];
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
};

// 发送评论
export const sendComment = async (aid: number, message: string, type = 1): Promise<boolean> => {
  try {
    const csrf = localStorage.getItem('bilibili_csrf') || '';
    const response = await apiClient.post('/x/v2/reply/add', {
      oid: aid,
      type,
      message,
      csrf,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data?.code === 0;
  } catch (error) {
    console.error('发送评论失败:', error);
    return false;
  }
};

// 获取弹幕
export const getDanmaku = async (cid: number): Promise<Danmaku[]> => {
  try {
    const response = await axios.get(`https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`, {
      responseType: 'text',
    });
    // 解析XML弹幕
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, 'text/xml');
    const danmakus = xmlDoc.querySelectorAll('d');
    
    return Array.from(danmakus).map((d) => {
      const attr = d.getAttribute('p')?.split(',') || [];
      return {
        id: attr[0] || '',
        time: parseFloat(attr[0]) || 0,
        mode: parseInt(attr[1]) || 1,
        size: parseInt(attr[2]) || 25,
        color: parseInt(attr[3]) || 16777215,
        timestamp: parseInt(attr[4]) || 0,
        pool: parseInt(attr[5]) || 0,
        author: attr[6] || '',
        text: d.textContent || '',
      };
    });
  } catch (error) {
    console.error('获取弹幕失败:', error);
    return [];
  }
};

// 发送弹幕
export const sendDanmaku = async (cid: number, message: string, time: number, mode = 1): Promise<boolean> => {
  try {
    const csrf = localStorage.getItem('bilibili_csrf') || '';
    const response = await apiClient.post('/x/v2/dm/post', {
      oid: cid,
      msg: message,
      progress: Math.floor(time * 1000),
      mode,
      fontsize: 25,
      color: 16777215,
      csrf,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data?.code === 0;
  } catch (error) {
    console.error('发送弹幕失败:', error);
    return false;
  }
};

// 获取用户信息
export const getUserInfo = async (mid?: number): Promise<UserInfo | null> => {
  try {
    const url = mid 
      ? `/x/space/acc/info?mid=${mid}`
      : '/x/member/web/account/info';
    const response = await apiClient.get(url);
    if (response.data?.data) {
      const data = response.data.data;
      return {
        mid: data.mid,
        name: data.name,
        face: data.face,
        level: data.level,
        sign: data.sign || '',
        coins: data.coins || 0,
        following: data.following || 0,
        follower: data.follower || 0,
      };
    }
    return null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

// 获取收藏列表
export const getFavorites = async (mid: number): Promise<FavoriteItem[]> => {
  try {
    const response = await apiClient.get('/x/v3/fav/folder/created/list-all', {
      params: { up_mid: mid },
    });
    if (response.data?.data?.list) {
      return response.data.data.list.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        cover: item.cover,
        intro: item.intro,
        cnt: item.media_count,
      }));
    }
    return [];
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return [];
  }
};

// 获取收藏夹视频
export const getFavoriteVideos = async (mediaId: number): Promise<VideoInfo[]> => {
  try {
    const response = await apiClient.get('/x/v3/fav/resource/list', {
      params: {
        media_id: mediaId,
        pn: 1,
        ps: 20,
      },
    });
    if (response.data?.data?.medias) {
      return response.data.data.medias.map((item: any) => ({
        bvid: item.bvid,
        aid: item.id,
        title: item.title,
        description: item.intro,
        pic: item.cover,
        duration: item.duration,
        owner: {
          mid: item.upper?.mid || 0,
          name: item.upper?.name || '',
          face: item.upper?.face || '',
        },
        stat: {
          view: item.cnt?.play || 0,
          danmaku: item.cnt?.danmaku || 0,
          reply: 0,
          favorite: 0,
          coin: 0,
          share: 0,
          like: 0,
        },
        pubdate: item.pubtime,
      }));
    }
    return [];
  } catch (error) {
    console.error('获取收藏视频失败:', error);
    return [];
  }
};

// 搜索视频
export const searchVideos = async (keyword: string, page = 1): Promise<SearchResult> => {
  try {
    const response = await apiClient.get('/x/web-interface/search/type', {
      params: {
        keyword,
        search_type: 'video',
        page,
      },
    });
    if (response.data?.data?.result) {
      const results = response.data.data.result.map((item: any) => ({
        bvid: item.bvid,
        aid: item.id,
        title: item.title.replace(/<[^>]+>/g, ''),
        description: item.description,
        pic: item.pic,
        duration: item.duration,
        owner: {
          mid: item.mid,
          name: item.author,
          face: '',
        },
        stat: {
          view: item.play,
          danmaku: item.video_review,
          reply: 0,
          favorite: item.favorites,
          coin: 0,
          share: 0,
          like: item.like,
        },
        pubdate: item.pubdate,
      }));
      return {
        result: results,
        numPages: response.data.data.numPages,
        numResults: response.data.data.numResults,
      };
    }
    return { result: [], numPages: 0, numResults: 0 };
  } catch (error) {
    console.error('搜索视频失败:', error);
    return { result: [], numPages: 0, numResults: 0 };
  }
};

// 检查登录状态
export const checkLoginStatus = async (): Promise<{ isLogin: boolean; userInfo?: UserInfo }> => {
  try {
    const response = await apiClient.get('/x/web-interface/nav');
    if (response.data?.data?.isLogin) {
      const data = response.data.data;
      return {
        isLogin: true,
        userInfo: {
          mid: data.mid,
          name: data.uname,
          face: data.face,
          level: data.level_info?.current_level || 0,
          sign: data.sign || '',
          coins: data.money || 0,
          following: 0,
          follower: 0,
        },
      };
    }
    return { isLogin: false };
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return { isLogin: false };
  }
};
