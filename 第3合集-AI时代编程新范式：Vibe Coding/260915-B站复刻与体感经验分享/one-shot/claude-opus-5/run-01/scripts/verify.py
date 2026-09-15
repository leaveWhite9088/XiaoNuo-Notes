"""
端到端自检脚本（Playwright + 本机 Chrome）：
覆盖首页渲染、卡片 hover 预览、顶栏菜单展开、频道"更多"面板、搜索建议、
分类筛选、换一换、视频详情跳转 + 真实播放、发弹幕、点赞、相关推荐跳转、返回首页。
运行: python3 scripts/verify.py
"""
import sys, time
from playwright.sync_api import sync_playwright, expect

BASE = "http://127.0.0.1:3601"
SHOTS = "/tmp/bili-shots"
results = []
console_errors = []


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("PASS  " if ok else "FAIL  ") + name + ((" | " + str(detail)) if detail else ""))


def main():
    import os
    os.makedirs(SHOTS, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            args=["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
        )
        page = browser.new_page(viewport={"width": 1680, "height": 1000})
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(str(e)))

        # ---------------- 首页 ----------------
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(1200)
        cards = page.locator(".video-card")
        check("首页信息流渲染卡片", cards.count() >= 20, f"{cards.count()} 张卡片")
        check("轮播图渲染", page.locator(".banner__slide.is-active img").is_visible())
        broken = page.evaluate(
            "Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0).length"
        )
        check("首屏图片全部加载成功", broken == 0, f"{broken} 张失败")
        page.screenshot(path=f"{SHOTS}/01-home.png")

        # ---------------- 卡片 hover 预览 ----------------
        first = cards.nth(0)
        first.hover()
        page.wait_for_timeout(1800)
        preview_playing = page.evaluate(
            """() => {
                const v = document.querySelectorAll('.video-card')[0].querySelector('video');
                return v ? {playing: !v.paused && v.currentTime > 0, t: v.currentTime} : null;
            }"""
        )
        check("卡片 hover 自动播放预览", bool(preview_playing and preview_playing["playing"]), preview_playing)
        check("卡片 hover 出现稍后再看按钮",
              page.locator(".video-card").nth(0).locator(".video-card__later").is_visible())
        page.screenshot(path=f"{SHOTS}/02-card-hover.png")

        # ---------------- 顶栏菜单展开 ----------------
        page.locator(".user-zone__avatar").hover()
        page.wait_for_timeout(600)
        check("头像 hover 展开个人卡片", page.locator(".user-card__stats").is_visible())
        page.screenshot(path=f"{SHOTS}/03-user-card.png")

        page.mouse.move(900, 700)
        page.wait_for_timeout(500)
        page.locator(".user-zone__entry-inner", has_text="动态").first.hover()
        page.wait_for_timeout(700)
        check("动态 hover 展开动态列表", page.locator(".list-panel__item").first.is_visible())
        page.screenshot(path=f"{SHOTS}/04-dynamic-panel.png")

        # ---------------- 频道"更多"面板 ----------------
        page.locator(".channel-nav__more-btn").hover()
        page.wait_for_timeout(600)
        check("频道更多面板展开", page.locator(".channel-panel__grid").first.is_visible())
        page.screenshot(path=f"{SHOTS}/05-channel-more.png")
        page.mouse.move(900, 700)
        page.wait_for_timeout(400)

        # ---------------- 搜索建议 ----------------
        page.locator(".search-box__input").click()
        page.wait_for_timeout(400)
        check("搜索框聚焦展示热搜", page.locator(".search-box__hot-item").first.is_visible())
        page.locator(".search-box__input").type("电影", delay=90)
        page.wait_for_timeout(900)
        suggests = page.locator(".search-box__item")
        check("输入关键词出现搜索建议", suggests.count() > 0, f"{suggests.count()} 条建议")
        check("搜索建议命中高亮", page.locator(".search-box__hit").count() > 0)
        page.screenshot(path=f"{SHOTS}/06-search-suggest.png")

        # ---------------- 搜索结果页 ----------------
        page.keyboard.press("Enter")
        page.wait_for_url("**/search?keyword=**")
        page.wait_for_timeout(1200)
        result_count = page.locator(".video-card").count()
        check("搜索结果页渲染结果", result_count > 0, f"{result_count} 条结果")
        page.locator(".search-page__orders button", has_text="最多播放").click()
        page.wait_for_timeout(900)
        check("搜索结果排序筛选可用", page.locator(".video-card").count() > 0)
        page.screenshot(path=f"{SHOTS}/07-search-result.png")

        # ---------------- 返回首页 + 分区筛选 ----------------
        page.locator(".header__logo").click()
        page.wait_for_url(BASE + "/")
        page.wait_for_timeout(1000)
        page.locator(".channel-nav__item", has_text="游戏").first.click()
        page.wait_for_timeout(1200)
        check("分区筛选切换 URL", "channel=game" in page.url, page.url)
        check("分区筛选后信息流有内容", page.locator(".video-card").count() > 0)
        check("分区标题切换", page.locator(".feed-toolbar__title h2").inner_text().strip() == "游戏",
              page.locator(".feed-toolbar__title h2").inner_text())
        page.screenshot(path=f"{SHOTS}/08-channel-filter.png")

        # ---------------- 换一换 ----------------
        before = page.locator(".video-card__title").first.inner_text()
        page.locator(".feed-toolbar__shuffle").click()
        page.wait_for_timeout(1200)
        after = page.locator(".video-card__title").first.inner_text()
        check("换一换刷新内容", before != after, f"{before[:12]} -> {after[:12]}")

        # 回到推荐流
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(1000)

        # ---------------- 滚动加载更多 ----------------
        count_before = page.locator(".video-card").count()
        page.mouse.wheel(0, 6000)
        page.wait_for_timeout(1800)
        count_after = page.locator(".video-card").count()
        check("滚动自动加载更多", count_after > count_before, f"{count_before} -> {count_after}")
        check("回顶部按钮出现", page.locator(".side-toolbar__top.is-visible").is_visible())
        page.evaluate("window.scrollTo(0,0)")
        page.wait_for_timeout(600)

        # ---------------- 进入播放页 ----------------
        title_in_feed = page.locator(".video-card__title").first.inner_text()
        page.locator(".video-card__cover").first.click()
        page.wait_for_url("**/video/**")
        page.wait_for_timeout(2500)
        check("跳转到视频详情页", "/video/BV" in page.url, page.url)
        check("详情页标题与卡片一致",
              page.locator(".video-page__title").inner_text().strip() == title_in_feed.strip(),
              page.locator(".video-page__title").inner_text())

        state = page.evaluate(
            """() => new Promise(res => {
                const v = document.querySelector('.player__video');
                const t0 = v.currentTime;
                setTimeout(() => res({
                    t0, t1: v.currentTime, paused: v.paused,
                    duration: v.duration, readyState: v.readyState,
                    w: v.videoWidth, h: v.videoHeight, src: v.currentSrc
                }), 1500);
            })"""
        )
        check("播放器真实播放中（时间在推进）",
              state["t1"] > state["t0"] and not state["paused"],
              state)
        check("视频解码有画面尺寸", state["w"] > 0 and state["h"] > 0, f'{state["w"]}x{state["h"]}')
        page.wait_for_timeout(1500)
        dm = page.locator(".player__danmaku .danmaku").count()
        check("弹幕正在滚动", dm > 0, f"{dm} 条在屏弹幕")
        page.screenshot(path=f"{SHOTS}/09-video-play.png")

        # ---------------- 发弹幕 ----------------
        page.locator(".player__danmaku-input input").fill("自检弹幕：一键三连！")
        page.locator(".player__send").click()
        page.wait_for_timeout(800)
        check("发送弹幕后出现在屏幕上", page.locator(".danmaku.is-self").count() > 0)
        page.screenshot(path=f"{SHOTS}/10-danmaku-sent.png")

        # ---------------- 点赞（同时校验后端计数真的 +1） ----------------
        bvid = page.url.rsplit("/", 1)[-1]
        api_before = page.evaluate(
            "b => fetch(`/api/videos/${b}`).then(r => r.json()).then(j => j.data.stats.like)", bvid
        )
        page.locator(".action-bar__item").first.click()
        page.wait_for_timeout(900)
        api_after = page.evaluate(
            "b => fetch(`/api/videos/${b}`).then(r => r.json()).then(j => j.data.stats.like)", bvid
        )
        check("点赞按钮进入已点亮状态",
              page.locator(".action-bar__item.is-active").count() > 0)
        check("点赞计数回写后端 +1", api_after == api_before + 1, f"{api_before} -> {api_after}")

        # ---------------- 评论区 ----------------
        page.evaluate("window.scrollTo(0, 900)")
        page.wait_for_timeout(800)
        check("评论区渲染评论", page.locator(".comment").count() > 0,
              f"{page.locator('.comment').count()} 条评论")
        page.screenshot(path=f"{SHOTS}/11-comments.png")

        # ---------------- 相关推荐跳转 ----------------
        page.evaluate("window.scrollTo(0,0)")
        page.wait_for_timeout(400)
        url_before = page.url
        page.locator(".related__item").first.click()
        page.wait_for_timeout(2500)
        check("相关推荐可跳转其他稿件", page.url != url_before and "/video/" in page.url, page.url)
        playing2 = page.evaluate(
            """() => new Promise(res => {
                const v = document.querySelector('.player__video');
                const t0 = v.currentTime;
                setTimeout(() => res(v.currentTime > t0 && !v.paused), 1200);
            })"""
        )
        check("切换稿件后继续正常播放", playing2)

        # ---------------- 返回首页 ----------------
        page.locator(".video-page__crumb a", has_text="返回首页").click()
        page.wait_for_url(BASE + "/")
        page.wait_for_timeout(1200)
        check("从播放页返回首页", page.url.rstrip("/") == BASE and page.locator(".video-card").count() > 0,
              page.url)
        page.locator(".user-zone__entry-inner", has_text="历史").first.hover()
        page.wait_for_timeout(700)
        check("观看历史已记录", page.locator(".list-panel__item").count() > 0)
        page.screenshot(path=f"{SHOTS}/12-back-home-history.png")

        # ---------------- 控制台错误 ----------------
        real_errors = [e for e in console_errors if "favicon" not in e.lower()]
        check("无前端控制台报错", len(real_errors) == 0, real_errors[:3])

        browser.close()

    failed = [r for r in results if not r[1]]
    print("\n==========================================")
    print(f"通过 {len(results) - len(failed)}/{len(results)}  截图目录: {SHOTS}")
    if failed:
        print("失败项: " + ", ".join(r[0] for r in failed))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
