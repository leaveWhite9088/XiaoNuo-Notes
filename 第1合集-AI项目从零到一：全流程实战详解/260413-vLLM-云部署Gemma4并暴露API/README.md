# vLLM 云部署 Gemma4 并暴露 API

本合集介绍如何使用 vLLM 在云端服务器（AutoDL）部署谷歌最新的多模态开源大模型 Gemma 4，并通过 OpenAI 兼容 API 暴露给本地项目调用。

## 内容概览

| 文档 | 说明 |
|------|------|
| [vLLM原理讲解.md](./vLLM原理讲解.md) | 系统讲解 vLLM 的核心技术：PagedAttention、KV Cache 优化、显存共享机制 |
| [vLLM服务器部署Gemma4.md](./vLLM服务器部署Gemma4.md) | 手把手从租服务器、SSH 连接、CUDA 12.9 环境配置，到一键启动脚本和本地 API 接入的全流程 |

## 文件清单

- `vLLM原理讲解.md` / `vLLM原理讲解.pdf` — vLLM 原理详解（适合想深入理解推理引擎的同学）
- `vLLM服务器部署Gemma4.md` / `vLLM服务器部署Gemma4.pdf` — 实战部署教程（含踩坑总结）

## 核心技术要点

1. **PagedAttention**：借鉴操作系统虚拟内存分页机制，解决 KV Cache 的显存碎片化和浪费问题
2. **CUDA 12.9 环境配置**：Gemma 4 需要 vLLM nightly 版本，演示了如何在中国网络环境下高效配置
3. **OpenAI 兼容 API**：部署后可直接使用 OpenAI SDK / LangChain / LlamaIndex 等框架调用
4. **多模态能力**：文本生成、图像理解、音频处理、视频理解、推理模式、工具调用全覆盖

## 硬件参考

- **推荐配置**：RTX 5090 32GB 显存，部署 `gemma-4-E4B-it`（40亿参数）绰绰有余
- **踩坑记录**：31B 量化版在 32GB 显存下因 PyTorch 缺乏原生 4-bit 容器导致 OOM，不建议在此级别显存强行部署

## 适合谁看

- 想用开源模型替代闭源 API，又不想占用本地显卡资源的开发者
- 需要为自己的项目搭建可远程调用的 LLM 服务的全栈工程师
- 想理解 vLLM 为什么比 Ollama/LM Studio 吞吐量更高的 AI 工程爱好者

如有疑问，欢迎前往 B 站视频评论区留言。
