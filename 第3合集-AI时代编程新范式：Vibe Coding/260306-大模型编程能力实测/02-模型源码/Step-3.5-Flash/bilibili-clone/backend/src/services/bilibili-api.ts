import bilibili from 'bilibili-api';
import {
  VideoInfo,
  VideoPlayUrl,
  Comment,
  Danmaku,
  UserInfo,
  UserFavorites,
  LoginResult,
  DanmakuSendResult,
  CommentSendResult
} from '../types';

let apiInstance: any = null;

export class BilibiliApiService {
  private cookie: string = '';
  private csrf: string = '';

  private async ensureApiReady() {
    if (!apiInstance) {
      apiInstance = await bilibili;
      this.api = apiInstance;
      if (this.cookie && this.csrf) {
        this.api.config.cookie = this.cookie;
        this.api.config.csrf = this.csrf;
      }
    }
    return apiInstance;
  }

  private api: any = null;

  setAuth(cookie: string, csrf: string) {
    this.cookie = cookie;
    this.csrf = csrf;
    if (this.api) {
      this.api.config.cookie = cookie;
      this.api.config.csrf = csrf;
    }
  }

  clearAuth() {
    this.cookie = '';
    this.csrf = '';
    if (this.api) {
      this.api.config.cookie = '';
      this.api.config.csrf = '';
    }
  }

  isAuthenticated(): boolean {
    return !!this.cookie && !!this.csrf;
  }

  async getVideoInfo(bvid: string): Promise<VideoInfo> {
    await this.ensureApiReady();
    const info = await this.api.video.getInfo(bvid);
    return {
      bvid: info.bvid,
      aid: info.aid,
      title: info.title,
      description: info.desc,
      cover: info.pic,
      owner: {
        mid: info.owner.mid,
        name: info.owner.name,
        face: info.owner.face
      },
      stat: {
        view: info.stat.view,
        danmaku: info.stat.danmaku,
        reply: info.stat.reply,
        favorite: info.stat.favorite,
        coin: info.stat.coin,
        share: info.stat.share,
        like: info.stat.like
      },
      duration: info.duration,
      pubdate: info.pubdate,
      tname: info.tname,
      videos: info.videos,
      cid: info.cid,
      pages: info.pages || (info.cid ? [{ cid: info.cid }] : [])
    };
  }

  async getVideoPlayUrl(bvid: string, cid: number, quality?: number): Promise<VideoPlayUrl> {
    await this.ensureApiReady();
    const playUrl = await this.api.video.getPlayUrl(bvid, cid, quality);
    return playUrl as VideoPlayUrl;
  }

  async getRelatedVideos(bvid: string): Promise<VideoInfo[]> {
    await this.ensureApiReady();
    const related = await this.api.video.getRelated(bvid);
    return related.map((item: any) => ({
      bvid: item.bvid,
      aid: item.aid,
      title: item.title,
      description: item.desc,
      cover: item.pic,
      owner: {
        mid: item.owner.mid,
        name: item.owner.name,
        face: item.owner.face
      },
      stat: {
        view: item.stat.view,
        danmaku: item.stat.danmaku,
        reply: item.stat.reply,
        favorite: item.stat.favorite,
        coin: item.stat.coin,
        share: item.stat.share,
        like: item.stat.like
      },
      duration: item.duration,
      pubdate: item.pubdate,
      tname: item.tname,
      videos: item.videos
    }));
  }

  async searchVideos(keyword: string, page: number = 1): Promise<VideoInfo[]> {
    await this.ensureApiReady();
    const result = await this.api.video.search(keyword, { page });
    return result.result.map((item: any) => ({
      bvid: item.bvid,
      aid: item.aid,
      title: item.title,
      description: item.description,
      cover: item.pic,
      owner: {
        mid: item.owner.mid,
        name: item.owner.name,
        face: item.owner.face
      },
      stat: {
        view: item.stat.view,
        danmaku: item.stat.danmaku,
        reply: item.stat.reply,
        favorite: item.stat.favorite,
        coin: item.stat.coin,
        share: item.stat.share,
        like: item.stat.like
      },
      duration: item.duration,
      pubdate: item.pubdate,
      tname: item.tname,
      videos: item.videos
    }));
  }

  async getPopularVideos(ps: number = 30): Promise<VideoInfo[]> {
    await this.ensureApiReady();
    const result = await this.api.video.getPopular(ps);
    return result.map((item: any) => ({
      bvid: item.bvid,
      aid: item.aid,
      title: item.title,
      description: item.desc,
      cover: item.pic,
      owner: {
        mid: item.owner.mid,
        name: item.owner.name,
        face: item.owner.face
      },
      stat: {
        view: item.stat.view,
        danmaku: item.stat.danmaku,
        reply: item.stat.reply,
        favorite: item.stat.favorite,
        coin: item.stat.coin,
        share: item.stat.share,
        like: item.stat.like
      },
      duration: item.duration,
      pubdate: item.pubdate,
      tname: item.tname,
      videos: item.videos
    }));
  }

  async getComments(bvid: string, page: number = 1, sort: number = 0): Promise<{
    list: Comment[];
    page: number;
    pageSize: number;
    total: number;
  }> {
    await this.ensureApiReady();
    const comments = await this.api.video.getComments(bvid, { page, sort });
    return {
      list: comments.replies.map((comment: any) => this.mapComment(comment)),
      page: comments.page,
      pageSize: comments.pageSize,
      total: comments.total
    };
  }

