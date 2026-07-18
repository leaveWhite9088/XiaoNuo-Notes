const state = {
  currentQuery: "",
  currentVideo: null,
  qrSessionId: null,
  qrTimer: null,
  favoritesSelectedId: null,
};

const refs = {
  queryInput: document.getElementById("queryInput"),
  loadVideoBtn: document.getElementById("loadVideoBtn"),
  officialLink: document.getElementById("officialLink"),
  playerFrame: document.getElementById("playerFrame"),
  videoInfo: document.getElementById("videoInfo"),
  hotList: document.getElementById("hotList"),
  refreshHotBtn: document.getElementById("refreshHotBtn"),
  commentList: document.getElementById("commentList"),
  danmakuList: document.getElementById("danmakuList"),
  refreshCommentsBtn: document.getElementById("refreshCommentsBtn"),
  refreshDanmakuBtn: document.getElementById("refreshDanmakuBtn"),
  authStatus: document.getElementById("authStatus"),
  sessdataInput: document.getElementById("sessdataInput"),
  biliJctInput: document.getElementById("biliJctInput"),
  buvid3Input: document.getElementById("buvid3Input"),
  buvid4Input: document.getElementById("buvid4Input"),
  dedeUserIdInput: document.getElementById("dedeUserIdInput"),
  acTimeInput: document.getElementById("acTimeInput"),
  cookieLoginBtn: document.getElementById("cookieLoginBtn"),
  startQrBtn: document.getElementById("startQrBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  qrArea: document.getElementById("qrArea"),
  qrImage: document.getElementById("qrImage"),
  qrStatusText: document.getElementById("qrStatusText"),
  commentInput: document.getElementById("commentInput"),
  sendCommentBtn: document.getElementById("sendCommentBtn"),
  danmakuInput: document.getElementById("danmakuInput"),
  dmTimeInput: document.getElementById("dmTimeInput"),
  sendDanmakuBtn: document.getElementById("sendDanmakuBtn"),
  favFolders: document.getElementById("favFolders"),
  favVideos: document.getElementById("favVideos"),
  refreshFavBtn: document.getElementById("refreshFavBtn"),
  toast: document.getElementById("toast"),
};

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.detail || "请求失败");
  }
  return payload;
}

function toast(message, timeout = 2600) {
  refs.toast.textContent = message;
  refs.toast.classList.remove("hidden");
  setTimeout(() => refs.toast.classList.add("hidden"), timeout);
}

function formatNumber(value) {
  if (value === null || value === undefined) return "-";
  if (value < 10000) return `${value}`;
  return `${(value / 10000).toFixed(1)}万`;
}

