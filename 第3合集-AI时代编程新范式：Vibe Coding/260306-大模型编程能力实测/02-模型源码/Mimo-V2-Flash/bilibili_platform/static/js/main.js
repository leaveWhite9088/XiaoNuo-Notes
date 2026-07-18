document.addEventListener('DOMContentLoaded', function() {
    console.log('Bilibili平台已加载');
    
    const searchForm = document.querySelector('.search-box form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const keyword = this.querySelector('input[name="keyword"]').value.trim();
            if (!keyword) {
                e.preventDefault();
                alert('请输入搜索关键词');
            }
        });
    }
    
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const bvid = this.dataset.bvid;
            const url = this.dataset.url;
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.action === 'favorite') {
                        this.classList.add('active');
                        this.textContent = '已收藏';
                    } else {
                        this.classList.remove('active');
                        this.textContent = '收藏';
                    }
                    showNotification(data.message, 'success');
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('收藏失败:', error);
                showNotification('收藏失败，请重试', 'error');
            });
        });
    });
    
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = this.querySelector('textarea[name="message"]').value.trim();
            const url = this.action;
            
            if (!message) {
                showNotification('评论内容不能为空', 'error');
                return;
            }
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    this.querySelector('textarea[name="message"]').value = '';
                    location.reload();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('发送评论失败:', error);
                showNotification('发送评论失败，请重试', 'error');
            });
        });
    }
    
    const danmakuForm = document.querySelector('.danmaku-form');
    if (danmakuForm) {
        danmakuForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = this.querySelector('input[name="message"]').value.trim();
            const url = this.action;
            
            if (!message) {
                showNotification('弹幕内容不能为空', 'error');
                return;
            }
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    this.querySelector('input[name="message"]').value = '';
                    location.reload();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('发送弹幕失败:', error);
                showNotification('发送弹幕失败，请重试', 'error');
            });
        });
    }
    
    const bilibiliLoginBtn = document.querySelector('.bilibili-login-btn');
    if (bilibiliLoginBtn) {
        bilibiliLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.dataset.url;
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    location.reload();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('B站登录失败:', error);
                showNotification('B站登录失败，请重试', 'error');
            });
        });
    }
    
    const qrcodeLoginBtn = document.querySelector('.qrcode-login-btn');
    if (qrcodeLoginBtn) {
        qrcodeLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.dataset.url;
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    location.reload();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('二维码登录失败:', error);
                showNotification('二维码登录失败，请重试', 'error');
            });
        });
    }
    
    const passwordLoginBtn = document.querySelector('.password-login-btn');
    if (passwordLoginBtn) {
        passwordLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('form');
            const username = form.querySelector('input[name="username"]').value.trim();
            const password = form.querySelector('input[name="password"]').value.trim();
            const url = this.dataset.url;
            
            if (!username || !password) {
                showNotification('用户名和密码不能为空', 'error');
                return;
            }
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify({ username: username, password: password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    location.reload();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('密码登录失败:', error);
                showNotification('密码登录失败，请重试', 'error');
            });
        });
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : '';
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    const videoPlayer = document.querySelector('.video-player');
    if (videoPlayer) {
        videoPlayer.addEventListener('loadeddata', function() {
            console.log('视频加载完成');
        });
        
        videoPlayer.addEventListener('error', function() {
            console.error('视频加载失败');
            showNotification('视频加载失败，请尝试其他播放源', 'error');
        });
    }
    
    const danmakuToggle = document.querySelector('.danmaku-toggle');
    if (danmakuToggle) {
        danmakuToggle.addEventListener('click', function() {
            const danmakuContainer = document.querySelector('.danmaku-container');
            if (danmakuContainer) {
                danmakuContainer.style.display = danmakuContainer.style.display === 'none' ? 'block' : 'none';
                this.textContent = danmakuContainer.style.display === 'none' ? '显示弹幕' : '隐藏弹幕';
            }
        });
    }
    
    const paginationLinks = document.querySelectorAll('.pagination a');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.href;
            window.location.href = url;
        });
    });
    
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    });
    
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    const videoDetailPage = document.querySelector('.video-detail-page');
    if (videoDetailPage) {
        const autoPlayCheckbox = document.querySelector('#auto-play');
        if (autoPlayCheckbox) {
            autoPlayCheckbox.addEventListener('change', function() {
                localStorage.setItem('autoPlay', this.checked);
            });
            
            const autoPlay = localStorage.getItem('autoPlay');
            if (autoPlay === 'true') {
                autoPlayCheckbox.checked = true;
            }
        }
        
        const danmakuSpeed = document.querySelector('#danmaku-speed');
        if (danmakuSpeed) {
            danmakuSpeed.addEventListener('change', function() {
                localStorage.setItem('danmakuSpeed', this.value);
            });
            
            const speed = localStorage.getItem('danmakuSpeed');
            if (speed) {
                danmakuSpeed.value = speed;
            }
        }
    }
    
    const searchPage = document.querySelector('.search-page');
    if (searchPage) {
        const searchInput = document.querySelector('input[name="keyword"]');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const keyword = this.value.trim();
                    if (keyword.length >= 2) {
                        console.log('搜索建议:', keyword);
                    }
                }, 300);
            });
        }
    }
    
    const userPage = document.querySelector('.user-page');
    if (userPage) {
        const refreshBilibiliBtn = document.querySelector('.refresh-bilibili-btn');
        if (refreshBilibiliBtn) {
            refreshBilibiliBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.dataset.url;
                
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': getCsrfToken()
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        showNotification(data.error, 'error');
                    } else {
                        showNotification('B站信息已刷新', 'success');
                        location.reload();
                    }
                })
                .catch(error => {
                    console.error('刷新B站信息失败:', error);
                    showNotification('刷新B站信息失败，请重试', 'error');
                });
            });
        }
    }
    
    window.addEventListener('error', function(e) {
        console.error('页面错误:', e.error);
        showNotification('页面发生错误，请刷新重试', 'error');
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('未处理的Promise拒绝:', e.reason);
        showNotification('网络请求失败，请检查网络连接', 'error');
    });
});