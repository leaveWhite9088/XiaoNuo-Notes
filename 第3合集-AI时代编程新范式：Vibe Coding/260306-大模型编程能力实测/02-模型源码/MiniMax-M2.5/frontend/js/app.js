const API_BASE = 'http://localhost:5001';

const app = Vue.createApp({
    data() {
        return {
            currentView: 'home',
            pageTitle: '首页',
            searchKeyword: '',
            videoList: [],
            searchResults: [],
            favorites: [],
            relatedVideos: [],
            comments: [],
            currentVideo: {},
            userInfo: null,
            userStats: {},
            showLoginModal: false,
            showUserPanel: false,
            loginMethod: 'qrcode',
            qrcodeUrl: '',
            qrcodeAuthcode: '',
            sessdataInput: '',
            newComment: '',
            danmakuText: '',
            danmakuEnabled: true,
            showDanmaku: true,
            isFavorited: false,
            loading: false,
            qrcodeCheckInterval: null
        }
    },
    mounted() {
        this.loadHotVideos();
        this.checkLoginStatus();
    },
    methods: {
        async apiRequest(endpoint, options = {}) {
            try {
                const response = await fetch(`${API_BASE}${endpoint}`, {
                    ...options,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    }
                });
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('API Error:', error);
                return { success: false, error: error.message };
            }
        },

        goHome() {
            this.currentView = 'home';
            this.pageTitle = '首页';
            this.loadHotVideos();
        },

        async showHot() {
            this.currentView = 'hot';
            this.pageTitle = '热门视频';
            await this.loadHotVideos();
        },

        async showRank() {
            this.currentView = 'rank';
            this.pageTitle = '排行榜';
            await this.loadRankVideos();
        },

        async loadHotVideos() {
            this.loading = true;
            const result = await this.apiRequest('/api/hot/videos');
            if (result.success) {
                this.videoList = result.data.list || result.data || [];
            }
            this.loading = false;
        },

        async loadRankVideos() {
            this.loading = true;
            const result = await this.apiRequest('/api/rank');
            if (result.success) {
                this.videoList = result.data.list || [];
            }
            this.loading = false;
        },

        async searchVideos() {
            if (!this.searchKeyword.trim()) return;
            this.currentView = 'search';
            this.pageTitle = `搜索: ${this.searchKeyword}`;
            this.loading = true;
            const result = await this.apiRequest(`/api/search?keyword=${encodeURIComponent(this.searchKeyword)}`);
            if (result.success) {
                this.searchResults = result.data.result || [];
            }
            this.loading = false;
        },

        async playVideo(video) {
            this.currentView = 'player';
            this.currentVideo = video;
            this.showDanmaku = true;
            
            const result = await this.apiRequest(`/api/video/info?bvid=${video.bvid}`);
            if (result.success) {
                const playUrl = result.data.play_url;
                if (playUrl.durl && playUrl.durl[0]) {
                    const videoEl = document.getElementById('biliPlayer');
                    if (videoEl) {
                        videoEl.src = playUrl.durl[0].url;
                    }
                }
                this.currentVideo = { ...video, ...result.data.info };
            }

            const relatedResult = await this.apiRequest(`/api/related?bvid=${video.bvid}`);
            if (relatedResult.success) {
                this.relatedVideos = relatedResult.data || [];
            }

            await this.loadComments();
        },

        async loadComments() {
            const result = await this.apiRequest(`/api/video/comments?bvid=${this.currentVideo.bvid}`);
            if (result.success) {
                this.comments = this.formatComments(result.data.list || []);
            }
        },

        formatComments(list) {
            return list.map(c => ({
                rpid: c.rpid,
                uname: c.member.uname,
                avatar: c.member.avatar,
                content: c.content.message,
                ctime: this.formatTime(c.ctime),
                like: c.like,
                rcount: c.rcount
            }));
        },

        goBack() {
            this.currentView = 'home';
            const videoEl = document.getElementById('biliPlayer');
            if (videoEl) {
                videoEl.pause();
                videoEl.src = '';
            }
        },

        async checkLoginStatus() {
            const result = await this.apiRequest('/api/user/info');
            if (result.success) {
                this.userInfo = result.data;
                this.loadUserStats();
            }
        },

        async loadUserStats() {
            const result = await this.apiRequest('/api/user/stats');
            if (result.success) {
                this.userStats = result.data;
            }
        },

        async getQrcode() {
            const result = await this.apiRequest('/api/login/qrcode');
            if (result.success) {
                this.qrcodeUrl = result.data.url;
                this.qrcodeAuthcode = result.data.authcode;
                this.startQrcodeCheck();
            }
        },

        startQrcodeCheck() {
            if (this.qrcodeCheckInterval) {
                clearInterval(this.qrcodeCheckInterval);
            }
            this.qrcodeCheckInterval = setInterval(async () => {
                const result = await this.apiRequest(`/api/login/check?authcode=${this.qrcodeAuthcode}`);
                if (result.success && result.data.logged_in) {
                    clearInterval(this.qrcodeCheckInterval);
                    await this.loginWithSessdata(result.data.sessdata);
                }
            }, 2000);
        },

        async loginWithSessdata(sessdata) {
            let sess = sessdata || this.sessdataInput;
            if (!sess) return;
            
            const result = await this.apiRequest('/api/login/sessdata', {
                method: 'POST',
                body: JSON.stringify({ sessdata: sess })
            });
            
            if (result.success) {
                this.showLoginModal = false;
                this.userInfo = result.data;
                this.sessdataInput = '';
                this.loadUserStats();
            } else {
                alert(result.error || '登录失败');
            }
        },

        async logout() {
            await this.apiRequest('/api/logout', { method: 'POST' });
            this.userInfo = null;
            this.userStats = {};
            this.showUserPanel = false;
        },

        async sendComment() {
            if (!this.newComment.trim() || !this.userInfo) return;
            
            const result = await this.apiRequest('/api/comment/send', {
                method: 'POST',
                body: JSON.stringify({
                    oid: this.currentVideo.aid,
                    message: this.newComment,
                    type: 1
                })
            });
            
            if (result.success) {
                this.newComment = '';
                await this.loadComments();
            } else {
                alert(result.error || '发送失败');
            }
        },

        replyComment(comment) {
            if (!this.userInfo) {
                this.showLoginModal = true;
                return;
            }
            this.newComment = `@${comment.uname} `;
        },

        async sendDanmaku() {
            if (!this.danmakuText.trim() || !this.userInfo) return;
            
            const videoEl = document.getElementById('biliPlayer');
            const currentTime = videoEl ? Math.floor(videoEl.currentTime * 1000) : 0;
            
            const result = await this.apiRequest('/api/danmu/send', {
                method: 'POST',
                body: JSON.stringify({
                    cid: this.currentVideo.cid,
                    message: this.danmakuText,
                    position: currentTime
                })
            });
            
            if (result.success) {
                this.danmakuText = '';
            }
        },

        async toggleFavorite() {
            if (!this.userInfo) {
                this.showLoginModal = true;
                return;
            }
            
            if (this.isFavorited) {
                return;
            }
            
            const result = await this.apiRequest('/api/favorite/add', {
                method: 'POST',
                body: JSON.stringify({
                    bvid: this.currentVideo.bvid,
                    add_media_ids: [1]
                })
            });
            
            if (result.success) {
                this.isFavorited = true;
            }
        },

        async showFavorites() {
            this.showUserPanel = false;
            if (!this.userInfo) {
                this.showLoginModal = true;
                return;
            }
            
            this.currentView = 'favorites';
            this.pageTitle = '我的收藏';
            
            const result = await this.apiRequest('/api/favorite/list');
            if (result.success) {
                this.favorites = result.data.list || [];
            }
        },

        openInBrowser() {
            window.open(`https://www.bilibili.com/video/${this.currentVideo.bvid}`, '_blank');
        },

        formatNumber(num) {
            if (!num) return '0';
            if (num >= 10000) {
                return (num / 10000).toFixed(1) + '万';
            }
            return num.toString();
        },

        formatDuration(seconds) {
            if (!seconds) return '00:00';
            const min = Math.floor(seconds / 60);
            const sec = seconds % 60;
            return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        },

        formatTime(timestamp) {
            if (!timestamp) return '';
            const date = new Date(timestamp * 1000);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) return '刚刚';
            if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
            if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
            if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前';
            
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        }
    },
    watch: {
        showLoginModal(val) {
            if (val && this.loginMethod === 'qrcode') {
                this.getQrcode();
            }
        }
    },
    beforeUnmount() {
        if (this.qrcodeCheckInterval) {
            clearInterval(this.qrcodeCheckInterval);
        }
    }
});

app.mount('#app');
