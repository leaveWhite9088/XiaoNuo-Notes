import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import App from "../src/App.jsx";
const request = globalThis.fetch;
afterEach(() => vi.restoreAllMocks());
function Back() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>浏览器后退</button>;
}
function mount(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Back />
      <App />
    </MemoryRouter>,
  );
}
const cards = () =>
  screen
    .getAllByRole("link", { name: /播放：/ })
    .map((a) => a.getAttribute("href"));
const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 40)));
describe("Review 1 回归", () => {
  it.each(["分类", "搜索", "换一换"])("旧分页晚到不污染%s", async (mode) => {
    const user = userEvent.setup();
    let release;
    let pending;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url, options) => {
      if (String(url).includes("/home?") && String(url).includes("page=2")) {
        // Deliberately ignore AbortSignal to also test the response ownership guard.
        pending = await request(url, { ...options, signal: undefined });
        return new Promise((resolve) => {
          release = () => resolve(pending);
        });
      }
      return request(url, options);
    });
    mount();
    await screen.findAllByRole("link", { name: /播放：/ });
    await user.click(screen.getByRole("button", { name: "看看更多精彩内容" }));
    await waitFor(() => expect(release).toBeTypeOf("function"));
    if (mode === "分类")
      await user.click(
        screen.getByRole("button", { name: "美食", exact: true }),
      );
    if (mode === "搜索") {
      await user.type(
        screen.getByRole("textbox", { name: "搜索视频" }),
        "猫咪",
      );
      await user.click(
        screen.getByRole("button", { name: "搜索", exact: true }),
      );
    }
    if (mode === "换一换")
      await user.click(screen.getByRole("button", { name: "换一换" }));
    await waitFor(() =>
      expect(cards()).toHaveLength(
        mode === "分类" ? 2 : mode === "搜索" ? 1 : 20,
      ),
    );
    if (mode === "换一换")
      await waitFor(() => expect(cards()[0]).toBe("/video/BV1demo002"));
    const before = cards();
    await act(async () => release());
    await settle();
    expect(cards()).toEqual(before);
    if (mode === "换一换")
      expect(
        screen.getByRole("button", { name: "看看更多精彩内容" }).disabled,
      ).toBe(false);
    else {
      expect(
        screen.getByText(mode === "分类" ? "2 个视频" : "1 个视频"),
      ).toBeTruthy();
      expect(
        screen.queryByRole("button", { name: "看看更多精彩内容" }),
      ).toBeNull();
    }
  });
  it("建议缩短、关闭与清空后回车使用有效输入", async () => {
    const user = userEvent.setup();
    let release;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url, options) => {
      if (
        String(url).includes("/suggestions?q=") &&
        String(url).includes(encodeURIComponent("猫咪"))
      ) {
        const response = await request(url, options);
        return new Promise((resolve) => {
          release = () => resolve(response);
        });
      }
      return request(url, options);
    });
    mount();
    await screen.findAllByRole("link", { name: /播放：/ });
    const input = screen.getByRole("textbox", { name: "搜索视频" });
    await user.click(input);
    await screen.findByText("大家都在搜");
    await waitFor(() =>
      expect(document.querySelectorAll(".search-panel>button")).toHaveLength(6),
    );
    await user.keyboard(
      "{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}",
    );
    await user.type(input, "猫咪");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await waitFor(() => expect(release).toBeTypeOf("function"));
    await act(async () => release());
    await waitFor(() =>
      expect(document.querySelectorAll(".search-panel>button")).toHaveLength(1),
    );
    await user.keyboard("{Escape}{Enter}");
    await waitFor(() => expect(cards()).toHaveLength(1));
    await user.click(screen.getByRole("button", { name: "清空搜索" }));
    await user.click(screen.getByRole("button", { name: "搜索", exact: true }));
    await waitFor(() => expect(cards()).toHaveLength(20));
  });
  it("关联视频切换清除草稿，相同弹幕每次创建新展示", async () => {
    const user = userEvent.setup();
    mount("/video/BV1demo001");
    await screen.findByRole("heading", { level: 1 });
    await user.type(
      screen.getByRole("textbox", { name: "评论内容" }),
      "不应发给下一个视频",
    );
    for (let i = 0; i < 2; i++) {
      await user.type(
        screen.getByRole("textbox", { name: "发送弹幕" }),
        "重复弹幕",
      );
      await user.click(
        screen.getByRole("button", { name: "发送", exact: true }),
      );
      expect(document.querySelector(".danmaku").dataset.sendId).toBe(
        String(i + 1),
      );
    }
    await user.type(
      screen.getByRole("textbox", { name: "发送弹幕" }),
      "未发送的弹幕",
    );
    await user.click(screen.getAllByRole("link", { name: /播放：/ })[0]);
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "评论内容" }).value).toBe(""),
    );
    expect(screen.getByRole("textbox", { name: "发送弹幕" }).value).toBe("");
    expect(document.querySelector(".danmaku")).toBeNull();
    expect(
      screen.getByRole("button", { name: "发布", exact: true }).disabled,
    ).toBe(true);
  });
  it("后退恢复加载范围、换一换顺序和滚动位置", async () => {
    const user = userEvent.setup();
    mount();
    await screen.findAllByRole("link", { name: /播放：/ });
    await user.click(screen.getByRole("button", { name: "换一换" }));
    await waitFor(() => expect(cards()[0]).toBe("/video/BV1demo002"));
    await user.click(screen.getByRole("button", { name: "看看更多精彩内容" }));
    await waitFor(() => expect(cards()).toHaveLength(24));
    const before = cards();
    vi.spyOn(window, "scrollY", "get").mockReturnValue(640);
    fireEvent.scroll(window);
    await user.click(screen.getAllByRole("link", { name: /播放：/ })[7]);
    await screen.findByRole("heading", { level: 1 });
    await user.click(screen.getByRole("button", { name: "浏览器后退" }));
    await waitFor(() => expect(cards()).toEqual(before));
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 640);
  });
  it("禁用和启用提交时焦点循环，Escape 恢复原入口", async () => {
    const user = userEvent.setup();
    mount();
    await screen.findAllByRole("link", { name: /播放：/ });
    const opener = screen.getByRole("button", { name: "登录", exact: true });
    await user.click(opener);
    const dialog = screen.getByRole("dialog");
    const close = within(dialog).getByRole("button", { name: "关闭弹窗" });
    const input = within(dialog).getByRole("textbox", { name: "昵称" });
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(input);
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab();
    await user.type(input, "测试昵称");
    await user.tab();
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "进入体验" }),
    );
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(opener);
  });
  it("功能菜单可访问收藏历史，更多包含全部 23 个分区", async () => {
    const user = userEvent.setup();
    mount();
    await screen.findAllByRole("link", { name: /播放：/ });
    await user.click(screen.getByRole("button", { name: "打开功能菜单" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "历史" }),
    );
    expect(screen.getByRole("heading", { name: "观看历史" })).toBeTruthy();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "更多", exact: true }));
    expect(document.querySelectorAll(".more-menu button")).toHaveLength(23);
    await user.click(
      within(document.querySelector(".more-menu")).getByRole("button", {
        name: "动物圈",
      }),
    );
    await waitFor(() => expect(cards()).toHaveLength(2));
  });
  it("封面失败仅替换占位，与视频媒体失败分别处理", async () => {
    mount("/video/BV1demo001");
    await screen.findByRole("heading", { level: 1 });
    const image = document.querySelector(".related-list img");
    fireEvent.error(image);
    expect(image.getAttribute("src")).toBe("/fallback.svg");
    expect(screen.queryByRole("button", { name: "重新加载" })).toBeNull();
    fireEvent.error(screen.getByLabelText("视频播放器"));
    expect(screen.getByRole("button", { name: "重新加载" })).toBeTruthy();
  });
});
