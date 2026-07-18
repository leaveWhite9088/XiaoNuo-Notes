/* ── Bilibili 视频平台 - 前端逻辑 ─────────────────────────────── */

// ── 全局状态 ─────────────────────────────────────────────────────
const state = {
    currentPage: 'home',
    hotPage: 1,
    isLoggedIn: false,
    userInfo: null,
    currentBvid: null,
    commentPage: 1,
    commentTotal: 0,
    qrCheckTimer: null,
    searchKeyword: '',
    searchPage: 1,
    isSearchMode: false,
};

// ── 工具函数 ─────────────────────────────────────────────────────
function formatNumber(n) {
    if (n === undefined || n === null) return '0';
    if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    return String(n);
}

function formatDuration(seconds) {
    if (typeof seconds === 'string') return seconds;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + String(s).padStart(2, '0');
}

function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 2592000) return Math.floor(diff / 86400) + '天前';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function showToast(msg, type) {
    type = type || 'info';
    var c = document.getElementById('toast-container');
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(function() { t.remove(); }, 3500);
}

async function api(url, options) {
    try {
        var resp = await fetch(url, options || {});
        return await resp.json();
    } catch (e) {
        return { code: -1, msg: e.message };
    }
}

function fixPic(url) {
    if (!url) return '';
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('http://')) return url.replace('http://', 'https://');
    return url;
}

function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
        Object.keys(attrs).forEach(function(k) {
            if (k === 'textContent') { node.textContent = attrs[k]; }
            else if (k === 'className') { node.className = attrs[k]; }
            else if (k.startsWith('on')) { node.addEventListener(k.slice(2).toLowerCase(), attrs[k]); }
            else if (k === 'style' && typeof attrs[k] === 'object') {
                Object.assign(node.style, attrs[k]);
            } else { node.setAttribute(k, attrs[k]); }
        });
    }
    if (children) {
        (Array.isArray(children) ? children : [children]).forEach(function(c) {
            if (c == null) return;
            if (typeof c === 'string') node.appendChild(document.createTextNode(c));
            else node.appendChild(c);
        });
    }
    return node;
}

function svgIcon(path, size) {
    size = size || 16;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    return svg;
}

function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function createImg(src, cls, alt) {
    var img = el('img', { src: fixPic(src), className: cls || '', alt: alt || '', loading: 'lazy' });
    img.onerror = function() { this.style.display = 'none'; };
    return img;
}

// ── 导航 ─────────────────────────────────────────────────────────
function navigateTo(page, params) {
    params = params || {};
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById('page-' + page).classList.add('active');

    document.querySelectorAll('.header-nav-item').forEach(function(n) { n.classList.remove('active'); });
    var navItem = document.getElementById('nav-' + page);
    if (navItem) navItem.classList.add('active');

    state.currentPage = page;
    window.scrollTo(0, 0);

    if (page === 'home' && !state.isSearchMode) loadHotVideos();
    if (page === 'video' && params.bvid) openVideo(params.bvid);
    if (page === 'login') initLoginPage();
    if (page === 'user') loadUserPage();
}

// ── 首页热门 ─────────────────────────────────────────────────────
async function loadHotVideos(append) {
    if (!append) {
        state.hotPage = 1;
        state.isSearchMode = false;
        var titleEl = document.getElementById('home-title');
        clearNode(titleEl);
        titleEl.appendChild(document.createTextNode('🔥 热门推荐'));
    }

    var grid = document.getElementById('video-grid');
    if (!append) clearNode(grid);

    document.getElementById('home-loading').style.display = 'block';
    document.getElementById('load-more').style.display = 'none';

    var result = await api('/api/hot?pn=' + state.hotPage);
    document.getElementById('home-loading').style.display = 'none';

    if (result.code === 0 && result.data) {
        result.data.forEach(function(v) { grid.appendChild(createVideoCard(v)); });
        document.getElementById('load-more').style.display = 'block';
    } else {
        if (!append) {
            grid.appendChild(el('div', { className: 'empty-state' }, [el('p', { textContent: '加载失败，请稍后重试' })]));
        }
    }
}

function loadMoreHot() {
    if (state.isSearchMode) {
        state.searchPage++;
        doSearch(true);
    } else {
        state.hotPage++;
        loadHotVideos(true);
    }
}

