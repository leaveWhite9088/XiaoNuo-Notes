import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
const networkFetch = globalThis.fetch;
globalThis.fetch = (url, options) =>
  networkFetch(
    typeof url === "string" && url.startsWith("/api")
      ? "http://127.0.0.1:3302" + url
      : url,
    options,
  );
window.scrollTo = vi.fn();
afterEach(() => {
  cleanup();
  localStorage.clear();
});