function formatDate(ts) {
  if (!ts) return "-";
  const date = new Date(ts * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setEmpty(el, text) {
  el.innerHTML = `<div class="empty">${escapeHtml(text)}</div>`;
}

function getCurrentQueryOrThrow() {
  const query = state.currentQuery || refs.queryInput.value.trim();
  if (!query) throw new Error("请先输入并加载视频");
  return query;
}

function buildVideoCard(item) {
  const div = document.createElement("div");
  div.className = "video-card";
  const cover = escapeHtml(item.cover || "");
  const title = escapeHtml(item.title || "无标题");
  const owner = escapeHtml(item.owner || item.upper_name || "UP主未知");
  div.innerHTML = `
    <img src="${cover}" alt="${title || "封面"}" />
    <div class="video-card-body">
      <p class="video-card-title">${title}</p>
      <div class="video-card-meta">
        ${owner} · 播放 ${formatNumber(item.view || item.play)}
      </div>
    </div>
  `;
  const key = item.bvid || (item.aid ? `av${item.aid}` : "");
  if (key) {
    div.addEventListener("click", () => loadVideoInfo(key));
  }
  return div;
}

function renderVideoInfo(video) {
  state.currentVideo = video;
  refs.playerFrame.src = video.player_url || "";
  refs.officialLink.href = video.official_url || "#";
  const title = escapeHtml(video.title || "未命名视频");
  const bvid = escapeHtml(video.bvid || "-");
  const aid = escapeHtml(video.aid || "-");
  const tname = escapeHtml(video.tname || "-");
  const desc = escapeHtml(video.desc || "暂无简介");
  refs.videoInfo.innerHTML = `
    <h3>${title}</h3>
    <div class="meta-row">
      <span class="meta-pill">BV: ${bvid}</span>
      <span class="meta-pill">AV: ${aid}</span>
      <span class="meta-pill">分区: ${tname}</span>
      <span class="meta-pill">发布时间: ${formatDate(video.pubdate)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-pill">播放 ${formatNumber(video.stat?.view)}</span>
      <span class="meta-pill">点赞 ${formatNumber(video.stat?.like)}</span>
      <span class="meta-pill">评论 ${formatNumber(video.stat?.reply)}</span>
      <span class="meta-pill">弹幕 ${formatNumber(video.stat?.danmaku)}</span>
    </div>
    <p>${desc}</p>
  `;
}

async function loadHotVideos() {
  setEmpty(refs.hotList, "加载热门中...");
  try {
    const data = await api("/api/hot?ps=10");
    refs.hotList.innerHTML = "";
    if (!data.list?.length) {
      setEmpty(refs.hotList, "暂无热门数据");
      return;
    }
    data.list.forEach((item) => refs.hotList.appendChild(buildVideoCard(item)));
    if (!state.currentQuery && data.list[0]?.bvid) {
      await loadVideoInfo(data.list[0].bvid);
    }
  } catch (err) {
    setEmpty(refs.hotList, `热门加载失败：${err.message}`);
  }
}

async function loadVideoInfo(query) {
  const finalQuery = query || refs.queryInput.value.trim();
  if (!finalQuery) {
    toast("请输入视频编号或链接");
    return;
  }
  refs.queryInput.value = finalQuery;
  state.currentQuery = finalQuery;
  refs.videoInfo.innerHTML = `<div class="empty">视频加载中...</div>`;
  try {
    const data = await api("/api/video/info", {
      method: "POST",
      body: JSON.stringify({ query: finalQuery }),
    });
    renderVideoInfo(data);
    await Promise.all([loadComments(), loadDanmaku()]);
  } catch (err) {
    setEmpty(refs.videoInfo, `视频加载失败：${err.message}`);
  }
}

function renderComments(list) {
  refs.commentList.innerHTML = "";
  if (!list.length) {
    setEmpty(refs.commentList, "暂无评论或评论不可见");
    return;
  }
  list.forEach((item) => {
    const div = document.createElement("div");
    div.className = "list-item";
    const uname = escapeHtml(item.uname || "匿名用户");
    const message = escapeHtml(item.message || "");
    div.innerHTML = `
      <div class="title">${uname}</div>
      <div>${message}</div>
      <div class="sub">点赞 ${formatNumber(item.like)} · ${formatDate(item.ctime)}</div>
    `;
    refs.commentList.appendChild(div);
  });
}

async function loadComments() {
  let query;
  try {
    query = getCurrentQueryOrThrow();
  } catch (err) {
    setEmpty(refs.commentList, err.message);
    return;
  }
  refs.commentList.innerHTML = `<div class="empty">评论加载中...</div>`;
  try {
    const data = await api(`/api/video/comments?query=${encodeURIComponent(query)}&page=1&order=time`);
    renderComments(data.list || []);
  } catch (err) {
    setEmpty(refs.commentList, `评论加载失败：${err.message}`);
  }
}

function renderDanmaku(list) {
  refs.danmakuList.innerHTML = "";
  if (!list.length) {
    setEmpty(refs.danmakuList, "暂无弹幕数据");
    return;
  }
  list.forEach((item) => {
    const div = document.createElement("div");
    div.className = "list-item";
    const text = escapeHtml(item.text || "");
    div.innerHTML = `
      <div class="title">${text}</div>
      <div class="sub">时间点 ${item.dm_time}s · 模式 ${item.mode} · 颜色 #${escapeHtml(item.color)}</div>
    `;
    refs.danmakuList.appendChild(div);
  });
}

async function loadDanmaku() {
  let query;
  try {
    query = getCurrentQueryOrThrow();
  } catch (err) {
    setEmpty(refs.danmakuList, err.message);
    return;
  }
  refs.danmakuList.innerHTML = `<div class="empty">弹幕加载中...</div>`;
  try {
    const data = await api(
      `/api/video/danmaku?query=${encodeURIComponent(query)}&from_seg=1&to_seg=1&limit=120`
    );
    renderDanmaku(data.list || []);
  } catch (err) {
    setEmpty(refs.danmakuList, `弹幕加载失败：${err.message}`);
  }
}

function renderAuthStatus(data) {
  if (!data.logged_in) {
    refs.authStatus.innerHTML = `<span>未登录</span>`;
    return;
  }
  refs.authStatus.innerHTML = `
    <span style="color: var(--ok);">已登录</span>：
    ${escapeHtml(data.user?.name || "未知用户")}（UID: ${escapeHtml(data.user?.uid || "-")}）
  `;
}

async function refreshAuthStatus() {
  try {
    const data = await api("/api/auth/status");
    renderAuthStatus(data);
    if (data.logged_in) {
      await loadFavorites();
    } else {
      refs.favFolders.innerHTML = "";
      setEmpty(refs.favVideos, "登录后可查看收藏视频");
    }
  } catch (err) {
    refs.authStatus.textContent = `状态读取失败：${err.message}`;
  }
}

async function cookieLogin() {
  if (!refs.sessdataInput.value.trim()) {
    toast("SESSDATA 不能为空");
    return;
  }
  try {
    const data = await api("/api/auth/login/cookie", {
      method: "POST",
      body: JSON.stringify({
        sessdata: refs.sessdataInput.value.trim(),
        bili_jct: refs.biliJctInput.value.trim(),
        buvid3: refs.buvid3Input.value.trim(),
        buvid4: refs.buvid4Input.value.trim(),
        dedeuserid: refs.dedeUserIdInput.value.trim(),
        ac_time_value: refs.acTimeInput.value.trim(),
      }),
    });
    toast(`登录成功：${data.user?.name || "账号"}`);
    await refreshAuthStatus();
  } catch (err) {
    toast(`登录失败：${err.message}`);
  }
}

function stopQrPolling() {
  if (state.qrTimer) {
    clearInterval(state.qrTimer);
    state.qrTimer = null;
  }
}

async function startQrLogin() {
  stopQrPolling();
  try {
    const data = await api("/api/auth/qr/start", { method: "POST" });
    state.qrSessionId = data.session_id;
    refs.qrArea.classList.remove("hidden");
    refs.qrImage.src = `data:image/png;base64,${data.image_base64}`;
    refs.qrStatusText.textContent = "请使用哔哩哔哩 App 扫码并确认登录";
    state.qrTimer = setInterval(pollQrLogin, 2200);
  } catch (err) {
    toast(`二维码生成失败：${err.message}`);
  }
}

async function pollQrLogin() {
  if (!state.qrSessionId) return;
  try {
    const data = await api(`/api/auth/qr/poll?session_id=${encodeURIComponent(state.qrSessionId)}`);
    if (data.event === "scan") {
      refs.qrStatusText.textContent = "已扫码，请在手机上确认";
      return;
    }
    if (data.event === "confirm") {
      refs.qrStatusText.textContent = "已确认，正在登录...";
      return;
    }
    if (data.event === "done") {
      stopQrPolling();
      refs.qrStatusText.textContent = "登录成功";
      toast(`欢迎回来：${data.user?.name || "用户"}`);
      await refreshAuthStatus();
      return;
    }
    if (data.event === "timeout") {
      stopQrPolling();
      refs.qrStatusText.textContent = "二维码已过期，请重新生成";
    }
  } catch (err) {
    stopQrPolling();
    refs.qrStatusText.textContent = `轮询失败：${err.message}`;
  }
}

async function logout() {
  stopQrPolling();
  try {
    await api("/api/auth/logout", { method: "POST" });
    toast("已退出登录");
    await refreshAuthStatus();
  } catch (err) {
    toast(`退出失败：${err.message}`);
  }
}

async function sendComment() {
  let query;
  try {
    query = getCurrentQueryOrThrow();
  } catch (err) {
    toast(err.message);
    return;
  }
  const text = refs.commentInput.value.trim();
  if (!text) {
    toast("评论内容不能为空");
    return;
  }
  try {
    await api("/api/video/comment/send", {
      method: "POST",
      body: JSON.stringify({ query, text }),
    });
    toast("评论发送成功");
    refs.commentInput.value = "";
    await loadComments();
  } catch (err) {
    toast(`评论发送失败：${err.message}`);
  }
}

async function sendDanmaku() {
  let query;
  try {
    query = getCurrentQueryOrThrow();
  } catch (err) {
    toast(err.message);
    return;
  }
  const text = refs.danmakuInput.value.trim();
  if (!text) {
    toast("弹幕内容不能为空");
    return;
  }
  const dmTime = Number(refs.dmTimeInput.value || 0);
  try {
    await api("/api/video/danmaku/send", {
      method: "POST",
      body: JSON.stringify({ query, text, dm_time: dmTime, page_index: 0, mode: 1, font_size: 25, color: "ffffff" }),
    });
    toast("弹幕发送成功");
    refs.danmakuInput.value = "";
    refs.dmTimeInput.value = "";
    await loadDanmaku();
  } catch (err) {
    toast(`弹幕发送失败：${err.message}`);
  }
}

function renderFavoriteFolders(folders, selectedId) {
  refs.favFolders.innerHTML = "";
  folders.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = `folder-tab ${Number(item.id) === Number(selectedId) ? "active" : ""}`;
    btn.textContent = `${item.title || "未命名收藏夹"} (${item.media_count || 0})`;
    btn.addEventListener("click", () => {
      state.favoritesSelectedId = item.id;
      loadFavorites(item.id);
    });
    refs.favFolders.appendChild(btn);
  });
}