// ── 搜索 ─────────────────────────────────────────────────────────
async function doSearch(append) {
    var input = document.getElementById('search-input');
    var keyword = input.value.trim();
    if (!keyword) return;

    state.isSearchMode = true;
    state.searchKeyword = keyword;

    if (!append) {
        state.searchPage = 1;
        navigateTo('home');
    }

    var titleEl = document.getElementById('home-title');
    clearNode(titleEl);
    titleEl.appendChild(document.createTextNode('🔍 搜索：' + keyword));

    var grid = document.getElementById('video-grid');
    if (!append) clearNode(grid);

    document.getElementById('home-loading').style.display = 'block';
    document.getElementById('load-more').style.display = 'none';

    var result = await api('/api/search?keyword=' + encodeURIComponent(keyword) + '&page=' + state.searchPage);
    document.getElementById('home-loading').style.display = 'none';

    if (result.code === 0 && result.data) {
        result.data.forEach(function(v) { grid.appendChild(createVideoCard(v)); });
        if (result.data.length >= 20) {
            document.getElementById('load-more').style.display = 'block';
        }
    } else {
        if (!append) {
            grid.appendChild(el('div', { className: 'empty-state' }, [el('p', { textContent: '未找到相关视频' })]));
        }
        showToast(result.msg || '搜索失败', 'error');
    }
}

// ── 视频卡片 ─────────────────────────────────────────────────────
function createVideoCard(v) {
    var pic = fixPic(v.pic);
    var ownerFace = fixPic(v.owner_face);

    var coverImg = el('img', { src: pic, alt: '', loading: 'lazy' });
    coverImg.onerror = function() { this.style.display = 'none'; };

    var durationSpan = el('span', { className: 'video-card-duration', textContent: formatDuration(v.duration) });

    var statView = el('span', {}, [document.createTextNode('▶ ' + formatNumber(v.view))]);
    var statDm = el('span', {}, [document.createTextNode('💬 ' + formatNumber(v.danmaku))]);
    var statDiv = el('div', { className: 'video-card-stat' }, [statView, statDm]);

    var coverDiv = el('div', { className: 'video-card-cover' }, [coverImg, durationSpan, statDiv]);

    var titleDiv = el('div', { className: 'video-card-title', textContent: v.title });

    var authorChildren = [];
    if (ownerFace) {
        var authorImg = el('img', { src: ownerFace, alt: '', loading: 'lazy' });
        authorImg.onerror = function() { this.style.display = 'none'; };
        authorChildren.push(authorImg);
    }
    authorChildren.push(el('span', { textContent: v.owner_name }));
    if (v.pubdate) {
        authorChildren.push(el('span', { textContent: formatDate(v.pubdate), style: { marginLeft: 'auto' } }));
    }
    var authorDiv = el('div', { className: 'video-card-author' }, authorChildren);

    var infoChildren = [titleDiv, authorDiv];
    if (v.rcmd_reason) {
        infoChildren.push(el('div', { className: 'video-card-rcmd', textContent: v.rcmd_reason }));
    }
    var infoDiv = el('div', { className: 'video-card-info' }, infoChildren);

    var card = el('div', { className: 'video-card', onClick: function() { navigateTo('video', { bvid: v.bvid }); } }, [coverDiv, infoDiv]);
    return card;
}

