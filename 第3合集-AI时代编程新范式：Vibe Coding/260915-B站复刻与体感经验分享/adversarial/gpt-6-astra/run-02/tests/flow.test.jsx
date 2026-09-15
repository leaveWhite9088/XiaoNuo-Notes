import React from "react";
import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.jsx";
const mount = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
describe("真实 API 驱动的首页主链路", () => {
  it("首页加载、轮播切换、分页与分类筛选", async () => {
    const user = userEvent.setup();
    mount();
    expect(
      (await screen.findAllByRole("link", { name: /播放：/ })).length,
    ).toBe(20);
    expect(
      screen.getByRole("button", { name: "把生活，调成喜欢的频道" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "下一张推荐" }));
    expect(
      screen.getByRole("button", { name: "宇宙很大，好奇心更大" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "看看更多精彩内容" }));
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /播放：/ }).length).toBe(24),
    );
    await user.click(screen.getByRole("button", { name: "美食", exact: true }));
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /播放：/ }).length).toBe(2),
    );
    expect(
      screen.getByText("没有人能拒绝！这碗番茄意面真的太香了"),
    ).toBeTruthy();
  });
  it("搜索建议、进入详情、播放配置、收藏评论与返回首页", async () => {
    const user = userEvent.setup();
    mount();
    await screen.findAllByRole("link", { name: /播放：/ });
    const input = screen.getByRole("textbox", { name: "搜索视频" });
    await user.type(input, "猫咪");
    const suggestion = await screen.findByRole("button", {
      name: /在猫咪眼里/,
    });
    await user.click(suggestion);
    const result = await screen.findByRole("link", {
      name: /播放：在猫咪眼里/,
    });
    await user.click(result);
    await screen.findByRole("heading", { level: 1, name: /在猫咪眼里/ });
    const player = screen.getByLabelText("视频播放器");
    expect(player.tagName).toBe("VIDEO");
    expect(player.hasAttribute("controls")).toBe(true);
    expect(player.getAttribute("src")).toMatch(/\/media\/.*\.mp4$/);
    await user.click(
      screen.getByRole("button", { name: "收藏视频", exact: true }),
    );
    expect(JSON.parse(localStorage.getItem("bili-favorites"))).toHaveLength(1);
    expect(screen.getByRole("button", { name: "取消收藏视频" })).toBeTruthy();
    await user.type(
      screen.getByRole("textbox", { name: "评论内容" }),
      "猫猫太可爱了！",
    );
    await user.click(screen.getByRole("button", { name: "发布", exact: true }));
    expect(screen.getByText("猫猫太可爱了！")).toBeTruthy();
    await user.type(
      screen.getByRole("textbox", { name: "发送弹幕" }),
      "前方可爱预警",
    );
    await user.click(screen.getByRole("button", { name: "发送", exact: true }));
    expect(screen.getByText("前方可爱预警")).toBeTruthy();
    await user.click(
      screen.getByRole("link", { name: "返回首页", exact: true }),
    );
    await screen.findAllByRole("link", { name: /播放：/ });
    await user.click(screen.getByRole("button", { name: "历史", exact: true }));
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("link", { name: /在猫咪眼里/ }),
    ).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  }, 15000);
  it("空搜索、菜单跳转和不存在的视频均可恢复", async () => {
    const user = userEvent.setup();
    mount("/?q=没有这个结果xyz");
    await screen.findByRole("heading", { name: "没有找到相关视频" });
    await user.click(screen.getByRole("button", { name: "返回推荐" }));
    await screen.findAllByRole("link", { name: /播放：/ });
    await user.hover(
      screen.getByRole("button", { name: "游戏中心", exact: true }),
    );
    expect(await screen.findByText("游戏中心精选")).toBeTruthy();
    await user.click(screen.getByRole("link", { name: "游戏推荐" }));
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /播放：/ })).toHaveLength(1),
    );
  });
  it("404 详情页有返回首页入口", async () => {
    mount("/video/no-such-id");
    expect(
      await screen.findByRole("heading", { name: "这个视频暂时找不到了" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "去首页看看" }).getAttribute("href"),
    ).toBe("/");
  });
  it("昵称弹窗和收藏可取消，播放器失败可重试", async () => {
    const user = userEvent.setup();
    mount("/video/BV1demo001");
    await screen.findByRole("heading", { level: 1 });
    await user.click(screen.getByRole("button", { name: "登录", exact: true }));
    await user.type(screen.getByRole("textbox", { name: "昵称" }), "小电视");
    await user.click(screen.getByRole("button", { name: "进入体验" }));
    expect(JSON.parse(localStorage.getItem("bili-user")).name).toBe("小电视");
    await user.click(
      screen.getByRole("button", { name: "收藏视频", exact: true }),
    );
    await user.click(screen.getByRole("button", { name: "取消收藏视频" }));
    expect(JSON.parse(localStorage.getItem("bili-favorites"))).toHaveLength(0);
    fireEvent.error(screen.getByLabelText("视频播放器"));
    expect(screen.getByRole("button", { name: "重新加载" })).toBeTruthy();
  });
});
