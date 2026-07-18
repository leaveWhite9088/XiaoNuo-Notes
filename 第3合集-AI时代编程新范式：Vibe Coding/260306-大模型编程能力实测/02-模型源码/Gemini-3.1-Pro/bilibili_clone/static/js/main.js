// Check login status
async function checkLoginStatus() {
    try {
        const res = await fetch('/api/user/status');
        const data = await res.json();
        const loginBtn = document.getElementById('login-btn');
        const avatar = document.getElementById('user-avatar');
        if (data.logged_in) {
            loginBtn.style.display = 'none';
            avatar.style.display = 'flex';
        } else {
            loginBtn.style.display = 'block';
            avatar.style.display = 'none';
        }
    } catch (e) {
        console.error(e);
    }
}

// Login Modal Logic
const modal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');
const closeBtn = document.querySelector('.close-btn');
let loginTimer = null;

loginBtn.onclick = async () => {
    modal.style.display = 'flex';
    document.getElementById('login-status').innerText = '正在获取二维码...';
    document.getElementById('qrcode-container').innerHTML = '';
    
    // Fetch QR code
    const res = await fetch('/api/login/qr');
    const data = await res.json();
    if (data.status === 'ok') {
        new QRCode(document.getElementById('qrcode-container'), {
            text: data.url,
            width: 200,
            height: 200
        });
        document.getElementById('login-status').innerText = '请使用哔哩哔哩客户端扫码';
        
        // Start polling
        loginTimer = setInterval(async () => {
            const checkRes = await fetch('/api/login/check');
            const checkData = await checkRes.json();
            if (checkData.status === 'done') {
                clearInterval(loginTimer);
                document.getElementById('login-status').innerText = '登录成功！';
                setTimeout(() => {
                    modal.style.display = 'none';
                    checkLoginStatus();
                }, 1000);
            } else if (checkData.status === 'scan') {
                document.getElementById('login-status').innerText = '已扫码，请确认';
            }
        }, 2000);
    }
};

closeBtn.onclick = () => {
    modal.style.display = 'none';
    if (loginTimer) clearInterval(loginTimer);
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        if (loginTimer) clearInterval(loginTimer);
    }
};

// Search Logic
function doSearch() {
    const input = document.getElementById('search-input').value.trim();
    if (input.startsWith('BV')) {
        window.location.href = `/video.html?bvid=${input}`;
    } else {
        alert('目前仅支持输入BVID搜索，例如: BV1xxxx');
    }
}

document.getElementById('search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') doSearch();
});

checkLoginStatus();