// ── 视频详情页 ───────────────────────────────────────────────────
async function openVideo(bvid) {
    state.currentBvid = bvid;
    state.commentPage = 1;

    document.getElementById('v-title').textContent = '加载中...';
    clearNode(document.getElementById('v-meta'));
    clearNode(document.getElementById('v-stats'));
    clearNode(document.getElementById('v-owner'));
    document.getElementById('v-desc').textContent = '';
    clearNode(document.getElementById('comment-list'));
    clearNode(document.getElementById('danmaku-list'));
    clearNode(document.getElementById('related-list'));
    document.getElementById('comment-count').textContent = '';
    document.getElementById('danmaku-count').textContent = '';

    var wrapper = document.getElementById('video-player-wrapper');
    clearNode(wrapper);
    var iframe = el('iframe', {
        src: 'https://player.bilibili.com/player.html?bvid=' + bvid + '&high_quality=1&danmaku=1',
        allowfullscreen: 'true',
        sandbox: 'allow-top-navigation allow-same-origin allow-forms allow-scripts allow-popups',
        scrolling: 'no'
    });
    wrapper.appendChild(iframe);

    var result = await api('/api/video/info/' + bvid);
    if (result.code === 0) {
        var d = result.data;
        document.getElementById('v-title').textContent = d.title;

        var metaEl = document.getElementById('v-meta');
        clearNode(metaEl);
        metaEl.appendChild(el('span', { className: 'video-meta-item', textContent: '📅 ' + formatDate(d.pubdate) }));
        metaEl.appendChild(el('span', { className: 'video-meta-item', textContent: '▶ ' + formatNumber(d.view) + ' 播放' }));
        metaEl.appendChild(el('span', { className: 'video-meta-item', textContent: '💬 ' + formatNumber(d.danmaku) + ' 弹幕' }));
        if (d.tname) metaEl.appendChild(el('span', { className: 'video-tag', textContent: d.tname }));

        var gotoLink = el('a', {
            href: 'https://www.bilibili.com/video/' + bvid,
            target: '_blank',
            className: 'video-goto-btn',
            textContent: '🔗 B站观看',
            style: { marginLeft: 'auto', fontSize: '12px', padding: '4px 12px' }
        });
        metaEl.appendChild(gotoLink);

        var statsEl = document.getElementById('v-stats');
        clearNode(statsEl);
        statsEl.appendChild(el('div', { className: 'video-stat-item', textContent: '👍 ' + formatNumber(d.like) }));
        statsEl.appendChild(el('div', { className: 'video-stat-item', textContent: '🪙 ' + formatNumber(d.coin) }));
        statsEl.appendChild(el('div', { className: 'video-stat-item', textContent: '⭐ ' + formatNumber(d.favorite) }));
        statsEl.appendChild(el('div', { className: 'video-stat-item', textContent: '↗ ' + formatNumber(d.share) }));

        var ownerEl = document.getElementById('v-owner');
        clearNode(ownerEl);
        ownerEl.appendChild(createImg(d.owner_face, '', ''));
        var ownerLink = el('a', {
            className: 'video-owner-name',
            href: 'https://space.bilibili.com/' + d.owner_mid,
            target: '_blank',
            textContent: d.owner_name
        });
        var ownerInfo = el('div', { className: 'video-owner-info' }, [ownerLink]);
        ownerEl.appendChild(ownerInfo);

        document.getElementById('v-desc').textContent = d.desc || '暂无简介';
        document.getElementById('comment-count').textContent = '(' + formatNumber(d.reply) + ')';
        document.getElementById('danmaku-count').textContent = '(' + formatNumber(d.danmaku) + ')';
        state.commentTotal = d.reply;
    } else {
        document.getElementById('v-title').textContent = '加载失败';
        showToast(result.msg || '视频信息加载失败', 'error');
    }

    loadComments(bvid, 1);
    loadDanmaku(bvid);
    loadRelated(bvid);
    updateLoginUI();
}

// ── 评论 ─────────────────────────────────────────────────────────
async function loadComments(bvid, page) {
    page = page || 1;
    state.commentPage = page;
    var list = document.getElementById('comment-list');
    document.getElementById('comment-loading').style.display = 'block';

    var result = await api('/api/video/comments/' + bvid + '?page=' + page);
    document.getElementById('comment-loading').style.display = 'none';

    if (result.code === 0 && result.data) {
        clearNode(list);
        result.data.forEach(function(c) {
            var li = document.createElement('li');
            li.className = 'comment-item';

            var avatarImg = createImg(c.avatar, 'comment-avatar', '');
            var userDiv = el('div', { className: 'comment-user', textContent: c.uname });
            var contentDiv = el('div', { className: 'comment-content', textContent: c.content });

            var actionsDiv = el('div', { className: 'comment-actions' }, [
                el('span', { className: 'comment-action', textContent: '👍 ' + (c.like > 0 ? formatNumber(c.like) : '') }),
                el('span', { textContent: formatDate(c.ctime) }),
                c.rcount > 0 ? el('span', { textContent: c.rcount + '条回复' }) : null
            ].filter(Boolean));

            var bodyChildren = [userDiv, contentDiv, actionsDiv];

            if (c.replies && c.replies.length > 0) {
                var repliesDiv = el('div', { className: 'comment-replies' });
                c.replies.forEach(function(r) {
                    var replyItem = el('div', { className: 'comment-reply-item' });
                    replyItem.appendChild(el('span', { className: 'comment-user', textContent: r.uname }));
                    replyItem.appendChild(document.createTextNode('：'));
                    replyItem.appendChild(el('span', { className: 'reply-content', textContent: r.content }));
                    replyItem.appendChild(el('span', { textContent: ' ' + formatDate(r.ctime), style: { color: '#999', fontSize: '12px', marginLeft: '8px' } }));
                    repliesDiv.appendChild(replyItem);
                });
                if (c.rcount > c.replies.length) {
                    repliesDiv.appendChild(el('div', {
                        textContent: '共' + c.rcount + '条回复 >',
                        style: { fontSize: '12px', color: 'var(--bili-blue)', cursor: 'pointer', padding: '4px 0' }
                    }));
                }
                bodyChildren.push(repliesDiv);
            }

            var bodyDiv = el('div', { className: 'comment-body' }, bodyChildren);
            li.appendChild(avatarImg);
            li.appendChild(bodyDiv);
            list.appendChild(li);
        });

        renderCommentPagination(result.total || 0, page);
    } else {
        clearNode(list);
        list.appendChild(el('div', { className: 'empty-state' }, [el('p', { textContent: '暂无评论' })]));
    }
}

