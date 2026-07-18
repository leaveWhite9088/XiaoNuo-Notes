const urlParams = new URLSearchParams(window.location.search);
const bvid = urlParams.get('bvid');

if (!bvid) {
    alert('未提供BVID！');
    window.location.href = '/';
}

let currentCid = null;

async function loadVideoData() {
    try {
        // Fetch Info
        const infoRes = await fetch(`/api/video/info?bvid=${bvid}`);
        const infoData = await infoRes.json();
        
        if (infoData.status === 'ok') {
            const data = infoData.data;
            document.title = data.title + " - Bilibili Clone";
            document.getElementById('video-title').innerText = data.title;
            document.getElementById('video-meta-text').innerText = `${data.owner.name} · ${data.stat.view}播放 · ${new Date(data.pubdate * 1000).toLocaleString()}`;
            document.getElementById('bili-link').href = `https://www.bilibili.com/video/${bvid}`;
            currentCid = data.cid;

            // Fetch Play URL
            const urlRes = await fetch(`/api/video/playurl?bvid=${bvid}&cid=${currentCid}`);
            const urlData = await urlRes.json();
            
            if (urlData.status === 'ok') {
                const playData = urlData.data;
                const videoEl = document.getElementById('video-player');
                
                // bilibili-api usually returns either dash or durl
                let videoUrl = '';
                if (playData.durl && playData.durl.length > 0) {
                    videoUrl = playData.durl[0].url;
                    // Check if it's flv
                    if (videoUrl.includes('.flv')) {
                        if (flvjs.isSupported()) {
                            const flvPlayer = flvjs.createPlayer({
                                type: 'flv',
                                url: videoUrl
                            });
                            flvPlayer.attachMediaElement(videoEl);
                            flvPlayer.load();
                        }
                    } else {
                        videoEl.src = videoUrl;
                    }
                } else if (playData.dash) {
                    // Try to play DASH video stream directly, though audio may be missing
                    if (playData.dash.video && playData.dash.video.length > 0) {
                        videoUrl = playData.dash.video[0].baseUrl;
                        videoEl.src = videoUrl;
                    }
                }
            }
        } else {
            document.getElementById('video-title').innerText = '视频加载失败: ' + infoData.message;
        }

        // Fetch Comments
        loadComments();
    } catch (e) {
        console.error(e);
    }
}

async function loadComments() {
    const commentsRes = await fetch(`/api/video/comments?bvid=${bvid}`);
    const commentsData = await commentsRes.json();
    const listEl = document.getElementById('comment-list');
    
    if (commentsData.status === 'ok') {
        const comments = commentsData.data.replies || [];
        document.getElementById('comment-count').innerText = commentsData.data.page.count || 0;
        listEl.innerHTML = '';
        
        if (comments.length === 0) {
            listEl.innerHTML = '<p>暂无评论</p>';
            return;
        }

        comments.forEach(c => {
            const ctime = new Date(c.ctime * 1000).toLocaleString();
            const item = `
                <div class="comment-item">
                    <img class="comment-avatar" src="${c.member.avatar}" alt="avatar">
                    <div class="comment-content">
                        <div class="comment-author">${c.member.uname}</div>
                        <div class="comment-text">${c.content.message}</div>
                        <div class="comment-time">${ctime}</div>
                    </div>
                </div>
            `;
            listEl.innerHTML += item;
        });
    } else {
        listEl.innerHTML = '<p>评论加载失败: ' + commentsData.message + '</p>';
    }
}

async function sendComment() {
    const text = document.getElementById('comment-text').value.trim();
    if (!text) return;
    
    const res = await fetch('/api/video/comment', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({bvid, text})
    });
    const data = await res.json();
    
    if (data.status === 'ok') {
        alert('评论成功！');
        document.getElementById('comment-text').value = '';
        loadComments();
    } else {
        alert('发送失败: ' + data.message);
    }
}

loadVideoData();
