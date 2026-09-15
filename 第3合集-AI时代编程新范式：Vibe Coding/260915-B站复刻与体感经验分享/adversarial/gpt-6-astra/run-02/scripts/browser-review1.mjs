// Run through ego-browser nodejs; bootstrap values come from browser-input.mjs.
const { writeFile, readFile, mkdir } = await import("node:fs/promises");
const assert = (await import("node:assert/strict")).default;
const task = await taskSpace(existingSpace || "B站 Review 1 浏览器回归");
console.log({ spaceId: task.spaceId });
const page = task.page("p1");
const output = projectRoot + "/artifacts/review1";
await mkdir(output, { recursive: true });
const prior = checkFrom
  ? JSON.parse(await readFile(output + "/browser-results.json", "utf8")).results
  : [];
const startIndex = prior.findIndex((result) => result.name === checkFrom);
const results = checkFrom
  ? prior.slice(0, startIndex < 0 ? prior.length : startIndex)
  : [];
let started = !checkFrom;
const step = async (name, run) => {
  if (!started) {
    if (name !== checkFrom) return;
    started = true;
  }
  try {
    const details = await run();
    results.push({ name, status: "PASS", details });
    console.log("PASS " + name, details || "");
  } catch (error) {
    results.push({ name, status: "FAIL", error: String(error) });
    throw error;
  } finally {
    await writeFile(
      output + "/browser-results.json",
      JSON.stringify(
        { time: new Date().toISOString(), spaceId: task.spaceId, results },
        null,
        2,
      ),
    );
  }
};
const open = async (path = "/") => {
  await page.goto("http://localhost:3302" + path);
  await page.waitForSelector(
    path.startsWith("/video/") ? "video" : ".video-card",
  );
};
const list = () =>
  page.evaluate(() => ({
    ids: [...document.querySelectorAll(".video-card")].map((a) =>
      a.getAttribute("href"),
    ),
    total: document.querySelector(".results-label small")?.textContent || null,
    more: !!document.querySelector(".load-more button"),
    disabled: document.querySelector(".load-more button")?.disabled || false,
  }));