function renderCommentPagination(total, current) {
    var container = document.getElementById('comment-pagination');
    clearNode(container);
    var totalPages = Math.ceil(total / 20);
    if (totalPages <= 1) return;

    var maxShow = 7;
    var start = Math.max(1, current - 3);
    var end = Math.min(totalPages, start + maxShow - 1);
    if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);

    if (current > 1) {
        container.appendChild(el('button', {
            className: 'comment-page-btn',
            textContent: '上一页',
            onClick: function() { loadComments(state.currentBvid, current - 1); }
        }));
    }

    for (var i = start; i <= end; i++) {
        (function(pageNum) {
            container.appendChild(el('button', {
                className: 'comment-page-btn' + (pageNum === current ? ' active' : ''),
                textContent: pageNum,
                onClick: function() { loadComments(state.currentBvid, pageNum); }
            }));
        })(i);
    }

    if (current < totalPages) {
        container.appendChild(el('button', {
            className: 'comment-page-btn',
            textContent: '下一页',
            onClick: function() { loadComments(state.currentBvid, current + 1); }
        }));
    }
}

async function sendComment() {
    var input = document.getElementById('comment-input');
    var text = input.value.trim();
    if (!text) return showToast('请输入评论内容', 'error');

    var result = await api('/api/comment/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvid: state.currentBvid, text: text }),
    });

    if (result.code === 0) {
        showToast('评论发送成功', 'success');
        input.value = '';
        setTimeout(function() { loadComments(state.currentBvid, 1); }, 1000);
    } else {
        showToast(result.msg || '发送失败', 'error');
    }
}

// ── 弹幕 ─────────────────────────────────────────────────────────
async function loadDanmaku(bvid) {
    document.getElementById('danmaku-loading').style.display = 'block';
    var result = await api('/api/video/danmaku/' + bvid);
    document.getElementById('danmaku-loading').style.display = 'none';

    var list = document.getElementById('danmaku-list');
    if (result.code === 0 && result.data) {
        clearNode(list);
        document.getElementById('danmaku-count').textContent = '(' + result.data.length + ')';
        result.data.forEach(function(dm) {
            var m = Math.floor(dm.dm_time / 60);
            var s = Math.floor(dm.dm_time % 60);
            var timeStr = m + ':' + String(s).padStart(2, '0');

            var colorDot = el('span', { className: 'danmaku-color-dot' });
            colorDot.style.background = dm.color;

            var item = el('div', { className: 'danmaku-item' }, [
                el('span', { className: 'danmaku-time', textContent: timeStr }),
                colorDot,
                el('span', { className: 'danmaku-text', textContent: dm.text })
            ]);
            list.appendChild(item);
        });
    } else {
        clearNode(list);
        list.appendChild(el('div', { className: 'empty-state' }, [el('p', { textContent: '暂无弹幕' })]));
    }
}

