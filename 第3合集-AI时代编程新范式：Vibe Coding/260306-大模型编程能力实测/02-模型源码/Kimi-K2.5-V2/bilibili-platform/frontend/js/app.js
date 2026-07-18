/**
 * Bilibili视频平台 - 前端核心逻辑
 */

// ============ 全局状态 ============
const state = {
    currentPage: 'home',
    isLoggedIn: false,
    userInfo: null,
    currentVideo: null,
    dp: null,  // DPlayer实例
    searchKeyword: '',
    commentMode: 3, // 3=热门, 2=最新
    currentFavoriteFolder: null,
    qrCheckInterval: null,
};

// API基础URL
const API_BASE = '';

// ============ 工具函数 ============

/**
 * 格式化数字
 */
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN');
}

/**
 * 格式化时长
 */
function formatDuration(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 显示Toast提示
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 显示/隐藏弹窗
 */
function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

/**
 * 切换页面
 */
function switchPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新导航状态
    document.querySelectorAll('.nav-item, .sidebar-menu a').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });
    
    state.currentPage = pageName;
    
    // 加载页面数据
    switch (pageName) {
        case 'home':
            loadHomeVideos();
            break;
        case 'popular':
            loadPopularVideos();
            break;
        case 'trending':
            loadTrendingVideos();
            break;
        case 'favorites':
            loadFavorites();
            break;
        case 'history':
            loadHistory();
            break;
    }
}

/**
 * 发送API请求
 */
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        return await response.json();
    } catch (error) {
        console.error('API请求失败:', error);
        return { success: false, message: '网络请求失败' };
    }
}

// ============ 用户认证 ============

/**
 * 获取登录状态
 */
async function checkAuthStatus() {
    const result = await apiRequest('/api/auth/status');
    if (result.success) {
        state.isLoggedIn = result.data.logged_in;
        state.userInfo = result.data.user_info;
        updateUserUI();
    }
}

/**
 * 更新用户UI
 */
function updateUserUI() {
    const guestState = document.getElementById('guestState');
    const userState = document.getElementById('userState');
    const userAvatar = document.getElementById('userAvatar');
    const commentAvatar = document.getElementById('commentAvatar');
    const username = document.getElementById('username');
    
    if (state.isLoggedIn && state.userInfo) {
        guestState.classList.add('hidden');
        userState.classList.remove('hidden');
        userAvatar.src = state.userInfo.face || 'https://i0.hdslb.com/bfs/face/member/noface.jpg';
        username.textContent = state.userInfo.name;
        if (commentAvatar) {
            commentAvatar.src = state.userInfo.face || 'https://i0.hdslb.com/bfs/face/member/noface.jpg';
        }
    } else {
        guestState.classList.remove('hidden');
        userState.classList.add('hidden');
        if (commentAvatar) {
            commentAvatar.src = 'https://i0.hdslb.com/bfs/face/member/noface.jpg';
        }
    }
}

/**
 * 生成登录二维码
 */
async function generateQRCode() {
    const result = await apiRequest('/api/auth/qrcode');
    if (result.success) {
        const qrImg = document.getElementById('qrCodeImg');
        qrImg.src = result.base64 || `data:image/png;base64,${result.qrcode}`;
        document.getElementById('qrStatus').textContent = '等待扫描...';
        
        // 开始轮询检查登录状态
        if (state.qrCheckInterval) {
            clearInterval(state.qrCheckInterval);
        }
        
        state.qrCheckInterval = setInterval(async () => {
            const checkResult = await apiRequest('/api/auth/qrcode/check');
            if (checkResult.success && checkResult.status === 'success') {
                clearInterval(state.qrCheckInterval);
                toggleModal('loginModal', false);
                showToast('登录成功', 'success');
                checkAuthStatus();
            } else if (checkResult.status === 'scanned') {
                document.getElementById('qrStatus').textContent = '已扫描，请在手机上确认';
            } else {
                document.getElementById('qrStatus').textContent = checkResult.message || '等待扫描...';
            }
        }, 2000);
    } else {
        showToast(result.message || '生成二维码失败', 'error');
    }
}

/**
 * 退出登录
 */
async function logout() {
    const result = await apiRequest('/api/auth/logout', { method: 'POST' });
    if (result.success) {
        state.isLoggedIn = false;
        state.userInfo = null;
        updateUserUI();
        showToast('已退出登录', 'info');
    }
}

// ============ 视频功能 ============

/**
 * 创建视频卡片HTML
 */
