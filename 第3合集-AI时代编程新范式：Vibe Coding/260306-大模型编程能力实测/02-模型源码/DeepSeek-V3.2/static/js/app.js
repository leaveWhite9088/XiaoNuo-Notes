// Bilibili视频平台前端逻辑

let currentBvid = '';
let currentCredential = null;
let qrKey = '';
let checkLoginInterval = null;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有保存的登录凭据
    const savedCredential = localStorage.getItem('bilibili_credential');
    if (savedCredential) {
        currentCredential = JSON.parse(savedCredential);
        updateUserInfo();
    }
});

// 切换标签页
function showTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有标签按钮的激活状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // 激活对应的标签按钮
    event.target.classList.add('active');
    
    // 如果是弹幕标签，加载弹幕
    if (tabName === 'danmaku' && currentBvid) {
        loadDanmaku();
    }
    
    // 如果是评论标签，加载评论
    if (tabName === 'comments' && currentBvid) {
        loadComments();
    }
}

// 显示登录模态框
function showLogin() {
    document.getElementById('loginModal').style.display = 'flex';
    getQRCode();
}

// 关闭登录模态框
function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
    if (checkLoginInterval) {
        clearInterval(checkLoginInterval);
        checkLoginInterval = null;
    }
}

// 获取二维码
async function getQRCode() {
    try {
        const response = await fetch('/api/auth/qr-code');
        const result = await response.json();
        
        if (result.success) {
            qrKey = result.qr_key;
            document.getElementById('qrCodeContainer').innerHTML = 
                `<img src="${result.qr_image}" alt="二维码">`;
            document.getElementById('loginStatus').innerHTML = 
                '<p>请使用Bilibili APP扫描二维码</p>';
            
            // 开始检查登录状态
            startCheckingLogin();
        } else {
            document.getElementById('loginStatus').innerHTML = 
                `<p style="color: red;">获取二维码失败: ${result.error}</p>`;
        }
    } catch (error) {
        document.getElementById('loginStatus').innerHTML = 
            `<p style="color: red;">网络错误: ${error.message}</p>`;
    }
}

// 开始检查登录状态
function startCheckingLogin() {
    if (checkLoginInterval) {
        clearInterval(checkLoginInterval);
    }
    
    checkLoginInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/auth/check-login/${qrKey}`);
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('loginStatus').innerHTML = 
                    `<p>${result.message}</p>`;
                
                if (result.status === 'success') {
                    currentCredential = result.credential;
                    localStorage.setItem('bilibili_credential', JSON.stringify(currentCredential));
                    updateUserInfo();
                    closeLogin();
                } else if (result.status === 'timeout') {
                    clearInterval(checkLoginInterval);
                    document.getElementById('loginStatus').innerHTML = 
                        '<p style="color: red;">二维码已过期，请刷新重试</p>';
                }
            } else {
                document.getElementById('loginStatus').innerHTML = 
                    `<p style="color: red;">登录失败: ${result.error}</p>`;
            }
        } catch (error) {
            document.getElementById('loginStatus').innerHTML = 
                `<p style="color: red;">网络错误: ${error.message}</p>`;
        }
    }, 2000);
}

// 更新用户信息显示
function updateUserInfo() {
    if (currentCredential) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userInfo').style.display = 'flex';
        // 这里可以获取用户详细信息并显示
        document.getElementById('userName').textContent = '已登录用户';
    }
}

// 加载视频
async function loadVideo() {
    const bvid = document.getElementById('bvidInput').value.trim();
    if (!bvid) {
        alert('请输入视频BV号');
        return;
    }
    
    currentBvid = bvid;
    
    try {
        // 获取视频信息
        const response = await fetch(`/api/video/info/${bvid}`);
        const result = await response.json();
        
        if (result.success) {
            displayVideoInfo(result.data);
            loadDanmaku();
            loadComments();
        } else {
            alert('获取视频信息失败: ' + result.error);
        }
    } catch (error) {
        alert('网络错误: ' + error.message);
    }
}

// 显示视频信息
function displayVideoInfo(videoData) {
    // 更新视频信息区域
    document.getElementById('videoInfo').style.display = 'block';
    document.getElementById('videoTitle').textContent = videoData.title;
    document.getElementById('videoViews').textContent = `播放: ${formatNumber(videoData.stat.view)}`;
    document.getElementById('videoLikes').textContent = `点赞: ${formatNumber(videoData.stat.like)}`;
    document.getElementById('videoCoins').textContent = `投币: ${formatNumber(videoData.stat.coin)}`;
    document.getElementById('videoFavorites').textContent = `收藏: ${formatNumber(videoData.stat.favorite)}`;
    
    // 创建视频播放器
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.innerHTML = `
        <video width="100%" height="100%" controls>
            <source src="https://www.bilibili.com/video/${currentBvid}" type="video/mp4">
            您的浏览器不支持视频播放
        </video>
    `;
}

// 格式化数字
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

// 加载弹幕
async function loadDanmaku() {
    if (!currentBvid) return;
    
    try {
        const response = await fetch(`/api/video/danmaku/${currentBvid}`);
        const result = await response.json();
        
        if (result.success) {
            displayDanmaku(result.data.danmakus);
        } else {
            console.error('获取弹幕失败:', result.error);
        }
    } catch (error) {
        console.error('网络错误:', error.message);
    }
}

// 显示弹幕
function displayDanmaku(danmakus) {
    const danmakuList = document.getElementById('danmakuList');
    danmakuList.innerHTML = '';
    
    danmakus.slice(0, 50).forEach(dm => {
        const danmakuItem = document.createElement('div');
        danmakuItem.className = 'danmaku-item';
        danmakuItem.innerHTML = `
            <span style="color: #666;">[${dm.time}s]</span>
            <span>${dm.text}</span>
        `;
        danmakuList.appendChild(danmakuItem);
    });
}

// 发送弹幕
async function sendDanmaku() {
    if (!currentCredential) {
        alert('请先登录');
        return;
    }
    
    const text = document.getElementById('danmakuText').value.trim();
    if (!text) {
        alert('请输入弹幕内容');
        return;
    }
    
    try {
        const response = await fetch(`/api/video/send-danmaku/${currentBvid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                credential_data: currentCredential
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('弹幕发送成功');
            document.getElementById('danmakuText').value = '';
            loadDanmaku(); // 刷新弹幕列表
        } else {
            alert('发送弹幕失败: ' + result.error);
        }
    } catch (error) {
        alert('网络错误: ' + error.message);
    }
}