async function sendDanmaku() {
    var input = document.getElementById('danmaku-input');
    var text = input.value.trim();
    if (!text) return showToast('请输入弹幕内容', 'error');

    var result = await api('/api/danmaku/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bvid: state.currentBvid, text: text, dm_time: 0 }),
    });

    if (result.code === 0) {
        showToast('弹幕发送成功', 'success');
        input.value = '';
        setTimeout(function() { loadDanmaku(state.currentBvid); }, 1000);
    } else {
        showToast(result.msg || '发送失败', 'error');
    }
}

// ── 相关视频 ─────────────────────────────────────────────────────
async function loadRelated(bvid) {
    document.getElementById('related-loading').style.display = 'block';
    var result = await api('/api/video/related/' + bvid);
    document.getElementById('related-loading').style.display = 'none';

    var list = document.getElementById('related-list');
    if (result.code === 0 && result.data) {
        clearNode(list);
        result.data.forEach(function(v) {
            var pic = fixPic(v.pic);
            var coverImg = el('img', { src: pic, alt: '', loading: 'lazy' });
            coverImg.onerror = function() { this.style.display = 'none'; };

            var coverDiv = el('div', { className: 'related-video-cover' }, [
                coverImg,
                el('span', { className: 'related-video-duration', textContent: formatDuration(v.duration) })
            ]);
            var infoDiv = el('div', { className: 'related-video-info' }, [
                el('div', { className: 'related-video-title', textContent: v.title }),
                el('div', { className: 'related-video-meta', textContent: v.owner_name }),
                el('div', { className: 'related-video-meta', textContent: formatNumber(v.view) + '播放 · ' + formatNumber(v.danmaku) + '弹幕' })
            ]);

            var item = el('div', { className: 'related-video', onClick: function() { navigateTo('video', { bvid: v.bvid }); } }, [coverDiv, infoDiv]);
            list.appendChild(item);
        });
    }
}

// ── 标签页切换 ───────────────────────────────────────────────────
function switchTab(tabEl, tab) {
    document.querySelectorAll('.tabs .tab').forEach(function(t) { t.classList.remove('active'); });
    tabEl.classList.add('active');
    document.getElementById('tab-comments').style.display = tab === 'comments' ? 'block' : 'none';
    document.getElementById('tab-danmaku').style.display = tab === 'danmaku' ? 'block' : 'none';
}

// ── 登录 ─────────────────────────────────────────────────────────
function initLoginPage() {
    if (state.isLoggedIn) {
        navigateTo('user');
        return;
    }
    generateQRCode();
}

function switchLoginTab(tabEl, tab) {
    document.querySelectorAll('.login-tab').forEach(function(t) { t.classList.remove('active'); });
    tabEl.classList.add('active');
    document.getElementById('login-qrcode-panel').style.display = tab === 'qrcode' ? 'block' : 'none';
    document.getElementById('login-credential-panel').style.display = tab === 'credential' ? 'block' : 'none';

    if (tab === 'qrcode') generateQRCode();
    if (tab !== 'qrcode' && state.qrCheckTimer) {
        clearInterval(state.qrCheckTimer);
        state.qrCheckTimer = null;
    }
}

async function generateQRCode() {
    if (state.qrCheckTimer) {
        clearInterval(state.qrCheckTimer);
        state.qrCheckTimer = null;
    }

    var area = document.getElementById('login-qr-area');
    clearNode(area);
    var spinner = el('div', { className: 'loading' }, [
        el('div', { className: 'loading-spinner' }),
        el('p', { textContent: '生成二维码中...' })
    ]);
    area.appendChild(spinner);

    document.getElementById('login-qr-status').textContent = '请使用 Bilibili APP 扫描二维码';
    document.getElementById('login-qr-status').className = 'login-qr-status';

    var result = await api('/api/login/qrcode/generate');
    clearNode(area);
    if (result.code === 0 && result.data) {
        var img = el('img', { src: result.data.qrcode, alt: '登录二维码' });
        area.appendChild(img);
        startQRCheck();
    } else {
        area.appendChild(el('div', { className: 'empty-state' }, [el('p', { textContent: '二维码生成失败' })]));
        showToast(result.msg || '二维码生成失败', 'error');
    }
}