function createVideoCard(video) {
    const bvid = video.bvid;
    const title = video.title || '未知标题';
    const cover = video.pic || video.cover || '';
    const author = video.owner?.name || video.author || '未知UP';
    const views = formatNumber(video.stat?.view || video.play || 0);
    const danmaku = formatNumber(video.stat?.danmaku || video.video_review || 0);
    const duration = video.duration ? formatDuration(video.duration) : '';
    
    return `
        <div class="video-card" onclick="playVideo('${bvid}')">
            <div class="video-cover">
                <img src="${cover}" alt="${title}" loading="lazy">
                <div class="video-stats">
                    <span><i class="fas fa-play"></i> ${views}</span>
                    <span><i class="fas fa-comment-dots"></i> ${danmaku}</span>
                </div>
                ${duration ? `<span class="video-duration">${duration}</span>` : ''}
            </div>
            <div class="video-info">
                <div class="video-title" title="${title}">${title}</div>
                <div class="video-meta-row">
                    <span class="video-up"><i class="fas fa-user"></i> ${author}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * 加载首页推荐视频
 */
async function loadHomeVideos() {
    const container = document.getElementById('homeVideos');
    container.innerHTML = '<div class="loading">加载中...</div>';
    
    const result = await apiRequest('/api/home/videos');
    if (result.success) {
        const videos = result.data || [];
        container.innerHTML = videos.map(v => createVideoCard(v)).join('');
    } else {
        container.innerHTML = '<div class="error">加载失败</div>';
    }
}

/**
 * 加载热门视频
 */
async function loadPopularVideos() {
    const container = document.getElementById('popularVideos');
    container.innerHTML = '<div class="loading">加载中...</div>';
    
    const result = await apiRequest('/api/home/popular');
    if (result.success) {
        const videos = result.data?.list || [];
        container.innerHTML = videos.map(v => createVideoCard(v)).join('');
    } else {
        container.innerHTML = '<div class="error">加载失败</div>';
    }
}

/**
 * 加载排行榜
 */
async function loadTrendingVideos() {
    const container = document.getElementById('trendingVideos');
    container.innerHTML = '<div class="loading">加载中...</div>';
    
    const result = await apiRequest('/api/home/popular?page=1');
    if (result.success) {
        const videos = result.data?.list || [];
        container.innerHTML = videos.map((v, i) => createVideoListItem(v, i + 1)).join('');
    } else {
        container.innerHTML = '<div class="error">加载失败</div>';
    }
}

/**
 * 创建视频列表项
 */
function createVideoListItem(video, rank) {
    const bvid = video.bvid;
    const title = video.title || '未知标题';
    const cover = video.pic || video.cover || '';
    const author = video.owner?.name || video.author || '未知UP';
    const desc = video.desc || '';
    const views = formatNumber(video.stat?.view || video.play || 0);
    const danmaku = formatNumber(video.stat?.danmaku || video.video_review || 0);
    
    return `
        <div class="video-list-item" onclick="playVideo('${bvid}')">
            <div class="rank-num">${rank}</div>
            <div class="video-cover">
                <img src="${cover}" alt="${title}" loading="lazy">
            </div>
            <div class="video-info">
                <div class="video-title" title="${title}">${title}</div>
                <div class="video-desc">${desc}</div>
                <div class="video-stats-row">
                    <span><i class="fas fa-user"></i> ${author}</span>
                    <span><i class="fas fa-play"></i> ${views}</span>
                    <span><i class="fas fa-comment-dots"></i> ${danmaku}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * 播放视频
 */
async function playVideo(bvid) {
    // 获取视频信息
    const result = await apiRequest(`/api/video/info?bvid=${bvid}`);
    if (!result.success) {
        showToast('获取视频信息失败', 'error');
        return;
    }
    
    state.currentVideo = result.data;
    const video = result.data;
    
    // 更新页面标题
    document.title = video.title + ' - Bilibili';
    
    // 更新视频信息
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('viewCount').textContent = formatNumber(video.stat?.view || 0);
    document.getElementById('danmakuCount').textContent = formatNumber(video.stat?.danmaku || 0);
    document.getElementById('publishTime').textContent = formatTime(video.pubdate);
    document.getElementById('likeCount').textContent = formatNumber(video.stat?.like || 0);
    document.getElementById('favoriteCount').textContent = formatNumber(video.stat?.favorite || 0);
    
    // 更新UP主信息
    document.getElementById('upAvatar').src = video.owner?.face || '';
    document.getElementById('upName').textContent = video.owner?.name || '';
    document.getElementById('upDesc').textContent = 'UID: ' + (video.owner?.mid || '');
    
    // 更新B站链接
    document.getElementById('gotoBiliBtn').href = `https://www.bilibili.com/video/${bvid}`;
    
    // 获取在线人数
    const onlineResult = await apiRequest(`/api/video/online?bvid=${bvid}&cid=${video.cid}`);
    if (onlineResult.success) {
        document.getElementById('onlineCount').textContent = onlineResult.data?.total || 0;
    }
    
    // 销毁旧的播放器
    if (state.dp) {
        state.dp.destroy();
    }
    
    // 解析视频URL
    let videoUrl = '';
    if (video.download_url) {
        const dash = video.download_url.dash || {};
        if (dash.video && dash.video.length > 0) {
            videoUrl = dash.video[0].baseUrl || dash.video[0].url;
        }
    }
    
    // 如果没有获取到URL，使用B站官方播放器嵌入
    if (!videoUrl) {
        videoUrl = video.pages?.[0]?.url || '';
    }
    
    // 初始化DPlayer
    try {
        state.dp = new DPlayer({
            container: document.getElementById('dplayer'),
            video: {
                url: videoUrl || `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${video.cid}&qn=80`,
                type: 'auto'
            },
            danmaku: {
                id: bvid,
                api: '',
                addition: [],
                user: state.userInfo?.name || '游客'
            },
            contextmenu: [
                {
                    text: 'Bilibili视频平台',
                    link: '#'
                }
            ]
        });
    } catch (e) {
        // 降级到iframe嵌入
        document.getElementById('dplayer').innerHTML = `
            <iframe 
                src="https://player.bilibili.com/player.html?bvid=${bvid}&cid=${video.cid}&page=1&high_quality=1&danmaku=1" 
                scrolling="no" 
                border="0" 
                frameborder="no" 
                framespacing="0" 
                allowfullscreen="true"
                style="width: 100%; height: 100%;">
            </iframe>
        `;
    }
    
    // 加载评论
    loadComments(video.aid);
    
    // 加载相关视频
    loadRelatedVideos(bvid);
    
    // 切换到视频页面
    switchPage('video');
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

/**
 * 加载评论
 */
async function loadComments(oid, page = 1) {
    const result = await apiRequest(`/api/comment/list?oid=${oid}&type_=1&page=${page}&mode=${state.commentMode}`);
    const container = document.getElementById('commentsList');
    const countEl = document.getElementById('commentCount');
    
    if (result.success) {
        const replies = result.data?.replies || [];
        const pageInfo = result.data?.page || {};
        countEl.textContent = pageInfo.acount || replies.length;
        
        container.innerHTML = replies.map(reply => createCommentItem(reply)).join('');
    } else {
        container.innerHTML = '<div class="error">加载评论失败</div>';
    }
}

/**
 * 创建评论项HTML
 */
function createCommentItem(reply, isReply = false) {
    const member = reply.member || {};
    const content = reply.content?.message || '';
    const time = formatTime(reply.ctime);
    const like = formatNumber(reply.like || 0);
    const replies = reply.replies || [];
    
    let html = `
        <div class="${isReply ? 'reply-item' : 'comment-item'}">
            <div class="avatar">
                <img src="${member.avatar || 'https://i0.hdslb.com/bfs/face/member/noface.jpg'}" alt="${member.uname || ''}">
            </div>
            <div class="comment-content">
                <div class="comment-user">${member.uname || '未知用户'}</div>
                <div class="comment-text">${content}</div>
                <div class="comment-actions">
                    <span><i class="far fa-thumbs-up"></i> ${like}</span>
                    <span>回复</span>
                    <span>${time}</span>
                </div>
    `;
    
    // 添加回复列表
    if (!isReply && replies.length > 0) {
        html += '<div class="reply-list">';
        html += replies.map(r => createCommentItem(r, true)).join('');
        html += '</div>';
    }
    
    html += '</div></div>';
    return html;
}

/**
 * 发送评论
 */
async function sendComment() {
    if (!state.isLoggedIn) {
        showToast('请先登录', 'error');
        toggleModal('loginModal', true);
        generateQRCode();
        return;
    }
    
    const input = document.getElementById('commentInput');
    const message = input.value.trim();
    
    if (!message) {
        showToast('请输入评论内容', 'error');
        return;
    }
    
    if (!state.currentVideo) return;
    
    const result = await apiRequest('/api/comment/send', {
        method: 'POST',
        body: JSON.stringify({
            oid: state.currentVideo.aid,
            message: message,
            type_: 1
        })
    });
    
    if (result.success) {
        showToast('评论成功', 'success');
        input.value = '';
        loadComments(state.currentVideo.aid);
    } else {
        showToast(result.message || '评论失败', 'error');
    }
}

/**
 * 加载相关视频
 */
async function loadRelatedVideos(bvid) {
    const result = await apiRequest(`/api/video/related?bvid=${bvid}`);
    const container = document.getElementById('relatedList');
    
    if (result.success) {
        const videos = result.data || [];
        container.innerHTML = videos.slice(0, 10).map(v => `
            <div class="related-item" onclick="playVideo('${v.bvid}')">
                <div class="cover">
                    <img src="${v.pic}" alt="${v.title}" loading="lazy">
                </div>
                <div class="info">
                    <div class="title" title="${v.title}">${v.title}</div>
                    <div class="meta">
                        <i class="fas fa-user"></i> ${v.owner?.name || ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ============ 搜索功能 ============

/**
 * 搜索视频
 */
async function searchVideos(keyword) {
    if (!keyword.trim()) return;
    
    state.searchKeyword = keyword;
    document.getElementById('searchKeyword').textContent = keyword;
    
    const container = document.getElementById('searchResults');
    container.innerHTML = '<div class="loading">搜索中...</div>';
    
    switchPage('search');
    
    const result = await apiRequest(`/api/search?keyword=${encodeURIComponent(keyword)}`);
    if (result.success) {
        const videos = result.data?.result || [];
        container.innerHTML = videos.map(v => createVideoCard(v)).join('');
    } else {
        container.innerHTML = '<div class="error">搜索失败</div>';
    }
}

/**
 * 获取搜索建议
 */
async function loadSearchSuggest(keyword) {
    if (!keyword.trim()) {
        document.getElementById('searchSuggest').classList.remove('show');
        return;
    }
    
    const result = await apiRequest(`/api/search/suggest?keyword=${encodeURIComponent(keyword)}`);
    const container = document.getElementById('searchSuggest');
    
    if (result.success && result.data && result.data.length > 0) {
        container.innerHTML = result.data.map(item => `
            <div class="suggest-item" data-keyword="${item}">${item}</div>
        `).join('');
        container.classList.add('show');
        
        // 绑定点击事件
        container.querySelectorAll('.suggest-item').forEach(el => {
            el.addEventListener('click', () => {
                const kw = el.dataset.keyword;
                document.getElementById('searchInput').value = kw;
                searchVideos(kw);
                container.classList.remove('show');
            });
        });
    } else {
        container.classList.remove('show');
    }
}

// ============ 收藏功能 ============

/**
 * 加载收藏夹
 */
async function loadFavorites() {
    if (!state.isLoggedIn) {
        document.getElementById('favoritesSidebar').innerHTML = '<div class="error">请先登录</div>';
        document.getElementById('favoritesVideos').innerHTML = '';
        return;
    }
    
    // 获取收藏夹列表
    const result = await apiRequest('/api/favorite/folders');
    const sidebar = document.getElementById('favoritesSidebar');
    
    if (result.success) {
        const folders = result.data?.list || [];
        
        sidebar.innerHTML = folders.map((f, i) => `
            <div class="favorite-folder ${i === 0 ? 'active' : ''}" data-id="${f.id}">
                <div class="name">${f.title}</div>
                <div class="count">${f.media_count}个视频</div>
            </div>
        `).join('');
        
        // 绑定点击事件
        sidebar.querySelectorAll('.favorite-folder').forEach(el => {
            el.addEventListener('click', () => {
                sidebar.querySelectorAll('.favorite-folder').forEach(f => f.classList.remove('active'));
                el.classList.add('active');
                loadFavoriteVideos(el.dataset.id);
            });
        });
        
        // 加载第一个收藏夹的视频
        if (folders.length > 0) {
            loadFavoriteVideos(folders[0].id);
        }
    } else {
        sidebar.innerHTML = '<div class="error">加载失败</div>';
    }
}

/**
 * 加载收藏夹视频
 */
async function loadFavoriteVideos(mediaId) {
    const container = document.getElementById('favoritesVideos');
    container.innerHTML = '<div class="loading">加载中...</div>';
    
    const result = await apiRequest(`/api/favorite/videos?media_id=${mediaId}`);
    if (result.success) {
        const videos = result.data?.medias || [];
        container.innerHTML = videos.map(v => createVideoCard({
            bvid: v.bvid,
            title: v.title,
            pic: v.cover,
            owner: { name: v.upper?.name || '' },
            stat: { view: v.cnt_info?.play || 0, danmaku: v.cnt_info?.danmaku || 0 }
        })).join('');
    } else {
        container.innerHTML = '<div class="error">加载失败</div>';
    }
}

/**
 * 加载历史记录
 */
async function loadHistory() {
    if (!state.isLoggedIn) {
        document.getElementById('historyList').innerHTML = '<div class="error">请先登录</div>';
        return;
    }
    
    const container = document.getElementById('historyList');
    container.innerHTML = '<div class="loading">加载中...</div>';
    
    const result = await apiRequest('/api/history/list');
    if (result.success) {
        const items = result.data?.list || [];
        container.innerHTML = items.map((item, i) => createVideoListItem({
            bvid: item.history?.bvid || '',
            title: item.title,
            pic: item.cover,
            owner: { name: item.author_name || '' },
            desc: item.desc || '',
            stat: { view: item.stat?.view || 0, danmaku: item.stat?.danmaku || 0 }
        }, i + 1)).join('');
    } else {
        container.innerHTML = '<div class="error">加载失败</div>';
    }
}

// ============ 弹幕功能 ============

/**
 * 发送弹幕
 */
async function sendDanmaku() {
    if (!state.isLoggedIn) {
        showToast('请先登录', 'error');
        toggleModal('danmakuModal', false);
        toggleModal('loginModal', true);
        generateQRCode();
        return;
    }
    
    const msg = document.getElementById('danmakuInput').value.trim();
    if (!msg) {
        showToast('请输入弹幕内容', 'error');
        return;
    }
    
    if (!state.currentVideo) return;
    
    const mode = parseInt(document.getElementById('danmakuMode').value);
    const color = parseInt(document.getElementById('danmakuColor').value.replace('#', ''), 16);
    const fontsize = parseInt(document.getElementById('danmakuSize').value);
    
    const result = await apiRequest('/api/danmaku/send', {
        method: 'POST',
        body: JSON.stringify({
            cid: state.currentVideo.cid,
            msg: msg,
            mode: mode,
            color: color,
            fontsize: fontsize
        })
    });
    
    if (result.success) {
        showToast('弹幕发送成功', 'success');
        document.getElementById('danmakuInput').value = '';
        toggleModal('danmakuModal', false);
    } else {
        showToast(result.message || '发送失败', 'error');
    }
}

// ============ 事件绑定 ============

function bindEvents() {
    // 导航点击
    document.querySelectorAll('.nav-item, .sidebar-menu a').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const page = el.dataset.page;
            if (page) {
                switchPage(page);
            }
        });
    });
    
    // 登录按钮
    document.getElementById('loginBtn').addEventListener('click', () => {
        toggleModal('loginModal', true);
        generateQRCode();
    });
    
    // 关闭登录弹窗
    document.getElementById('closeLoginModal').addEventListener('click', () => {
        toggleModal('loginModal', false);
        if (state.qrCheckInterval) {
            clearInterval(state.qrCheckInterval);
        }
    });
    
    // 登出按钮
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // 搜索
    document.getElementById('searchBtn').addEventListener('click', () => {
        const keyword = document.getElementById('searchInput').value;
        searchVideos(keyword);
    });
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const keyword = e.target.value;
            searchVideos(keyword);
            document.getElementById('searchSuggest').classList.remove('show');
        }
    });
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        loadSearchSuggest(e.target.value);
    });
    
    // 发送评论
    document.getElementById('sendCommentBtn').addEventListener('click', sendComment);
    
    // 评论标签切换
    document.querySelectorAll('.comment-tabs span').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.comment-tabs span').forEach(s => s.classList.remove('active'));
            el.classList.add('active');
            state.commentMode = parseInt(el.dataset.mode);
            if (state.currentVideo) {
                loadComments(state.currentVideo.aid);
            }
        });
    });
    
    // 关闭弹幕弹窗
    document.getElementById('closeDanmakuModal').addEventListener('click', () => {
        toggleModal('danmakuModal', false);
    });
    
    // 发送弹幕
    document.getElementById('sendDanmakuBtn').addEventListener('click', sendDanmaku);
    
    // 弹幕按钮点击
    document.getElementById('danmakuSendBtn').addEventListener('click', () => {
        toggleModal('danmakuModal', true);
    });
}

// ============ 加载分区 ============

async function loadPartitions() {
    const result = await apiRequest('/api/partitions');
    const menu = document.getElementById('partitionMenu');
    
    if (result.success) {
        menu.innerHTML = result.data.map(p => `
            <li><a href="#" data-tid="${p.id}"><i class="fas fa-folder"></i> ${p.name}</a></li>
        `).join('');
    }
}

// ============ 初始化 ============

async function init() {
    bindEvents();
    await checkAuthStatus();
    await loadPartitions();
    loadHomeVideos();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);