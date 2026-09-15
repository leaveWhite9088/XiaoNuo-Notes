import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VideoPlayer from '@/components/player/VideoPlayer.vue';

/**
 * P2-1 回归：播放器的全局快捷键不得劫持输入框 / 文本域，
 * 否则用户在评论框里打不了空格、方向键也无法移动光标。
 */
function mountPlayer() {
  return mount(VideoPlayer, {
    props: { src: '/media/videos/sample-1.mp4', title: '测试视频' },
    attachTo: document.body,
  });
}

function pressKey(target: EventTarget, code: string) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { code, key: code === 'Space' ? ' ' : code, bubbles: true, cancelable: true }),
  );
}

describe('VideoPlayer 快捷键隔离', () => {
  let playSpy: ReturnType<typeof vi.spyOn>;
  let pauseSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });

  it('焦点在 TEXTAREA 时空格/方向键不触发播放器', async () => {
    const wrapper = mountPlayer();
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    pressKey(textarea, 'Space');
    pressKey(textarea, 'ArrowRight');
    pressKey(textarea, 'ArrowLeft');
    await wrapper.vm.$nextTick();

    expect(playSpy).not.toHaveBeenCalled();
    expect(pauseSpy).not.toHaveBeenCalled();

    textarea.remove();
    wrapper.unmount();
  });

  it('焦点在 INPUT / SELECT / contenteditable 时同样不触发', async () => {
    const wrapper = mountPlayer();
    const input = document.createElement('input');
    const select = document.createElement('select');
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    document.body.append(input, select, editable);
    input.focus();
    pressKey(input, 'Space');
    pressKey(select, 'Space');
    pressKey(editable, 'Space');
    await wrapper.vm.$nextTick();

    expect(playSpy).not.toHaveBeenCalled();

    input.remove();
    select.remove();
    editable.remove();
    wrapper.unmount();
  });

  it('焦点在普通元素上时空格可以播放/暂停', async () => {
    const wrapper = mountPlayer();
    pressKey(document.body, 'Space');
    await wrapper.vm.$nextTick();
    expect(playSpy).toHaveBeenCalledTimes(1);

    pressKey(document.body, 'Space');
    await wrapper.vm.$nextTick();
    expect(pauseSpy).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('已 preventDefault 的事件不会被重复处理', async () => {
    const wrapper = mountPlayer();
    const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true });
    event.preventDefault();
    document.body.dispatchEvent(event);
    await wrapper.vm.$nextTick();
    expect(playSpy).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});

describe('VideoPlayer 发弹幕携带播放进度（P2-2 回归）', () => {
  beforeEach(() => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  });

  it('emit 的 timeMs 等于当前播放进度', async () => {
    const wrapper = mountPlayer();
    const video = wrapper.find('video').element as HTMLVideoElement;
    Object.defineProperty(video, 'currentTime', { value: 3.25, writable: true, configurable: true });

    await wrapper.find('.danmaku-input input').setValue('测试弹幕');
    await wrapper.find('.danmaku-input__send').trigger('click');

    const emitted = wrapper.emitted('send-danmaku');
    expect(emitted).toBeTruthy();
    expect(emitted![0]![0]).toEqual({ text: '测试弹幕', timeMs: 3250 });
    wrapper.unmount();
  });
});