function startQRCheck() {
    if (state.qrCheckTimer) clearInterval(state.qrCheckTimer);
    state.qrCheckTimer = setInterval(async function() {
        var result = await api('/api/login/qrcode/check');
        if (result.code !== 0) return;

        var status = result.data.status;
        var statusEl = document.getElementById('login-qr-status');

        if (status === 'done') {
            clearInterval(state.qrCheckTimer);
            state.qrCheckTimer = null;
            statusEl.textContent = '✅ 登录成功！';
            statusEl.className = 'login-qr-status success';
            showToast('登录成功', 'success');
            await checkLoginStatus();
            setTimeout(function() { navigateTo('home'); }, 1000);
        } else if (status === 'scanned') {
            statusEl.textContent = '📱 已扫码，请在手机上确认';
            statusEl.className = 'login-qr-status scanned';
        } else if (status === 'timeout') {
            clearInterval(state.qrCheckTimer);
            state.qrCheckTimer = null;
            statusEl.textContent = '⏰ 二维码已过期，请刷新';
            statusEl.className = 'login-qr-status timeout';
        }
    }, 2000);
}

async function loginWithCredential() {
    var sessdata = document.getElementById('input-sessdata').value.trim();
    var bili_jct = document.getElementById('input-bili-jct').value.trim();
    var buvid3 = document.getElementById('input-buvid3').value.trim();

    if (!sessdata || !bili_jct) {
        return showToast('SESSDATA 和 bili_jct 不能为空', 'error');
    }

    var result = await api('/api/login/credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessdata: sessdata, bili_jct: bili_jct, buvid3: buvid3 }),
    });

    if (result.code === 0) {
        showToast('登录成功', 'success');
        await checkLoginStatus();
        setTimeout(function() { navigateTo('home'); }, 800);
    } else {
        showToast(result.msg || '登录失败', 'error');
    }
}

async function checkLoginStatus() {
    var result = await api('/api/login/status');
    if (result.code === 0 && result.data.logged_in) {
        state.isLoggedIn = true;
        state.userInfo = result.data;
    } else {
        state.isLoggedIn = false;
        state.userInfo = null;
    }
    updateLoginUI();
}

function updateLoginUI() {
    var loginArea = document.getElementById('login-area');
    clearNode(loginArea);

    if (state.isLoggedIn && state.userInfo) {
        var face = fixPic(state.userInfo.face);
        var avatarImg = el('img', {
            className: 'user-avatar-small',
            src: face,
            alt: state.userInfo.uname,
            title: state.userInfo.uname,
            onClick: function() { navigateTo('user'); }
        });
        avatarImg.onerror = function() { this.style.display = 'none'; };
        loginArea.appendChild(avatarImg);

        document.getElementById('comment-input-area').style.display = 'flex';
        document.getElementById('comment-login-hint').style.display = 'none';
        document.getElementById('danmaku-send-area').style.display = 'flex';
        document.getElementById('danmaku-login-hint').style.display = 'none';

        var commentAvatar = document.getElementById('comment-user-avatar');
        if (commentAvatar) commentAvatar.src = face;
    } else {
        var loginBtn = el('button', {
            className: 'btn-login',
            textContent: '登录',
            onClick: function() { navigateTo('login'); }
        });
        loginArea.appendChild(loginBtn);

        document.getElementById('comment-input-area').style.display = 'none';
        document.getElementById('comment-login-hint').style.display = 'block';
        document.getElementById('danmaku-send-area').style.display = 'none';
        document.getElementById('danmaku-login-hint').style.display = 'block';
    }
}

async function doLogout() {
    await api('/api/logout', { method: 'POST' });
    state.isLoggedIn = false;
    state.userInfo = null;
    updateLoginUI();
    showToast('已退出登录', 'info');
    navigateTo('home');
}