// 加载评论
async function loadComments() {
    if (!currentBvid) return;
    
    try {
        const response = await fetch(`/api/comment/list/${currentBvid}?page=1&size=20`);
        const result = await response.json();
        
        if (result.success) {
            displayComments(result.data.comments);
        } else {
            console.error('获取评论失败:', result.error);
        }
    } catch (error) {
        console.error('网络错误:', error.message);
    }
}

// 显示评论
function displayComments(comments) {
    const commentList = document.getElementById('commentList');
    commentList.innerHTML = '';
    
    comments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        commentItem.innerHTML = `
            <div class="comment-user">
                <img src="${comment.face || '/static/images/default-avatar.png'}" alt="头像">
                <span>${comment.uname}</span>
            </div>
            <div class="comment-content">${comment.message}</div>
            <div class="comment-stats">
                <span>${formatTime(comment.ctime)}</span>
                <span>点赞 ${comment.like}</span>
                <span>回复 ${comment.rcount}</span>
            </div>
        `;
        commentList.appendChild(commentItem);
    });
}

// 发送评论
async function sendComment() {
    if (!currentCredential) {
        alert('请先登录');
        return;
    }
    
    const text = document.getElementById('commentText').value.trim();
    if (!text) {
        alert('请输入评论内容');
        return;
    }
    
    try {
        const response = await fetch(`/api/comment/send/${currentBvid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                credential_data: currentCredential
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('评论发送成功');
            document.getElementById('commentText').value = '';
            loadComments(); // 刷新评论列表
        } else {
            alert('发送评论失败: ' + result.error);
        }
    } catch (error) {
        alert('网络错误: ' + error.message);
    }
}

// 格式化时间戳
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 2592000) return Math.floor(diff / 86400) + '天前';
    
    return date.toLocaleDateString();
}

// 搜索视频
function searchVideo() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (keyword) {
        // 这里可以实现搜索功能
        alert('搜索功能开发中...');
    }
}

// 点赞视频
async function likeVideo() {
    if (!currentCredential) {
        alert('请先登录');
        return;
    }
    alert('点赞功能开发中...');
}

// 投币
async function coinVideo() {
    if (!currentCredential) {
        alert('请先登录');
        return;
    }
    alert('投币功能开发中...');
}

// 收藏视频
async function favoriteVideo() {
    if (!currentCredential) {
        alert('请先登录');
        return;
    }
    alert('收藏功能开发中...');
}