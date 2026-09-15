export function showToast(msg: string) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: msg }));
}