function renderFavoriteVideos(videos) {
  refs.favVideos.innerHTML = "";
  if (!videos.length) {
    setEmpty(refs.favVideos, "当前收藏夹没有视频");
    return;
  }
  videos.forEach((item) => {
    refs.favVideos.appendChild(buildVideoCard(item));
  });
}

async function loadFavorites(mediaId = state.favoritesSelectedId) {
  try {
    const query = mediaId ? `?media_id=${encodeURIComponent(mediaId)}` : "";
    const data = await api(`/api/me/favorites${query}`);
    renderFavoriteFolders(data.folders || [], data.selected_media_id);
    renderFavoriteVideos(data.videos || []);
    state.favoritesSelectedId = data.selected_media_id || null;
  } catch (err) {
    refs.favFolders.innerHTML = "";
    setEmpty(refs.favVideos, `收藏读取失败：${err.message}`);
  }
}

function bindEvents() {
  refs.loadVideoBtn.addEventListener("click", () => loadVideoInfo());
  refs.queryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadVideoInfo();
  });
  refs.refreshHotBtn.addEventListener("click", loadHotVideos);
  refs.refreshCommentsBtn.addEventListener("click", loadComments);
  refs.refreshDanmakuBtn.addEventListener("click", loadDanmaku);
  refs.cookieLoginBtn.addEventListener("click", cookieLogin);
  refs.startQrBtn.addEventListener("click", startQrLogin);
  refs.logoutBtn.addEventListener("click", logout);
  refs.sendCommentBtn.addEventListener("click", sendComment);
  refs.sendDanmakuBtn.addEventListener("click", sendDanmaku);
  refs.refreshFavBtn.addEventListener("click", () => loadFavorites());
}

async function boot() {
  bindEvents();
  await Promise.all([loadHotVideos(), refreshAuthStatus()]);
}

boot();