await page.cdp("Page.addScriptToEvaluateOnNewDocument", {
  source:
    'window.__browserErrors=[];addEventListener("error",e=>{if(e.message)window.__browserErrors.push(e.message)});addEventListener("unhandledrejection",e=>window.__browserErrors.push(String(e.reason)));',
});
await page.cdp("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await step("端口、桌面布局、卡片 hover 与菜单", async () => {
  await open();
  const health = await page.evaluate(async () => {
    const r = await fetch("/api/health");
    return { status: r.status, ...(await r.json()) };
  });
  assert.equal(health.port, 5302);
  assert.equal(health.status, "ok");
  await page.hover(".video-card >> nth=0");
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".hover-play")).opacity === "1",
  );
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    count: document.querySelectorAll(".video-card").length,
    hover: getComputedStyle(document.querySelector(".hover-play")).opacity,
  }));
  assert.equal(layout.width, layout.scrollWidth);
  assert.equal(layout.count, 20);
  await page.screenshot({ path: output + "/desktop.png" });
  await page.hover('loc=role:button[name="游戏中心"]');
  await page.waitForSelector(".nav-popover");
  await page.click('loc=role:link[name="游戏推荐"]');
  await page.waitForFunction(
    () => document.querySelectorAll(".video-card").length === 1,
  );
  return { frontend: 3302, backend: 5302, ...layout };
});
for (const mode of ["分类", "搜索", "换一换"])
  await step("旧分页竞态：" + mode, async () => {
    await open();
    await page.evaluate(() => {
      const original = window.fetch;
      window.fetch = async (url, options) => {
        if (String(url).includes("/home?") && String(url).includes("page=2")) {
          const response = await original(url, {
            ...options,
            signal: undefined,
          });
          return new Promise((resolve) => {
            window.__releasePage = () => resolve(response);
          });
        }
        return original(url, options);
      };
    });
    await page.click(".load-more button");
    await page.waitForFunction(
      () => typeof window.__releasePage === "function",
    );
    if (mode === "分类")
      await page.click('.channel-grid>button:text-is("美食")');
    if (mode === "搜索") {
      await page.fill('input[aria-label="搜索视频"]', "猫咪");
      await page.click('button[aria-label="搜索"]');
    }
    if (mode === "换一换") await page.click(".refresh-button");
    const expected = mode === "分类" ? 2 : mode === "搜索" ? 1 : 20;
    await page.waitForFunction(
      (n) => document.querySelectorAll(".video-card").length === n,
      expected,
    );
    if (mode === "换一换")
      await page.waitForFunction(
        () =>
          document.querySelector(".video-card")?.getAttribute("href") ===
          "/video/BV1demo002",
      );
    const before = await list();
    await page.evaluate(async () => {
      window.__releasePage();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    assert.deepEqual(await list(), before);
    assert.equal(before.ids.length, expected);
    if (mode !== "换一换") assert.equal(before.total, expected + " 个视频");
    else assert.equal(before.disabled, false);
    return before;
  });
await step("搜索建议缩短、关闭、清空后回车", async () => {
  await open();
  await page.evaluate(() => {
    const original = window.fetch;
    window.fetch = async (url, options) => {
      if (
        String(url).includes("/suggestions?q=") &&
        String(url).includes(encodeURIComponent("猫咪"))
      ) {
        const response = await original(url, options);
        return new Promise((resolve) => {
          window.__releaseSuggestions = () => resolve(response);
        });
      }
      return original(url, options);
    };
  });
  await page.click('input[aria-label="搜索视频"]');
  await page.waitForFunction(
    () => document.querySelectorAll(".search-panel>button").length === 6,
  );
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowDown");
  await page.fill('input[aria-label="搜索视频"]', "猫咪");
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowDown");
  await page.waitForFunction(
    () => typeof window.__releaseSuggestions === "function",
  );
  await page.evaluate(() => window.__releaseSuggestions());
  await page.waitForFunction(
    () => document.querySelectorAll(".search-panel>button").length === 1,
  );
  await page.keyboard.press("Escape");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => document.querySelectorAll(".video-card").length === 1,
  );
  const searched = await page.url();
  assert.ok(searched.includes(encodeURIComponent("猫咪")));
  await page.click('button[aria-label="清空搜索"]');
  await page.focus('input[aria-label="搜索视频"]');
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => document.querySelectorAll(".video-card").length === 20,
  );
  assert.deepEqual(await page.evaluate(() => window.__browserErrors), []);
  return { searched, afterClear: await page.url(), errors: [] };
});
await step("浏览器后退恢复 24 张卡片、排列和位置", async () => {
  await open();
  await page.click(".refresh-button");
  await page.waitForFunction(
    () =>
      document.querySelector(".video-card")?.getAttribute("href") ===
      "/video/BV1demo002",
  );
  await page.click(".load-more button");
  await page.waitForFunction(
    () => document.querySelectorAll(".video-card").length === 24,
  );
  await page.evaluate(() => window.scrollTo(0, 650));
  const before = await list();
  const y = await page.evaluate(() => window.scrollY);
  await page.click(".video-card >> nth=12");
  await page.waitForSelector("video");
  await page.evaluate(() => history.back());
  await page.waitForSelector(".video-card");
  assert.deepEqual(await list(), before);
  const restored = await page.evaluate(() => scrollY);
  assert.ok(Math.abs(restored - y) < 3, `scroll ${restored} != ${y}`);
  await page.screenshot({ path: output + "/restored-feed.png" });
  return {
    count: before.ids.length,
    first: before.ids[0],
    scrollBefore: y,
    scrollAfter: restored,
  };
});
await step("分类与搜索历史条目后退恢复", async () => {
  await open("/?category=" + encodeURIComponent("美食"));
  const categoryBefore = await list();
  await page.click(".video-card >> nth=0");
  await page.waitForSelector("video");
  await page.evaluate(() => history.back());
  await page.waitForSelector(".video-card");
  assert.deepEqual(await list(), categoryBefore);
  assert.ok((await page.url()).includes("category="));
  await open("/?q=" + encodeURIComponent("猫咪"));
  const queryBefore = await list();
  await page.click(".video-card >> nth=0");
  await page.waitForSelector("video");
  await page.evaluate(() => history.back());
  await page.waitForSelector(".video-card");
  assert.deepEqual(await list(), queryBefore);
  return { category: categoryBefore.total, search: queryBefore.total };
});
await step("详情草稿隔离与重复弹幕可见", async () => {
  await open("/video/BV1demo001");
  await page.fill('textarea[aria-label="评论内容"]', "留在这个视频的草稿");
  const sends = [];
  for (let i = 1; i <= 2; i++) {
    await page.fill('input[aria-label="发送弹幕"]', "重复弹幕");
    await page.click(".danmaku-bar form button");
    await page.waitForFunction((id) => {
      const d = document.querySelector(".danmaku");
      if (!d || d.dataset.sendId !== String(id)) return false;
      const a = d.getBoundingClientRect(),
        b = document.querySelector(".player").getBoundingClientRect();
      return a.left < b.right - 30 && a.right > b.left;
    }, i);
    sends.push(
      await page.evaluate(() => ({
        id: document.querySelector(".danmaku").dataset.sendId,
        text: document.querySelector(".danmaku").textContent,
      })),
    );
  }
  await page.screenshot({ path: output + "/repeat-danmaku.png" });
  await page.fill('input[aria-label="发送弹幕"]', "不应串视频");
  const old = await page.url();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click(".related-list .video-card >> nth=0");
  await page.waitForFunction((url) => location.href !== url, old);
  await page.waitForSelector('textarea[aria-label="评论内容"]');
  const drafts = await page.evaluate(() => ({
    comment: document.querySelector('textarea[aria-label="评论内容"]').value,
    danmaku: document.querySelector('input[aria-label="发送弹幕"]').value,
    display: !!document.querySelector(".danmaku"),
  }));
  assert.deepEqual(drafts, { comment: "", danmaku: "", display: false });
  return { sends, drafts };
});
await step("禁用提交的焦点循环、启用后循环和 Escape 恢复", async () => {
  await open();
  await page.click(".avatar-login");
  await page.waitForSelector("[role=dialog]");
  await page.keyboard.press("Shift+Tab");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement.getAttribute("aria-label"),
    ),
    "昵称",
  );
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement.getAttribute("aria-label"),
    ),
    "关闭弹窗",
  );
  await page.keyboard.press("Tab");
  await page.fill('input[aria-label="昵称"]', "浏览器测试");
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.textContent.trim()),
    "进入体验",
  );
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement.getAttribute("aria-label"),
    ),
    "关闭弹窗",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "avatar-login",
  );
  await page.click(".floating-tools button >> nth=0");
  await page.waitForSelector("[role=dialog]");
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press(i % 2 ? "Tab" : "Shift+Tab");
    assert.equal(
      await page.evaluate(() =>
        document
          .querySelector("[role=dialog]")
          .contains(document.activeElement),
      ),
      true,
    );
  }
  await page.keyboard.press("Escape");
  return { login: true, feedback: true, focusRestored: true };
});
for (const [id, name] of [
  ["BV1demo001", "sintel"],
  ["BV1demo002", "flower"],
])
  await step("真实媒体播放、暂停与原生进度条拖动：" + name, async () => {
    await open("/video/" + id);
    await page.waitForFunction(
      () => document.querySelector("video").readyState >= 2,
    );
    await page.hover("video");
    const rect = await page.evaluate(() => {
      const r = document.querySelector("video").getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    await page.mouse.click(rect.x + 24, rect.y + rect.h - 48, {
      label: "播放本地视频样片",
    });
    await page.waitForFunction(() => {
      const v = document.querySelector("video");
      return !v.paused && v.currentTime > 0.55;
    });
    await page.mouse.click(rect.x + 24, rect.y + rect.h - 48, {
      label: "暂停本地视频样片",
    });
    await page.waitForFunction(() => document.querySelector("video").paused);
    const paused = await page.evaluate(() => ({
      time: document.querySelector("video").currentTime,
      duration: document.querySelector("video").duration,
      frames: document.querySelector("video").getVideoPlaybackQuality()
        .totalVideoFrames,
    }));
    assert.ok(paused.frames > 0);
    const sliderStart =
        rect.x + 17 + (rect.w - 34) * (paused.time / paused.duration),
      sliderY = rect.y + rect.h - 22;
    await page.mouse.move(sliderStart, sliderY);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.w * 0.6, sliderY);
    await page.mouse.up();
    await page.waitForFunction(() => {
      const v = document.querySelector("video");
      return !v.seeking && v.currentTime > v.duration * 0.45;
    });
    const seek = await page.evaluate(async () => {
      const v = document.querySelector("video");
      const t = v.currentTime;
      await new Promise((resolve) => setTimeout(resolve, 250));
      return {
        time: v.currentTime,
        stable: Math.abs(v.currentTime - t) < 0.05,
        paused: v.paused,
        error: v.error?.message || null,
      };
    });
    assert.equal(seek.paused, true);
    assert.equal(seek.stable, true);
    assert.equal(seek.error, null);
    await page.screenshot({ path: output + "/player-" + name + ".png" });
    await page.click(".back-home");
    await page.waitForSelector(".video-card");
    return { paused, seek, returnedHome: true };
  });
await step("封面占位和媒体失败重试分别验证", async () => {
  await open("/video/BV1demo001");
  await page.evaluate(() => {
    document.querySelector(".related-list img").src =
      "/missing-cover-review1.jpg";
  });
  await page.waitForFunction(
    () =>
      document.querySelector(".related-list img").getAttribute("src") ===
      "/fallback.svg",
  );
  assert.equal(
    await page.evaluate(() => !!document.querySelector(".player-error")),
    false,
  );
  await page.evaluate(() => {
    const v = document.querySelector("video");
    v.src = "/missing-media-review1.mp4";
    v.load();
  });
  await page.waitForSelector(".player-error");
  await page.screenshot({ path: output + "/media-error.png" });
  await page.evaluate(() => {
    document.querySelector("video").src = "/media/sintel.mp4";
  });
  await page.click(".player-error button");
  await page.waitForFunction(
    () =>
      document.querySelector("video").readyState >= 2 &&
      !document.querySelector(".player-error"),
  );
  return { coverFallback: true, mediaError: true, retryRecovered: true };
});
await step("375px 窄屏布局、收藏历史和完整分类", async () => {
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 812,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await open();
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.equal(layout.width, layout.scrollWidth);
  await page.click('button[aria-label="打开功能菜单"]');
  await page.waitForSelector(".mobile-navigation");
  await page.screenshot({ path: output + "/mobile-menu.png" });
  await page.click('.mobile-navigation button:text-is("收藏")');
  await page.waitForFunction(
    () => document.querySelector("#modal-title")?.textContent === "我的收藏",
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement.getAttribute("aria-label"),
    ),
    "打开功能菜单",
  );
  await page.click('button[aria-label="打开功能菜单"]');
  await page.click('.mobile-navigation button:text-is("历史")');
  await page.waitForFunction(
    () => document.querySelector("#modal-title")?.textContent === "观看历史",
  );
  await page.keyboard.press("Escape");
  await page.click(".more-channel>button");
  await page.waitForSelector(".more-menu");
  const count = await page.evaluate(
    () => document.querySelectorAll(".more-menu button").length,
  );
  assert.equal(count, 23);
  await page.screenshot({ path: output + "/mobile-categories.png" });
  await page.click('.more-menu button:text-is("动物圈")');
  await page.waitForFunction(
    () => document.querySelectorAll(".video-card").length === 2,
  );
  await page.screenshot({ path: output + "/mobile.png" });
  return {
    ...layout,
    accessibleCategories: count,
    favorites: true,
    history: true,
  };
});
console.log("BROWSER CHECKS COMPLETE: " + results.length + " passed");
// A resumed Dev run stays open for artifact inspection; standalone replay closes its space.
if (!existingSpace) await task.finish({ keep: [] });