  private mapComment(comment: any): Comment {
    return {
      rpid: comment.rpid,
      oid: comment.oid,
      bvid: comment.bvid,
      mid: comment.mid,
      content: comment.content.message,
      ctime: comment.ctime,
      like: comment.like,
      count: comment.count,
      rcount: comment.rcount,
      up_like: comment.up_like,
      up_action: comment.up_action,
      member: {
        mid: comment.member.mid,
        uname: comment.member.uname,
        avatar: comment.member.avatar,
        level_info: comment.member.level_info,
        pendant: comment.member.pendant,
        nickname: comment.member.nickname,
        sig: comment.member.sign
      },
      replies: comment.replies ? comment.replies.map((r: any) => this.mapComment(r)) : undefined,
      show_follow: comment.show_follow,
      assist: comment.assist,
      is_up: comment.is_up
    };
  }

  async sendComment(bvid: string, content: string, replyId?: number): Promise<CommentSendResult> {
    await this.ensureApiReady();
    if (!this.isAuthenticated()) {
      return { code: -1, message: '请先登录' };
    }
    const result = await this.api.video.sendComment(bvid, content, replyId);
    return result as CommentSendResult;
  }

  async likeComment(rpid: number, type: 'add' | 'cancel' = 'add'): Promise<{ code: number }> {
    await this.ensureApiReady();
    if (!this.isAuthenticated()) {
      return { code: -1 };
    }
    const result = await this.api.video.likeComment(rpid, type);
    return result;
  }

  async getDanmaku(bvid: string, cid: number): Promise<Danmaku[]> {
    await this.ensureApiReady();
    const danmakuList = await this.api.video.getDanmaku(bvid, cid);
    return danmakuList.map((item: any) => ({
      id: item.id,
      cid: item.cid,
      mid: item.mid,
      name: item.name,
      content: item.content,
      date: item.date,
      action: item.action,
      mode: item.mode,
      color: item.color,
      fontsize: item.fontsize,
      pool: item.pool,
      shadow: item.shadow
    }));
  }

  async sendDanmaku(bvid: string, cid: number, content: string, time: number, color?: number): Promise<DanmakuSendResult> {
    await this.ensureApiReady();
    if (!this.isAuthenticated()) {
      return { code: -1, message: '请先登录' };
    }
    const result = await this.api.video.sendDanmaku(bvid, cid, content, time, color);
    return result as DanmakuSendResult;
  }

  async login(username: string, password: string): Promise<LoginResult> {
    await this.ensureApiReady();
    try {
      const result = await this.api.login(username, password);
      return result as LoginResult;
    } catch (error: any) {
      return {
        code: -1,
        message: error.message || '登录失败',
        cookie: '',
        csrf: ''
      };
    }
  }

  async getUserInfo(mid?: number): Promise<UserInfo> {
    await this.ensureApiReady();
    const info = mid ? await this.api.user.getInfo(mid) : await this.api.user.getInfo();
    const levelInfo = info.level_info || { current_level: 0 };
    const vipInfo = info.vip || { type: 0, status: 0, due_date: 0 };
    const pendantInfo = info.pendant || { pid: 0, image: '' };

    return {
      mid: info.mid,
      name: info.name,
      face: info.face,
      top_photo: info.top_photo || '',
      sign: info.sign || '',
      level: levelInfo.current_level,
      coins: info.coins || 0,
      vip: vipInfo,
      pendant: pendantInfo,
      album_count: info.album_count || 0,
      article_count: info.article_count || 0,
      following: info.following || 0,
      follower: info.follower || 0,
      video_count: info.video_count || 0,
      favourite_count: info.favourite_count || 0,
      black_count: info.black_count || 0,
      tag: info.tag || [],
      is_host_bili: info.is_host_bili || false,
      is_followed: info.is_followed || false
    };
  }

  async getUserFavorites(mid: number): Promise<UserFavorites[]> {
    await this.ensureApiReady();
    const favorites = await this.api.user.getFavorites(mid);
    return favorites.list.map((fav: any) => ({
      fid: fav.fid,
      mid: fav.mid,
      title: fav.title,
      upper: {
        mid: fav.upper.mid,
        name: fav.upper.name
      },
      media_count: fav.media_count,
      cover: fav.cover,
      member_count: fav.member_count,
      type: fav.type
    }));
  }

  async getFavoriteVideos(fid: number, page: number = 1): Promise<VideoInfo[]> {
    await this.ensureApiReady();
    const result = await this.api.user.getFavoriteVideos(fid, { page });
    return result.medias.map((video: any) => ({
      bvid: video.bvid,
      aid: video.id,
      title: video.title,
      description: video.intro || video.title,
      cover: video.cover,
      owner: {
        mid: video.upper.mid,
        name: video.upper.name,
        face: video.upper.face || ''
      },
      stat: {
        view: video.play,
        danmaku: video.danmaku,
        reply: video.reply,
        favorite: video.favorite,
        coin: video.coin,
        share: video.share,
        like: video.like
      },
      duration: video.duration,
      pubdate: video.upper.pubdate ? Math.floor(new Date(video.upper.pubdate).getTime() / 1000) : Date.now() / 1000,
      tname: video.tname || '综合',
      videos: video.videos || 1
    }));
  }

  async isFavoriteVideo(aid: number): Promise<boolean> {
    await this.ensureApiReady();
    try {
      const result = await this.api.user.isFavoriteVideo(aid);
      return result.data?.fav_cnt > 0 || false;
    } catch {
      return false;
    }
  }

  async toggleFavorite(aid: number, fid: number): Promise<{ code: number }> {
    await this.ensureApiReady();
    if (!this.isAuthenticated()) {
      return { code: -1 };
    }
    const result = await this.api.user.toggleFavorite(aid, fid);
    return result;
  }
}

export const bilibiliApi = new BilibiliApiService();