// ── 个人中心 ─────────────────────────────────────────────────────
async function loadUserPage() {
    if (!state.isLoggedIn) {
        document.getElementById('user-not-login').style.display = 'block';
        document.getElementById('user-content').style.display = 'none';
        return;
    }

    document.getElementById('user-not-login').style.display = 'none';
    document.getElementById('user-content').style.display = 'block';

    var u = state.userInfo;
    var face = fixPic(u.face);
    var profileCard = document.getElementById('user-profile-card');
    clearNode(profileCard);

    var avatarImg = el('img', { className: 'user-profile-avatar', src: face, alt: '' });
    avatarImg.onerror = function() { this.style.display = 'none'; };

    var nameChildren = [document.createTextNode(u.uname)];
    nameChildren.push(el('span', { className: 'user-level-badge', textContent: 'LV' + u.level }));
    if (u.vip_type > 0) {
        nameChildren.push(el('span', { className: 'user-vip-badge', textContent: '大会员' }));
    }
    var nameDiv = el('div', { className: 'user-profile-name' }, nameChildren);
    var signDiv = el('div', { className: 'user-profile-sign', textContent: u.sign || '这个人很懒，什么都没写~' });
    var statsDiv = el('div', { className: 'user-profile-stats' }, [
        el('div', { className: 'user-profile-stat' }, [el('strong', { textContent: u.coins || 0 }), document.createTextNode(' 硬币')]),
        el('div', { className: 'user-profile-stat' }, [document.createTextNode('UID: '), el('strong', { textContent: u.uid })])
    ]);
    var infoDiv = el('div', { className: 'user-profile-info' }, [nameDiv, signDiv, statsDiv]);
    var logoutBtn = el('button', { className: 'btn-logout', textContent: '退出登录', onClick: doLogout });

    profileCard.appendChild(avatarImg);
    profileCard.appendChild(infoDiv);
    profileCard.appendChild(logoutBtn);

    loadFavorites();
}

async function loadFavorites() {
    document.getElementById('user-loading').style.display = 'block';
    document.getElementById('fav-videos-area').style.display = 'none';

    var result = await api('/api/user/favorites');
    document.getElementById('user-loading').style.display = 'none';

    var list = document.getElementById('fav-list');
    list.style.display = 'grid';
    clearNode(list);

    if (result.code === 0 && result.data) {
        if (result.data.length === 0) {
            list.appendChild(el('div', { className: 'empty-state', style: { gridColumn: '1/-1' } }, [el('p', { textContent: '暂无收藏夹' })]));
            return;
        }
        result.data.forEach(function(f) {
            var cover = fixPic(f.cover);
            var coverDiv = el('div', { className: 'fav-card-cover' });
            if (cover) {
                var coverImg = el('img', { src: cover, alt: '', loading: 'lazy' });
                coverImg.onerror = function() {
                    clearNode(this.parentElement);
                    this.parentElement.appendChild(el('div', { className: 'fav-placeholder', textContent: '★' }));
                };
                coverDiv.appendChild(coverImg);
            } else {
                coverDiv.appendChild(el('div', { className: 'fav-placeholder', textContent: '★' }));
            }

            var infoDiv = el('div', { className: 'fav-card-info' }, [
                el('div', { className: 'fav-card-title', textContent: f.title }),
                el('div', { className: 'fav-card-count', textContent: f.media_count + ' 个视频' })
            ]);

            var card = el('div', { className: 'fav-card', onClick: function() { openFavVideos(f.id, f.title); } }, [coverDiv, infoDiv]);
            list.appendChild(card);
        });
    } else {
        list.appendChild(el('div', { className: 'empty-state', style: { gridColumn: '1/-1' } }, [el('p', { textContent: '加载失败' })]));
    }
}

async function openFavVideos(mediaId, title) {
    document.getElementById('fav-list').style.display = 'none';
    document.getElementById('fav-videos-area').style.display = 'block';
    document.getElementById('fav-videos-title').textContent = title;

    var grid = document.getElementById('fav-video-grid');
    clearNode(grid);
    grid.appendChild(el('div', { className: 'loading' }, [
        el('div', { className: 'loading-spinner' }),
        el('p', { textContent: '加载中...' })
    ]));

    var result = await api('/api/user/favorites/' + mediaId);
    clearNode(grid);

    if (result.code === 0 && result.data) {
        if (result.data.length === 0) {
            grid.appendChild(el('div', { className: 'empty-state', style: { gridColumn: '1/-1' } }, [el('p', { textContent: '收藏夹为空' })]));
            return;
        }
        result.data.forEach(function(v) { grid.appendChild(createVideoCard(v)); });
    } else {
        grid.appendChild(el('div', { className: 'empty-state', style: { gridColumn: '1/-1' } }, [el('p', { textContent: '加载失败' })]));
    }
}

function showFavList() {
    document.getElementById('fav-list').style.display = 'grid';
    document.getElementById('fav-videos-area').style.display = 'none';
}

// ── 初始化 ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {
    await checkLoginStatus();
    loadHotVideos();
});
