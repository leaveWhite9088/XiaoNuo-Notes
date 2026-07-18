#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import time
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from runtime_overrides import RUNTIME_OVERRIDES

ROOT = Path("/Users/xushaoyang/Desktop/开发能力测评")
OUT = ROOT / "output" / "bilibili-benchmark-site"
DATA_DIR = OUT / "data"
TREE_DIR = DATA_DIR / "trees"
SCREENSHOT_DIR = OUT / "screenshots"
ASSET_DIR = OUT / "assets"

IGNORE_DIRS = {
    "node_modules",
    "dist",
    "build",
    ".git",
    "__pycache__",
    ".next",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
}

SLOT_DEFS = [
    ("slot_a_home", "A-首页/主界面"),
    ("slot_b_video", "B-视频播放与信息展示"),
    ("slot_c_comment_danmaku", "C-评论与弹幕区域"),
    ("slot_d_login", "D-登录入口/登录页/登录弹窗"),
    ("slot_e_favorites", "E-收藏/个人中心/登录后能力入口"),
    ("slot_f_architecture", "F-目录结构与架构总览图"),
]

LEGACY_SCORE_WEIGHTS = {
    "functionality": 20,
    "runnability": 15,
    "instruction_following": 15,
    "ui_quality": 12,
    "frontend_quality": 10,
    "backend_quality": 10,
    "maintainability": 8,
    "docs_quality": 5,
    "waste_control": 5,
}

SCORE_WEIGHTS = {
    "functionality": 6,
    "runnability": 5,
    "instruction_following": 4,
    "ui_quality": 30,
    "frontend_quality": 3,
    "backend_quality": 40,
    "architecture_quality": 8,
    "docs_quality": 2,
    "waste_control": 2,
}

SCORE_STRETCH_EXPONENT = 1.18

UI_REVIEW_OVERRIDES = {
    "claude-4_6-opus": {
        "score": 24,
        "summary": "美观 8/10，业务适配 7/8，信息架构 6/7，状态细节 3/5：目前最像完整 B 站网页产品的一组，首页、详情页和评论区都形成统一的产品语言；但右上导航挤成竖排，大量封面/头像 403 后只剩灰色占位，精致度还没到优秀线。",
    },
    "chatgpt-5_4": {
        "score": 21,
        "summary": "美观 7/10，业务适配 6/8，信息架构 5/7，状态细节 3/5：粉白色系、卡片和信息块已经有成品感，但更像纵向信息看板而不是原生 B 站首页；破图和 mixed-content 让页面质感明显掉档。",
    },
    "chatgpt-5_3-codex-high": {
        "score": 16,
        "summary": "美观 6/10，业务适配 4/8，信息架构 4/7，状态细节 2/5：界面干净，粉蓝路线也对，但布局偏稀、顶部留白过重，热门封面失效后像半成品演示页而不像完整视频站。",
    },
    "mimo-v2-flash": {
        "score": 10,
        "summary": "美观 4/10，业务适配 3/8，信息架构 2/7，状态细节 1/5：只有基础粉色、圆角和表单语言，品牌感、信息密度和页面层次都偏薄；更像课程作业级多页站，不像成熟的视频平台。",
    },
    "deepseek-v3_2": {
        "score": 0,
        "summary": "美观 0/10，业务适配 0/8，信息架构 0/7，状态细节 0/5：真实运行态根本没有前端页面，浏览器首屏只有 JSON 文本，这一项不能给 UI 分。",
    },
    "kimi-k2_5": {
        "score": 14,
        "summary": "美观 7/10，业务适配 2/8，信息架构 3/7，状态细节 2/5：Ant Design 包装、登录页和 banner 做得不差，但整体是蓝白加紫渐变，不像 B 站；数据失败后大面积空白，业务贴合度明显不足。",
    },
    "kimi-k2_5-v2": {
        "score": 18,
        "summary": "美观 7/10，业务适配 5/8，信息架构 4/7，状态细节 2/5：这版明显更像一个可讲解的视频产品，左侧分区、卡片栅格、详情页和收藏页骨架都比旧版完整；但播放器黑屏、评论失败、登录二维码失效、图标字体异常和大量破图仍然把它压在中档。",
    },
    "gemini-3_1-pro": {
        "score": 9,
        "summary": "美观 3/10，业务适配 2/8，信息架构 2/7，状态细节 2/5：有最基础的粉白配色和圆角输入框，但首页只有少量硬编码卡片，信息量和品牌表达都像课堂 Demo。",
    },
    "gemini-3_0-pro": {
        "score": 20,
        "summary": "美观 7/10，业务适配 5/8，信息架构 5/7，状态细节 3/5：搜索结果页、卡片栅格和留白控制都明显强于中游样本，整体更接近可讲解的成品；但品牌表达偏 generic，黑屏播放器和空收藏页会快速打断体验。",
    },
    "gemini-3_0-flash": {
        "score": 13,
        "summary": "美观 5/10，业务适配 3/8，信息架构 3/7，状态细节 2/5：首屏配色和卡片语言顺眼，但内容极薄，更多是在借官方 iframe 撑画面，整体像海报稿而不是产品页。",
    },
    "minimax-m2_5": {
        "score": 12,
        "summary": "美观 5/10，业务适配 3/8，信息架构 2/7，状态细节 2/5：B 站式粉白和双栏详情页已经有方向，但首页留白过大、0 统计和破图让页面可信度很弱，业务氛围不足。",
    },
    "glm-5": {
        "score": 18,
        "summary": "美观 6/10，业务适配 5/8，信息架构 4/7，状态细节 3/5：侧栏、顶栏、按钮体系和整体结构都比平均线更像 B 站网页产品；问题是空首页、回退播放器和外链资源缺失持续破坏完成度。",
    },
    "qwen-3_5": {
        "score": 11,
        "summary": "美观 3/10，业务适配 2/8，信息架构 3/7，状态细节 3/5：骨架在模仿 B 站，但 emoji 图标、异常品牌字样和空内容首屏都很减分，视觉完成度只到教程级样板。",
    },
    "doubao-seed-2_0-pro": {
        "score": 10,
        "summary": "美观 4/10，业务适配 3/8，信息架构 2/7，状态细节 1/5：粉白导航、视频页双栏和评论区布局都在模仿 B 站，但整体是通用管理后台审美，层次单薄；更关键的是二维码失败、收藏页空白和大量 mock 数据让页面很容易露出 demo 感。",
    },
    "step-3_5-flash": {
        "score": 17,
        "summary": "美观 6/10，业务适配 4/8，信息架构 4/7，状态细节 3/5：登录页和组件系统做得比较完整，整体界面也算顺眼；但品牌识别偏泛视频站，首页内容稀薄，业务贴合度不如前排样本。",
    },
    "grok-4_1-thinking-fast": {
        "score": 4,
        "summary": "美观 2/10，业务适配 0/8，信息架构 1/7，状态细节 1/5：桌面 GUI 自身并不杂乱，但它不是网页视频平台，不能按 B 站网页 UI 标准给高分。",
    },
    "glm-4_6": {
        "score": 0,
        "summary": "美观 0/10，业务适配 0/8，信息架构 0/7，状态细节 0/5：仓库残缺到没有可评页面，这一项记 0 分。",
    },
}

STRICT_REVIEW_OVERRIDES = {
    "chatgpt-5_4": {
        "scores": {
            "functionality": 6,
            "runnability": 4,
            "instruction_following": 4,
            "frontend_quality": 3,
            "backend_quality": 34,
            "architecture_quality": 7,
            "docs_quality": 2,
            "waste_control": 1,
        },
        "backend_scoring_summary": "后端 34/40：有 `config`、`schemas`、`service` 和主入口分层，接口层只做参数约束与错误映射，核心逻辑集中在 `BiliService`，属于本轮少数真正像后端产品代码的实现。主要扣分点是凭据直接落本地 JSON、二维码会话只存在进程内，以及前后端联调默认强依赖固定端口。",
        "architecture_scoring_summary": "架构 7/8：前后端明确拆分，接口契约、TS 类型和后端响应模型能对上，整体是可继续扩写的产品骨架。没有给满分，是因为代理目标和本地文件凭据策略仍然偏开发态，部署边界不够成熟。",
    },
    "chatgpt-5_3-codex-high": {
        "scores": {
            "functionality": 6,
            "runnability": 5,
            "instruction_following": 4,
            "frontend_quality": 2,
            "backend_quality": 33,
            "architecture_quality": 6,
            "docs_quality": 1,
            "waste_control": 2,
        },
        "backend_scoring_summary": "后端 33/40：`main.py` 基本保持薄路由，视频能力和鉴权状态分别沉到 `bili_client.py` 与 `auth_store.py`，还做了 BV/av 解析、网络配置和二维码会话过期清理，代码质量明显高于单文件脚本。加分点是本轮已用真实凭据实测通过登录状态与收藏读取，不只是声明支持。主要扣分在于对异常仍然大量统一包成 500，凭据也是文件直存，没有更细的权限与状态边界。",
        "architecture_scoring_summary": "架构 6/8：单体 FastAPI 模板站但服务层和鉴权层已经拆开，结构比多数模板站清楚，登录态到收藏读取也证明确实串起来了。没有再往上给，是因为前端仍是单页模板壳，展示层与业务能力基本围绕一个服务文件旋转。",
    },
    "claude-4_6-opus": {
        "scores": {
            "functionality": 6,
            "runnability": 4,
            "instruction_following": 4,
            "frontend_quality": 1,
            "backend_quality": 25,
            "architecture_quality": 5,
            "docs_quality": 1,
            "waste_control": 2,
        },
        "backend_scoring_summary": "后端 25/40：功能面铺得很全，评论、弹幕、登录、收藏相关接口都在，一个文件就把匿名主链路打通了；真实凭据登录也能成功拿到个人资料和收藏夹列表。扣分要比先前更重，因为登录后继续深挖时，收藏详情接口直接报 `'FavoriteList' object has no attribute 'get_content_list'`，说明关键登录后链路在真实环境下已经断裂。再叠加 460+ 行单文件单体、全局 `credential` / `qr_login_instance` 状态、14 处 `except Exception` 和缺少可配置端口/依赖声明，它仍更像高完成度 one-shot 脚本，而不是稳定后端。",
        "architecture_scoring_summary": "架构 5/8：模板页 + FastAPI API 的产品形态完整，适合快速做成品演示。问题是所有能力都收在 `app.py` 里，缺少 service/schema/config 边界，而且登录后收藏详情失败也说明展示层和 API 契约没有真正收口，架构清晰度只到中档。",
    },
    "glm-5": {
        "scores": {
            "functionality": 4,
            "runnability": 4,
            "instruction_following": 4,
            "frontend_quality": 2,
            "backend_quality": 18,
            "architecture_quality": 7,
            "docs_quality": 1,
            "waste_control": 2,
        },
        "backend_scoring_summary": "后端 18/40：这是 Python 样本里分层最像样的一档，`api/`、`services/`、`models/`、`core/config` 都有，域边界也清楚。扣分很重，因为大量 service 仍在 `print` 后返回 `None`/空列表，出现裸 `except`，而且关键 API 已经和当前 `bilibili-api` 版本脱节，真实正确性没有撑起这套结构。",
        "architecture_scoring_summary": "架构 7/8：按领域拆 service 和 route，配置与 schema 也独立，系统轮廓非常清楚。没给满分，是因为它缺少一层隔离 `bilibili-api` 波动的适配器，导致架构漂亮但抗库版本漂移能力不足。",
    },
    "gemini-3_0-pro": {
        "scores": {
            "functionality": 4,
            "runnability": 3,
            "instruction_following": 3,
            "frontend_quality": 2,
            "backend_quality": 14,
            "architecture_quality": 4,
            "docs_quality": 1,
            "waste_control": 0,
        },
        "backend_scoring_summary": "后端 14/40：能看出作者想做成全功能后端，搜索、详情、评论、弹幕、登录和代理流媒体都尝试覆盖了。问题同样很集中：主逻辑几乎全堆在 `backend/main.py`，靠私有字段和旧版 API 名称兼容库差异，异常处理很宽，而且仓库里塞了多份 `check_*`/`test_*` 调试脚本，交付边界很差。",
        "architecture_scoring_summary": "架构 4/8：前后端拆分是加分项，但后端本身仍接近单文件中心化脚本；再加上一堆调试副产物，说明结构没有真正收敛成可维护工程。",
    },
    "mimo-v2-flash": {
        "scores": {
            "functionality": 4,
            "runnability": 5,
            "instruction_following": 2,
            "frontend_quality": 2,
            "backend_quality": 19,
            "architecture_quality": 6,
            "docs_quality": 1,
            "waste_control": 0,
        },
        "backend_scoring_summary": "后端 19/40：Flask app factory、blueprint、SQLAlchemy、Flask-Login 和 SocketIO 这些骨架比多数样本更像工程化项目。扣分来自核心 B 站能力其实落在 `requests` 直连包装里，很多 API 只是薄透传，异常常常直接吞掉并回空值，而且额外自建账户系统分散了题目主线。",
        "architecture_scoring_summary": "架构 6/8：如果只看 Web 应用结构，它是本轮更完整的一档，站内账号、数据库和多 blueprint 都搭好了。没给更高，是因为它把题目的“B 站平台”扩展成了另一套本地账户系统，架构方向开始偏题。",
    },
    "step-3_5-flash": {
        "scores": {
            "functionality": 1,
            "runnability": 3,
            "instruction_following": 2,
            "frontend_quality": 2,
            "backend_quality": 11,
            "architecture_quality": 5,
            "docs_quality": 1,
            "waste_control": 1,
        },
        "backend_scoring_summary": "后端 11/40：TypeScript、`helmet`、中间件、route/service/type 分层看起来很像正经 Node 服务，基础工程感不差。真正拖垮分数的是 `bilibili-api` Node 包接口假设明显不对、全局单例 `bilibiliApi` 把认证状态共享给所有请求、各 route 也缺少兜底异常处理，实际运行一进业务流就大面积 500。",
        "architecture_scoring_summary": "架构 5/8：从目录设计上看，这是 Node 样本里更像样的一档。扣分点在于最关键的“外部 API 适配层”和“用户会话边界”都设计错了，导致纸面结构好于实际系统设计。",
    },
    "qwen-3_5": {
        "scores": {
            "functionality": 3,
            "runnability": 2,
            "instruction_following": 1,
            "frontend_quality": 2,
            "backend_quality": 14,
            "architecture_quality": 5,
            "docs_quality": 2,
            "waste_control": 0,
        },
        "backend_scoring_summary": "后端 14/40：Express 路由拆分明确，cookie jar、session 和统一错误中间件都在，基本服务骨架说得过去。大扣分在于它根本没用 `bilibili-api`，而是自己用 axios 爬 HTML、抓 `__INITIAL_STATE__`、调公开接口，登录态和风控都非常脆；同时 session secret、origin 和运行主机都写死得很重。",
        "architecture_scoring_summary": "架构 5/8：按功能拆路由是加分项，核心 B 站适配被收进一个 util 类，也算有集中边界。没法更高，因为整个系统高度依赖 `localhost` 假设和一只“大而全工具类”，可替换性一般。",
    },
    "minimax-m2_5": {
        "scores": {
            "functionality": 3,
            "runnability": 4,
            "instruction_following": 1,
            "frontend_quality": 1,
            "backend_quality": 8,
            "architecture_quality": 2,
            "docs_quality": 1,
            "waste_control": 2,
        },
        "backend_scoring_summary": "后端 8/40：这组最大问题不是功能少，而是 600 多行 Flask 单文件把登录、用户、视频、评论、弹幕和收藏全塞在一起，直接手写 `requests` 打 B 站接口，硬编码 secret/CORS，甚至自己猜测并解析弹幕二进制结构。它能起，但后端质量只能按脆弱脚本算。",
        "architecture_scoring_summary": "架构 2/8：前后端目录虽然分开，但后端没有真正分层，所有关注点都耦在一个文件里，架构基本停留在“能跑的 API 脚本”阶段。",
    },
    "deepseek-v3_2": {
        "scores": {
            "functionality": 2,
            "runnability": 3,
            "instruction_following": 3,
            "frontend_quality": 1,
            "backend_quality": 15,
            "architecture_quality": 4,
            "docs_quality": 1,
            "waste_control": 2,
        },
        "backend_scoring_summary": "后端 15/40：路由按 auth/video/comment/user 拆开，至少不是所有逻辑堆在入口里。严格扣分是因为几乎所有 handler 都直接返回 `JSONResponse` 和字符串错误，凭据靠请求参数字典透传，没有真实认证存储；更关键的是根路由居然没挂前端页面，这说明交付前连最基本的系统连线都没收口。",
        "architecture_scoring_summary": "架构 4/8：路由边界是清楚的，模板和静态资源目录也存在。可惜缺少 service 层和共享认证边界，展示层还被遗落在主入口之外，所以只能算“半套架构”。",
    },
    "gemini-3_1-pro": {
        "scores": {
            "functionality": 4,
            "runnability": 3,
            "instruction_following": 3,
            "frontend_quality": 1,
            "backend_quality": 9,
            "architecture_quality": 1,
            "docs_quality": 0,
            "waste_control": 2,
        },
        "backend_scoring_summary": "后端 9/40：真实可用链路主要靠一个单文件 FastAPI 脚本硬撑起来，登录凭据落 `cred.json`，全局 `qr_login`/`credential` 状态直接挂模块级变量，评论接口仍在调用旧枚举。能做 demo，但距离稳健后端差得很远。",
        "architecture_scoring_summary": "架构 1/8：只有最薄的一层“静态页 + 单文件 API”结构，没有 service、schema、auth store 等清晰边界，系统设计非常轻。",
    },
    "gemini-3_0-flash": {
        "scores": {
            "functionality": 2,
            "runnability": 2,
            "instruction_following": 3,
            "frontend_quality": 1,
            "backend_quality": 5,
            "architecture_quality": 2,
            "docs_quality": 1,
            "waste_control": 2,
        },
        "backend_scoring_summary": "后端 5/40：几乎就是一个单文件 API 转发层，内存字典保存登录态，没有配置层、没有服务层、也几乎没有参数校验。更重的扣分来自依赖旧版 `bilibili_api` 导入和旧接口名，后端在常见环境下直接起不来。",
        "architecture_scoring_summary": "架构 2/8：有明确的前后端目录，但后端本身只是一层很薄的 FastAPI 外壳，结构深度不足。",
    },
    "kimi-k2_5": {
        "scores": {
            "functionality": 2,
            "runnability": 4,
            "instruction_following": 1,
            "frontend_quality": 3,
            "backend_quality": 0,
            "architecture_quality": 1,
            "docs_quality": 1,
            "waste_control": 1,
        },
        "backend_scoring_summary": "后端 0/40：没有后端。这不是“后端写得差”，而是系统根本没有承接登录、评论、弹幕和收藏的服务层，浏览器直接打外部接口。",
        "architecture_scoring_summary": "架构 1/8：前端模块拆分其实不差，但作为题目要求的整站架构，它缺少最关键的服务端边界，因此只能给最低档架构分。",
    },
    "kimi-k2_5-v2": {
        "scores": {
            "functionality": 3,
            "runnability": 3,
            "instruction_following": 3,
            "frontend_quality": 2,
            "backend_quality": 15,
            "architecture_quality": 5,
            "docs_quality": 1,
            "waste_control": 1,
        },
        "backend_scoring_summary": "后端 15/40：它至少不再是纯前端壳，`api_server.py`、`auth_manager.py`、`config.py` 和 mock 数据分开，视频、评论、弹幕、收藏、历史都声明了 bilibili-api-python 链路。分数被压低，是因为登录真实性和数据边界出了大问题：二维码登录直接报 `login_v2/login not defined`，注入真实凭据后 `/api/auth/status` 仍返回未登录，而 `/api/user/info`、`/api/favorite/*` 却继续返回 mock 成功数据，评论接口还会被前端传成 `oid=undefined` 触发 422。",
        "architecture_scoring_summary": "架构 5/8：前后端分离、认证管理器独立、接口面铺得比较完整，整体系统轮廓明显强于旧版 Kimi。没法更高，因为前端状态和后端认证事实不一致，mock 数据又直接混入登录后能力接口，导致架构看起来完整，实际契约并不可靠。",
    },
    "doubao-seed-2_0-pro": {
        "scores": {
            "functionality": 2,
            "runnability": 1,
            "instruction_following": 2,
            "frontend_quality": 1,
            "backend_quality": 6,
            "architecture_quality": 2,
            "docs_quality": 1,
            "waste_control": 1,
        },
        "backend_scoring_summary": "后端 6/40：虽然有前后端拆分，也写了推荐、详情、评论、弹幕、登录和收藏接口，但 `server.js` 实际上就是一份全局 `userSession` 单文件脚本，对 `bilibili-api` 的接口假设大量不成立。最重的扣分点有三个：原始依赖版本 `bilibili-api@^0.0.15` 在 npm 上根本不存在、二维码登录 `getQrCode`/`checkQrCodeStatus` 直接失效、推荐/详情/评论/弹幕大量以 mock fallback 掩盖真实失败。",
        "architecture_scoring_summary": "架构 2/8：目录表面上是 React + Express 分离，但后端没有 service/auth/config 等真正边界，前端收藏页路由也没接通，系统更像把若干页面和透传接口临时拼在一起的演示工程。",
    },
    "grok-4_1-thinking-fast": {
        "scores": {
            "functionality": 2,
            "runnability": 2,
            "instruction_following": 0,
            "frontend_quality": 0,
            "backend_quality": 4,
            "architecture_quality": 1,
            "docs_quality": 2,
            "waste_control": 1,
        },
        "backend_scoring_summary": "后端 4/40：桌面程序内部的 API client 和 auth manager 写得不算完全混乱，但它不提供网页后端，也不服务浏览器产品链路。在本题语境下只能给象征性分数。",
        "architecture_scoring_summary": "架构 1/8：桌面端模块结构存在，但交付物类型就错了，不能按网页平台架构给分。",
    },
    "glm-4_6": {
        "scores": {
            "functionality": 0,
            "runnability": 0,
            "instruction_following": 0,
            "frontend_quality": 0,
            "backend_quality": 0,
            "architecture_quality": 0,
            "docs_quality": 0,
            "waste_control": 1,
        },
        "backend_scoring_summary": "后端 0/40：没有后端代码可审。",
        "architecture_scoring_summary": "架构 0/8：仓库残缺到不足以形成系统架构。",
    },
}


@dataclass(frozen=True)
class ModelConfig:
    model_id: str
    display_name: str
    root_rel: str
    sample_type: str
    app_kind: str
    launch: list[dict[str, Any]]
    primary_url: str | None
    notes: str


MODEL_CONFIGS = [
    ModelConfig(
        model_id="chatgpt-5_3-codex-high",
        display_name="ChatGPT-5.3-Codex-high",
        root_rel="ChatGPT-5.3-Codex-high",
        sample_type="web_fullstack",
        app_kind="fastapi_static",
        launch=[
            {
                "name": "app",
                "cwd": "ChatGPT-5.3-Codex-high",
                "cmd": "python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000",
            }
        ],
        primary_url="http://127.0.0.1:8000",
        notes="FastAPI + 单页静态界面",
    ),
    ModelConfig(
        model_id="chatgpt-5_4",
        display_name="ChatGPT-5.4",
        root_rel="ChatGPT-5.4",
        sample_type="web_fullstack",
        app_kind="fastapi_react_split",
        launch=[
            {
                "name": "backend",
                "cwd": "ChatGPT-5.4",
                "cmd": "uvicorn backend.app.main:app --host 127.0.0.1 --port 8000",
            },
            {
                "name": "frontend",
                "cwd": "ChatGPT-5.4/frontend",
                "cmd": "npm run dev -- --host 127.0.0.1 --port 5173",
            },
        ],
        primary_url="http://127.0.0.1:5173",
        notes="React + Vite 前端，FastAPI + bilibili-api-python 后端",
    ),
    ModelConfig(
        model_id="claude-4_6-opus",
        display_name="Claude-4.6-Opus",
        root_rel="Claude-4.6-Opus/bilibili-platform",
        sample_type="web_fullstack",
        app_kind="flask_single_page",
        launch=[
            {
                "name": "app",
                "cwd": "Claude-4.6-Opus/bilibili-platform",
                "cmd": "python3 app.py",
            }
        ],
        primary_url="http://127.0.0.1:8000",
        notes="Flask 单页模板站",
    ),
    ModelConfig(
        model_id="deepseek-v3_2",
        display_name="DeepSeek-V3.2",
        root_rel="DeepSeek-V3.2",
        sample_type="web_fullstack",
        app_kind="fastapi_templates",
        launch=[
            {
                "name": "app",
                "cwd": "DeepSeek-V3.2",
                "cmd": "python3 -m uvicorn main:app --host 127.0.0.1 --port 8000",
            }
        ],
        primary_url="http://127.0.0.1:8000",
        notes="FastAPI + Jinja 模板",
    ),
    ModelConfig(
        model_id="doubao-seed-2_0-pro",
        display_name="Doubao-Seed-2.0-Pro",
        root_rel="Doubao-Seed-2.0-Pro/bilibili-platform",
        sample_type="web_fullstack",
        app_kind="express_cra",
        launch=[
            {
                "name": "backend",
                "cwd": "Doubao-Seed-2.0-Pro/bilibili-platform/backend",
                "cmd": "npm start",
            },
            {
                "name": "frontend",
                "cwd": "Doubao-Seed-2.0-Pro/bilibili-platform/frontend",
                "cmd": "npm start",
            },
        ],
        primary_url="http://127.0.0.1:3000",
        notes="React + Express，原始 one-shot 交付含依赖与编译兼容问题",
    ),
    ModelConfig(
        model_id="glm-4_6",
        display_name="GLM-4.6",
        root_rel="GLM-4.6",
        sample_type="incomplete",
        app_kind="partial_source_only",
        launch=[],
        primary_url=None,
        notes="仅残留单个页面源码文件",
    ),
    ModelConfig(
        model_id="glm-5",
        display_name="GLM-5",
        root_rel="GLM-5",
        sample_type="web_fullstack",
        app_kind="fastapi_vue",
        launch=[
            {
                "name": "backend",
                "cwd": "GLM-5/backend",
                "cmd": "python3 main.py",
            },
            {
                "name": "frontend",
                "cwd": "GLM-5/frontend",
                "cmd": "npm run dev -- --host 127.0.0.1 --port 5173",
            },
        ],
        primary_url="http://127.0.0.1:5173",
        notes="Vue 3 + FastAPI，架构最完整之一",
    ),
    ModelConfig(
        model_id="gemini-3_0-pro",
        display_name="Gemini-3.0-Pro",
        root_rel="Gemini-3.0-Pro/bilibili-platform",
        sample_type="web_fullstack",
        app_kind="fastapi_react",
        launch=[
            {
                "name": "backend",
                "cwd": "Gemini-3.0-Pro/bilibili-platform/backend",
                "cmd": "python3 main.py",
            },
            {
                "name": "frontend",
                "cwd": "Gemini-3.0-Pro/bilibili-platform/frontend",
                "cmd": "npm run dev -- --host 127.0.0.1 --port 5173",
            },
        ],
        primary_url="http://127.0.0.1:5173",
        notes="React + FastAPI，包含多份调试脚本",
    ),
    ModelConfig(
        model_id="gemini-3_0-flash",
        display_name="Gemini-3.0-flash",
        root_rel="Gemini-3.0-flash",
        sample_type="web_fullstack",
        app_kind="python_react_split",
        launch=[
            {
                "name": "backend",
                "cwd": "Gemini-3.0-flash/backend",
                "cmd": "python3 main.py",
            },
            {
                "name": "frontend",
                "cwd": "Gemini-3.0-flash/frontend",
                "cmd": "npm run dev -- --host 127.0.0.1 --port 5173",
            },
        ],
        primary_url="http://127.0.0.1:5173",
        notes="前后端分离，但后端较薄",
    ),
    ModelConfig(
        model_id="gemini-3_1-pro",
        display_name="Gemini-3.1-Pro",
        root_rel="Gemini-3.1-Pro/bilibili_clone",
        sample_type="web_fullstack",
        app_kind="fastapi_static",
        launch=[
            {
                "name": "app",
                "cwd": "Gemini-3.1-Pro/bilibili_clone",
                "cmd": "python3 main.py",
            }
        ],
        primary_url="http://127.0.0.1:8000",
        notes="FastAPI + 纯静态页面",
    ),
    ModelConfig(
        model_id="grok-4_1-thinking-fast",
        display_name="Grok 4.1 Thinking Fast",
        root_rel="Grok 4.1 Thinking Fast/bilibili_player",
        sample_type="off_prompt_desktop",
        app_kind="pyqt_desktop",
        launch=[
            {
                "name": "desktop",
                "cwd": "Grok 4.1 Thinking Fast/bilibili_player",
                "cmd": "python3 src/main.py",
            }
        ],
        primary_url=None,
        notes="偏题：桌面 GUI 播放器，不是网页平台",
    ),
    ModelConfig(
        model_id="kimi-k2_5",
        display_name="Kimi-K2.5",
        root_rel="Kimi-K2.5/bilibili-app",
        sample_type="frontend_only",
        app_kind="react_frontend_only",
        launch=[
            {
                "name": "frontend",
                "cwd": "Kimi-K2.5/bilibili-app",
                "cmd": "npm run dev -- --host 127.0.0.1 --port 5173",
            }
        ],
        primary_url="http://127.0.0.1:5173",
        notes="主要是前端壳，后端能力缺失",
    ),
    ModelConfig(
        model_id="kimi-k2_5-v2",
        display_name="Kimi-K2.5-V2",
        root_rel="Kimi-K2.5-V2/bilibili-platform",
        sample_type="web_fullstack",
        app_kind="fastapi_static",
        launch=[
            {
                "name": "app",
                "cwd": "Kimi-K2.5-V2/bilibili-platform",
                "cmd": ".venv312/bin/uvicorn backend.api_server:app --host 127.0.0.1 --port 8010",
            }
        ],
        primary_url="http://127.0.0.1:8010",
        notes="官网版 Kimi 新样本：FastAPI + 原生 HTML/CSS/JS",
    ),
    ModelConfig(
        model_id="mimo-v2-flash",
        display_name="Mimo-V2-Flash",
        root_rel="Mimo-V2-Flash/bilibili_platform",
        sample_type="web_fullstack",
        app_kind="flask_multipage",
        launch=[
            {
                "name": "app",
                "cwd": "Mimo-V2-Flash/bilibili_platform",
                "cmd": "python3 start_server.py",
            }
        ],
        primary_url="http://127.0.0.1:5002",
        notes="Flask 多页站，附带平台账户系统",
    ),
    ModelConfig(
        model_id="minimax-m2_5",
        display_name="MiniMax-M2.5",
        root_rel="MiniMax-M2.5",
        sample_type="web_split_static",
        app_kind="flask_plus_static_frontend",
        launch=[
            {
                "name": "backend",
                "cwd": "MiniMax-M2.5/backend",
                "cmd": "python3 app.py",
            },
            {
                "name": "frontend",
                "cwd": "MiniMax-M2.5/frontend",
                "cmd": "python3 -m http.server 8000 --bind 127.0.0.1",
            },
        ],
        primary_url="http://127.0.0.1:8000",
        notes="Flask 后端 + 独立静态前端",
    ),
    ModelConfig(
        model_id="qwen-3_5",
        display_name="Qwen-3.5",
        root_rel="Qwen-3.5/bilibili-platform",
        sample_type="web_fullstack",
        app_kind="express_cra",
        launch=[
            {
                "name": "backend",
                "cwd": "Qwen-3.5/bilibili-platform/backend",
                "cmd": "npm run dev",
            },
            {
                "name": "frontend",
                "cwd": "Qwen-3.5/bilibili-platform/frontend",
                "cmd": "npm start",
            },
        ],
        primary_url="http://127.0.0.1:3000",
        notes="Express + CRA，文档非常多",
    ),
    ModelConfig(
        model_id="step-3_5-flash",
        display_name="Step-3.5-Flash",
        root_rel="Step-3.5-Flash/bilibili-clone",
        sample_type="web_fullstack",
        app_kind="express_vite",
        launch=[
            {
                "name": "backend",
                "cwd": "Step-3.5-Flash/bilibili-clone/backend",
                "cmd": "npm run dev",
            },
            {
                "name": "frontend",
                "cwd": "Step-3.5-Flash/bilibili-clone/frontend",
                "cmd": "npm run dev -- --host 127.0.0.1 --port 5173",
            },
        ],
        primary_url="http://127.0.0.1:5173",
        notes="Express + Vite + TS，工程组织较完整",
    ),
]


def ensure_dirs() -> None:
    for path in [OUT, DATA_DIR, TREE_DIR, SCREENSHOT_DIR, ASSET_DIR]:
        path.mkdir(parents=True, exist_ok=True)


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        return ""


def is_ignored(path: Path) -> bool:
    for part in path.parts:
        if part in IGNORE_DIRS:
            return True
        if part.startswith(".venv"):
            return True
    return False


def list_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in root.rglob("*"):
        if is_ignored(path):
            continue
        if path.is_file():
            files.append(path)
    return files


def build_tree_lines(root: Path, max_depth: int = 4, max_lines: int = 180) -> list[str]:
    lines = [root.name + "/"]

    def _walk(path: Path, prefix: str = "", depth: int = 0) -> None:
        if depth >= max_depth or len(lines) >= max_lines:
            return
        entries = []
        for entry in sorted(path.iterdir(), key=lambda item: (item.is_file(), item.name.lower())):
            if is_ignored(entry):
                continue
            entries.append(entry)
        for index, entry in enumerate(entries):
            branch = "└── " if index == len(entries) - 1 else "├── "
            line = prefix + branch + entry.name + ("/" if entry.is_dir() else "")
            lines.append(line)
            if len(lines) >= max_lines:
                return
            if entry.is_dir():
                extension = "    " if index == len(entries) - 1 else "│   "
                _walk(entry, prefix + extension, depth + 1)

    _walk(root)
    return lines


def summarize_tree(lines: list[str]) -> dict[str, Any]:
    return {
        "line_count": len(lines),
        "preview": lines[:28],
    }


def truncate_text(text: str, limit: int = 120) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip()
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 1].rstrip() + "…"


def has_path_fragment(rel_paths: list[str], *fragments: str) -> bool:
    return any(any(fragment in path for fragment in fragments) for path in rel_paths)


def collect_structure_flags(rel_paths: list[str]) -> dict[str, bool]:
    return {
        "has_frontend_dir": has_path_fragment(rel_paths, "frontend/"),
        "has_backend_dir": has_path_fragment(rel_paths, "backend/"),
        "has_templates": has_path_fragment(rel_paths, "templates/"),
        "has_static": has_path_fragment(rel_paths, "static/"),
        "has_public": has_path_fragment(rel_paths, "public/"),
        "has_src": has_path_fragment(rel_paths, "src/"),
        "has_components": has_path_fragment(rel_paths, "/components/", "components/"),
        "has_pages": has_path_fragment(rel_paths, "/pages/", "pages/"),
        "has_store": has_path_fragment(rel_paths, "/stores/", "/store/", "stores/", "store/"),
        "has_routes": has_path_fragment(rel_paths, "/routes/", "/api/", "routes/", "api/"),
        "has_services": has_path_fragment(rel_paths, "/services/", "service.py", "services/"),
        "has_models": has_path_fragment(rel_paths, "/models/", "schemas.py", "models/"),
        "has_utils": has_path_fragment(rel_paths, "/utils/", "utils/"),
        "has_config": has_path_fragment(rel_paths, "/config/", "config.py", "settings.py"),
        "has_db": any(path.endswith((".db", ".sqlite", ".sqlite3")) for path in rel_paths),
        "has_auth_files": has_path_fragment(rel_paths, "auth.py", "login", "credential", "cookies/"),
        "has_tests": has_path_fragment(rel_paths, "test_", "_test.", "/tests/", "tests/"),
    }


def detect_tech_stack(files: list[Path], root: Path) -> list[str]:
    names = {file.name for file in files}
    stack: list[str] = []
    if "requirements.txt" in names:
        stack.append("Python")
    if any(file.suffix in {".ts", ".tsx"} for file in files):
        stack.append("TypeScript")
    if any(file.suffix == ".vue" for file in files):
        stack.append("Vue")
    if any(file.suffix == ".tsx" for file in files):
        stack.append("React")
    if any(file.suffix == ".py" for file in files):
        content = "\n".join(read_text(file)[:4000] for file in files if file.suffix == ".py")
        if "FastAPI" in content:
            stack.append("FastAPI")
        if "Flask" in content:
            stack.append("Flask")
        if "PyQt" in content or "PySide" in content:
            stack.append("PyQt")
    if "package.json" in names:
        pkg_files = [file for file in files if file.name == "package.json"]
        pkg_content = "\n".join(read_text(file) for file in pkg_files)
        if "vite" in pkg_content:
            stack.append("Vite")
        if "react-scripts" in pkg_content:
            stack.append("Create React App")
        if "\"express\"" in pkg_content:
            stack.append("Express")
    if any("bilibili-api" in read_text(file) for file in files if file.suffix in {".py", ".js", ".ts", ".tsx"}):
        stack.append("bilibili-api")
    ordered: list[str] = []
    for item in stack:
        if item not in ordered:
            ordered.append(item)
    return ordered


def collect_static_metrics(config: ModelConfig) -> dict[str, Any]:
    root = ROOT / config.root_rel
    files = list_files(root) if root.exists() else []
    rel_paths = [str(file.relative_to(root)).replace("\\", "/") for file in files]
    ext_counter = Counter(file.suffix or "<no_ext>" for file in files)
    docs_files = [file for file in files if file.name.lower().startswith("readme") or file.suffix == ".md"]
    default_template_hits = 0
    for file in files:
        if file.name == "README.md" and "react + typescript + vite" in read_text(file).lower():
            default_template_hits += 1
        if file.name == "vite.svg":
            default_template_hits += 1
    debug_like = [
        str(file.relative_to(root))
        for file in files
        if re.search(r"(^|/)(test_|check_|debug|startup|summary|final_summary|project_checklist)", str(file.relative_to(root)).lower())
    ]
    bilibili_refs = 0
    for file in files:
        if file.suffix in {".py", ".js", ".ts", ".tsx", ".vue", ".md"}:
            bilibili_refs += read_text(file).lower().count("bilibili-api")
            bilibili_refs += read_text(file).lower().count("bilibili_api")
    tree_lines = build_tree_lines(root) if root.exists() else [config.root_rel]
    (TREE_DIR / f"{config.model_id}.txt").write_text("\n".join(tree_lines), encoding="utf-8")
    structure_flags = collect_structure_flags(rel_paths)
    return {
        "root_abs": str(root),
        "file_count": len(files),
        "extension_counts": ext_counter.most_common(10),
        "docs_count": len(docs_files),
        "docs_files": [str(file.relative_to(root)).replace("\\", "/") for file in docs_files[:8]],
        "debug_like_files": debug_like[:30],
        "debug_like_count": len(debug_like),
        "default_template_hits": default_template_hits,
        "bilibili_api_refs": bilibili_refs,
        "tech_stack": detect_tech_stack(files, root),
        "tree_summary": summarize_tree(tree_lines),
        "top_level_entries": sorted({path.split("/")[0] for path in rel_paths})[:16],
        "rel_paths": rel_paths,
        "structure_flags": structure_flags,
    }


def make_summary(config: ModelConfig, metrics: dict[str, Any]) -> dict[str, Any]:
    file_count = metrics["file_count"]
    docs_count = metrics["docs_count"]
    docs_files = metrics["docs_files"]
    debug_count = metrics["debug_like_count"]
    debug_files = metrics["debug_like_files"]
    template_hits = metrics["default_template_hits"]
    bilibili_refs = metrics["bilibili_api_refs"]
    tech_stack = metrics["tech_stack"]
    flags = metrics["structure_flags"]

    if config.sample_type == "off_prompt_desktop":
        architecture = "源码按 `src/api`、`src/ui`、`src/utils` 做了典型桌面 GUI 分层，窗口、登录框、评论组件和播放器组件都有独立文件；工程角度并不散乱，但交付物是 PyQt 桌面程序，不是网页平台。"
        frontend_quality = "界面层是桌面端 widget 结构，不适用于网页前端评价；从源码拆分看，窗口、登录框、评论区和播放器各自独立，桌面 GUI 组织反而比很多网页壳更完整。"
        backend_quality = "没有独立 Web 后端，更多是桌面端内嵌的 API 调用与状态管理；在题目要求下，这部分不能等价视为网页后端能力。"
    elif config.sample_type == "incomplete":
        architecture = "仓库里只剩一个 `Search.tsx` 页面片段，前端入口、后端、静态资源、构建配置和运行脚本都缺失，严格来说已经谈不上完整架构。"
        frontend_quality = "仅保留单页源码残片，无法从当前目录恢复出完整前端结构。"
        backend_quality = "没有后端目录、接口层或服务层，题目要求的登录、评论、弹幕和收藏链路都无从承接。"
    elif config.sample_type == "frontend_only":
        architecture_parts = []
        if flags["has_pages"] and flags["has_components"]:
            architecture_parts.append("前端至少按 `pages` + `components` 拆开")
        if flags["has_store"]:
            architecture_parts.append("并额外放了状态层")
        if flags["has_public"]:
            architecture_parts.append("构建形态是标准 Vite/React 前端")
        architecture = "；".join(architecture_parts) + "。数据层全部压在浏览器侧，缺少题目要求的可运行后端与认证代理，所以结构看起来完整，交付却停在前端壳阶段。"
        frontend_quality = "页面、组件、类型和状态层都拆了出来，前端工程感并不差；问题不在表层代码，而在数据与鉴权策略没有落到可交付架构。"
        backend_quality = "仓库没有独立后端，所有能力要么缺失，要么直接让浏览器打外部接口；这在登录、评论、弹幕和收藏场景里天然不稳。"
    else:
        arch_segments: list[str] = []
        if flags["has_frontend_dir"] and flags["has_backend_dir"]:
            arch_segments.append("采用明确的前后端分仓结构")
        elif flags["has_templates"] and flags["has_static"]:
            arch_segments.append("这是服务端模板站结构，`templates` 与 `static` 和 Python 入口同仓")
        elif flags["has_static"]:
            arch_segments.append("整体更像轻后端 + 静态前端的组合")
        else:
            arch_segments.append("工程骨架偏轻，很多能力集中在少数入口文件")

        if flags["has_routes"] and flags["has_services"] and flags["has_models"]:
            arch_segments.append("后端至少拆到 route/service/schema(model) 三层")
        elif flags["has_routes"] and flags["has_services"]:
            arch_segments.append("后端已把路由与服务层分开")
        elif flags["has_services"]:
            arch_segments.append("后端有独立 service 层，但边界还不算很厚")
        elif flags["has_backend_dir"] or "Python" in tech_stack:
            arch_segments.append("后端仍偏单入口脚本或单体应用")

        if flags["has_pages"] and flags["has_components"] and flags["has_store"]:
            arch_segments.append("前端按 pages/components/store 拆层，属于可继续扩写的现代前端骨架")
        elif flags["has_pages"] and flags["has_components"]:
            arch_segments.append("前端至少拆出了 pages/components，页面层次比单文件壳成熟")
        elif flags["has_templates"] and flags["has_static"]:
            arch_segments.append("前端展示层主要靠模板页和少量静态脚本驱动")
        elif flags["has_static"] or flags["has_public"]:
            arch_segments.append("前端文件数不多，核心逻辑大概率集中在主页面或主脚本")

        if flags["has_db"]:
            arch_segments.append("仓库内还带了本地数据或凭据持久化文件")
        if debug_count >= 4:
            arch_segments.append(f"同时夹带 {debug_count} 个调试/检查脚本，交付边界不够干净")
        if template_hits:
            arch_segments.append("脚手架默认资源没有清干净")
        architecture = "；".join(arch_segments) + "。"

        if flags["has_pages"] and flags["has_components"] and flags["has_store"]:
            frontend_quality = "前端不是简单一页糊完，而是有页面、组件和状态层拆分，工程骨架比大多数 one-shot 样本稳。"
        elif flags["has_pages"] and flags["has_components"]:
            frontend_quality = "前端至少拆到了页面和组件两层，阅读成本比单文件 App 更低。"
        elif flags["has_templates"] and flags["has_static"]:
            frontend_quality = "前端属于模板 + 静态脚本路线，路径短、落地快，但复杂状态一多就容易回流到单个 JS 文件。"
        elif flags["has_static"] or flags["has_public"]:
            frontend_quality = "前端骨架已经成型，但源文件不多，核心逻辑大概率集中在主页面或主脚本。"
        else:
            frontend_quality = "存在基础界面实现，但前端工程边界不够清楚。"
        if template_hits:
            frontend_quality += " 同时还残留脚手架默认资源，打磨度被拉低。"

        if flags["has_routes"] and flags["has_services"] and flags["has_models"]:
            backend_quality = "后端具备比较像样的接口分层：路由、服务、数据模型和配置都能在目录里找到。"
        elif flags["has_routes"] and flags["has_services"]:
            backend_quality = "后端至少把路由和服务层拆开了，不是把所有逻辑全塞进入口文件。"
        elif flags["has_services"]:
            backend_quality = "后端有独立服务层，但总体仍偏轻量，很多规则可能集中在单个 service 文件。"
        elif flags["has_backend_dir"] or "Python" in tech_stack:
            backend_quality = "后端确实存在，但整体更像单入口脚本或模板胶水层，后续扩写时容易膨胀。"
        else:
            backend_quality = "后端能力缺失或仅停留在非常薄的一层。"
        if bilibili_refs == 0 and config.sample_type not in {"frontend_only", "incomplete", "off_prompt_desktop"}:
            backend_quality += " 更关键的是，代码里没有真正把 `bilibili-api` 依赖落到实现层。"

    instruction: list[str] = []
    if config.sample_type == "off_prompt_desktop":
        instruction.append("实现偏离题意，交付为桌面 GUI 而不是网页平台。")
    elif config.sample_type == "incomplete":
        instruction.append("样本残缺到无法构成网页产品，题意完成度几乎无从谈起。")
    elif config.sample_type == "frontend_only":
        instruction.append("中文界面和 B 站主题方向基本对题，但后端与登录后能力没有形成可验证闭环。")
    else:
        instruction.append("产品形态仍然围绕“Bilibili 网页平台”展开，没有跑偏到桌面端或别的产品类型。")
    if bilibili_refs == 0:
        instruction.append("源码里未检出可靠的 `bilibili-api` 依赖痕迹，这一条会直接拉低题意遵循度。")
    else:
        instruction.append("代码层确实能看到 `bilibili-api` / `bilibili_api` 的使用或声明。")
    if flags["has_db"] and config.app_kind == "flask_multipage":
        instruction.append("但仓库里还带了额外账户系统与数据库层，题目主线之外的自扩展略多。")

    maintainability: list[str] = []
    if file_count >= 35:
        maintainability.append("模块边界已经拉开，后续继续加功能不至于立刻失控。")
    elif file_count >= 15:
        maintainability.append("目录已经有基本层次，但真正的核心逻辑仍然集中在少数主文件。")
    else:
        maintainability.append("文件数很少，定位问题很快；代价是继续加功能时容易演变成单文件膨胀。")
    if debug_count >= 5:
        maintainability.append("调试/检查脚本偏多，说明交付前清理没有做完。")
    if template_hits:
        maintainability.append("脚手架默认资源还在，仓库卫生不够彻底。")
    if flags["has_db"]:
        maintainability.append("同时带持久化数据文件，评测时需要注意环境污染与状态遗留。")

    docs: list[str] = []
    if docs_count >= 2:
        docs.append(f"文档不止一份，至少能看到 {', '.join(docs_files[:3])}。")
    elif docs_count == 1:
        docs.append(f"目前主要只有 {docs_files[0]} 这一级说明。")
    else:
        docs.append("仓库几乎没有成体系文档，启动和结构理解都要靠读代码。")
    if template_hits:
        docs.append("同时混入了脚手架默认 README/资源，文档信号被稀释。")

    waste: list[str] = []
    waste.append(f"调试/检查类文件共 {debug_count} 个。")
    if debug_files:
        waste.append(f"最明显的噪音文件有：{', '.join(debug_files[:3])}。")
    if template_hits:
        waste.append(f"另有 {template_hits} 个脚手架默认残留信号。")
    if not template_hits and debug_count <= 2:
        waste.append("目录整体还算克制，没有大面积脚手架垃圾。")

    return {
        "frontend": frontend_quality,
        "backend": backend_quality,
        "instruction": " ".join(instruction),
        "maintainability": " ".join(maintainability),
        "docs": " ".join(docs),
        "waste": " ".join(waste),
        "architecture": architecture,
    }


def default_visual_review(config: ModelConfig, metrics: dict[str, Any], summaries: dict[str, str]) -> str:
    flags = metrics["structure_flags"]
    if config.sample_type == "off_prompt_desktop":
        return "可见界面不是网页，而是典型桌面播放器/管理器样式：窗口、侧栏、对话框和组件区块分得很清楚，但这套视觉路线与题目要求的 B 站网页平台并不在同一赛道。"
    if config.sample_type == "incomplete":
        return "当前仓库没有足够的页面、样式和资源形成可视化成品，只剩源码残片，严格来说无法做有效的前端观感评价。"
    if config.sample_type == "frontend_only":
        return "前端壳通常能把粉白主色、导航和卡片布局做出来，但少了后端与真实数据后，很容易停在静态展示层；这类样本的视觉完成度通常高于业务完成度。"
    if flags["has_templates"] and flags["has_static"]:
        return "从结构看这是模板页驱动的网页站点，视觉质量更依赖单页首屏与静态资源是否打磨到位；一旦图标、封面或状态页没补齐，成品感会迅速下滑。"
    if flags["has_pages"] and flags["has_components"]:
        return "前端结构说明它至少想做成多页面产品，而不是单页演示壳；视觉上更值得关注的反而是内容密度、状态页和资源完整度，而不是单纯有没有粉色主题。"
    return "界面层已经具备基础页面形态，但最终观感仍取决于真实数据、资源完整度和状态表达是否撑得住，而不只是颜色像不像 B 站。"


def default_interaction_review(config: ModelConfig, metrics: dict[str, Any], summaries: dict[str, str]) -> str:
    flags = metrics["structure_flags"]
    if config.sample_type == "off_prompt_desktop":
        return "交互对象是桌面窗口而不是浏览器页面，登录、评论和播放器虽然可能有对应组件，但不能按网页产品流畅性标准直接判优。"
    if config.sample_type == "incomplete":
        return "没有可启动成品，也就谈不上真实交互链路；当前只能确认仓库缺少让用户完成播放、登录、评论和收藏的基本入口。"
    if config.sample_type == "frontend_only":
        return "前端按钮和路由大多能点，但真正一碰到鉴权、评论、弹幕和收藏这种需要服务端兜底的动作，就很容易退化成 mock、空态或浏览器跨域错误。"
    if flags["has_routes"] and flags["has_services"]:
        return "从分层看，这类样本至少有把前端交互接到路由/服务层的意识；真正的差距会体现在接口稳定性、错误回退和匿名门禁是不是能闭环。"
    return "基础交互可能存在，但工程层没有太厚的缓冲层，任何接口波动、端口冲突或登录态问题都更容易直接暴露到页面。"


def default_runtime_summary(config: ModelConfig, summaries: dict[str, str]) -> dict[str, str]:
    if config.sample_type == "off_prompt_desktop":
        return {
            "home": "偏题替代态：样本实际交付为桌面主窗口，而不是浏览器首页。",
            "video": "偏题替代态：播放能力位对应桌面播放器区域，不具备网页播放页语义。",
            "comment_danmaku": "偏题替代态：评论/弹幕组件存在于桌面界面，而非网页评论区。",
            "login": "偏题替代态：登录入口是桌面对话框，不是网页登录页或弹窗。",
            "favorites": "偏题替代态：个人中心/收藏能力若存在，也属于桌面端面板。",
            "architecture": summaries["architecture"],
        }
    if config.sample_type == "incomplete":
        return {
            "home": "残缺态：仓库没有可启动首页，只剩前端源码碎片。",
            "video": "残缺态：不存在可访问的视频播放页。",
            "comment_danmaku": "残缺态：评论/弹幕区域没有形成任何可运行界面。",
            "login": "残缺态：没有可点击的登录入口或运行态登录页。",
            "favorites": "残缺态：收藏/个人中心链路缺失。",
            "architecture": summaries["architecture"],
        }
    if config.sample_type == "frontend_only":
        return {
            "home": "前端壳态：通常能看到首页框架，但真实数据和后端状态并不稳定。",
            "video": "前端壳态：视频详情页外壳可见，真正能否加载信息与播放取决于浏览器直连外部接口是否成功。",
            "comment_danmaku": "前端壳态：评论/弹幕组件大多存在，但缺少后端代理时很容易退化为空态或报错。",
            "login": "前端壳态：登录页或弹窗通常能打开，但认证多数停留在 mock 或未闭环状态。",
            "favorites": "前端壳态：收藏/个人中心常能看到页面骨架，但实际鉴权与数据链路偏弱。",
            "architecture": summaries["architecture"],
        }
    return {
        "home": "等待运行证据：该槽位将展示首页实拍或明确失败态。",
        "video": "等待运行证据：该槽位将展示播放页实拍或明确失败态。",
        "comment_danmaku": "等待运行证据：该槽位将展示评论/弹幕区实拍或明确失败态。",
        "login": "等待运行证据：该槽位将展示登录入口/登录页实拍或明确失败态。",
        "favorites": "等待运行证据：该槽位将展示收藏/个人中心实拍或明确失败态。",
        "architecture": summaries["architecture"],
    }


def build_score_reason(model: dict[str, Any]) -> str:
    if model["startup_status"]["status"] == "runtime_verified":
        parts = [
            model["startup_status"]["summary"].strip(),
            model["interaction_review_summary"].strip(),
        ]
        if model["scores"]["ui_quality"] <= 8 or model["scores"]["backend_quality"] <= 10:
            parts.append(model["visual_review_summary"].strip())
        return " ".join(part for part in parts if part)
    parts = [
        model["instruction_following_summary"].strip(),
        model["architecture_review_summary"].strip(),
    ]
    return " ".join(part for part in parts if part)


def default_auth_review_summary(model: dict[str, Any]) -> str:
    login = model["feature_matrix"]["login"]
    favorites = model["feature_matrix"]["favorites"]
    post_login = model["feature_matrix"]["post_login_actions"]
    if login["status"] == "no":
        return "未见可用登录入口，评论、弹幕、收藏等登录后能力无法形成真实审计闭环。"
    if login["status"] == "partial":
        return (
            f"登录链路只有部分接通：{login['summary']} "
            f"收藏/个人中心：{favorites['summary']} "
            f"登录后互动：{post_login['summary']}"
        )
    return (
        f"存在登录入口。收藏/个人中心：{favorites['summary']} "
        f"登录后互动：{post_login['summary']} "
        "若没有额外实测证据，则只按门禁或代码声明存在计，不按真实登录后跑通计分。"
    )


def clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def remap_score(value: int, legacy_max: int, new_max: int) -> int:
    if legacy_max <= 0 or new_max <= 0:
        return 0
    normalized = max(0.0, min(1.0, value / legacy_max))
    stretched = normalized ** SCORE_STRETCH_EXPONENT
    return clamp(int(round(stretched * new_max)), 0, new_max)


def remap_scores(scores: dict[str, int]) -> dict[str, int]:
    remapped: dict[str, int] = {}
    for key in SCORE_WEIGHTS:
        if key == "architecture_quality":
            remapped[key] = remap_score(
                scores.get("maintainability", 0),
                LEGACY_SCORE_WEIGHTS["maintainability"],
                SCORE_WEIGHTS["architecture_quality"],
            )
            continue
        remapped[key] = remap_score(scores.get(key, 0), LEGACY_SCORE_WEIGHTS[key], SCORE_WEIGHTS[key])
    return remapped


def apply_ui_review(model: dict[str, Any]) -> None:
    review = UI_REVIEW_OVERRIDES.get(model["model_id"])
    if review:
        model["scores"]["ui_quality"] = review["score"]
        model["ui_scoring_summary"] = review["summary"]
        return
    model["ui_scoring_summary"] = "当前未命中人工 UI 复核条目，沿用运行证据与视觉评语的自动综合结果。"


def apply_strict_review(model: dict[str, Any]) -> None:
    review = STRICT_REVIEW_OVERRIDES.get(model["model_id"])
    if not review:
        model["backend_scoring_summary"] = "当前未命中人工后端复核条目，沿用自动工程评分。"
        model["architecture_scoring_summary"] = "当前未命中人工架构复核条目，沿用自动架构评分。"
        return
    model["scores"].update(review["scores"])
    model["backend_scoring_summary"] = review["backend_scoring_summary"]
    model["architecture_scoring_summary"] = review["architecture_scoring_summary"]


def compute_scores(config: ModelConfig, metrics: dict[str, Any]) -> tuple[dict[str, int], list[str], str]:
    tags: list[str] = []
    sample_type = config.sample_type
    file_count = metrics["file_count"]
    bilibili_refs = metrics["bilibili_api_refs"]
    docs_count = metrics["docs_count"]
    debug_count = metrics["debug_like_count"]
    template_hits = metrics["default_template_hits"]

    if sample_type == "off_prompt_desktop":
        tags.append("偏题实现")
    if sample_type == "incomplete":
        tags.append("残缺样本")
    if sample_type == "frontend_only":
        tags.append("前端壳")

    base = {
        "functionality": 6,
        "runnability": 4,
        "instruction_following": 6,
        "ui_quality": 5,
        "frontend_quality": 5,
        "backend_quality": 4,
        "maintainability": 4,
        "docs_quality": 3,
        "waste_control": 3,
    }

    if sample_type == "web_fullstack":
        base.update(
            {
                "functionality": 13,
                "runnability": 10,
                "instruction_following": 12,
                "ui_quality": 8,
                "frontend_quality": 7,
                "backend_quality": 7,
                "maintainability": 6,
                "docs_quality": 3,
                "waste_control": 3,
            }
        )
    elif sample_type == "web_split_static":
        base.update(
            {
                "functionality": 11,
                "runnability": 9,
                "instruction_following": 11,
                "ui_quality": 7,
                "frontend_quality": 6,
                "backend_quality": 6,
                "maintainability": 5,
                "docs_quality": 3,
                "waste_control": 3,
            }
        )
    elif sample_type == "frontend_only":
        base.update(
            {
                "functionality": 8,
                "runnability": 8,
                "instruction_following": 8,
                "ui_quality": 7,
                "frontend_quality": 7,
                "backend_quality": 1,
                "maintainability": 5,
                "docs_quality": 3,
                "waste_control": 3,
            }
        )
    elif sample_type == "off_prompt_desktop":
        base.update(
            {
                "functionality": 5,
                "runnability": 6,
                "instruction_following": 2,
                "ui_quality": 4,
                "frontend_quality": 1,
                "backend_quality": 5,
                "maintainability": 4,
                "docs_quality": 3,
                "waste_control": 3,
            }
        )
    elif sample_type == "incomplete":
        base.update(
            {
                "functionality": 1,
                "runnability": 0,
                "instruction_following": 2,
                "ui_quality": 1,
                "frontend_quality": 1,
                "backend_quality": 0,
                "maintainability": 1,
                "docs_quality": 0,
                "waste_control": 2,
            }
        )

    base["functionality"] = clamp(base["functionality"] + min(3, bilibili_refs // 10), 0, LEGACY_SCORE_WEIGHTS["functionality"])
    base["maintainability"] = clamp(base["maintainability"] + (2 if file_count >= 35 else 0), 0, LEGACY_SCORE_WEIGHTS["maintainability"])
    base["docs_quality"] = clamp(base["docs_quality"] + min(2, docs_count), 0, LEGACY_SCORE_WEIGHTS["docs_quality"])
    waste_bonus = 1 if debug_count <= 2 and template_hits == 0 else 0
    waste_penalty = min(3, debug_count // 4) + min(2, template_hits)
    base["waste_control"] = clamp(base["waste_control"] + waste_bonus - waste_penalty, 0, LEGACY_SCORE_WEIGHTS["waste_control"])
    if bilibili_refs == 0 and sample_type not in {"incomplete", "off_prompt_desktop"}:
        base["instruction_following"] = clamp(base["instruction_following"] - 3, 0, LEGACY_SCORE_WEIGHTS["instruction_following"])

    total = sum(base.values())
    if total >= 80:
        oneshot = "成功"
    elif total >= 55:
        oneshot = "部分成功"
    else:
        oneshot = "失败"
    tags.append(f"oneshot {oneshot}")
    return base, tags, oneshot


def feature_matrix(config: ModelConfig, scores: dict[str, int]) -> dict[str, dict[str, str]]:
    sample_type = config.sample_type

    def state(ok: bool, text_ok: str, text_bad: str) -> dict[str, str]:
        return {"status": "yes" if ok else "no", "summary": text_ok if ok else text_bad}

    if sample_type == "incomplete":
        return {
            "playback": state(False, "", "无法验证，项目残缺。"),
            "video_info": state(False, "", "无法验证。"),
            "comments": state(False, "", "无法验证。"),
            "danmaku": state(False, "", "无法验证。"),
            "login": state(False, "", "无法验证。"),
            "post_login_actions": state(False, "", "无法验证。"),
            "favorites": state(False, "", "无法验证。"),
        }
    if sample_type == "off_prompt_desktop":
        return {
            "playback": state(True, "桌面端形态下存在视频播放。", ""),
            "video_info": state(True, "桌面端界面包含信息区域。", ""),
            "comments": state(True, "桌面端实现评论组件。", ""),
            "danmaku": state(True, "桌面端实现弹幕组件。", ""),
            "login": state(True, "桌面端实现登录对话框。", ""),
            "post_login_actions": state(True, "桌面端声明支持发评/发弹幕/收藏。", ""),
            "favorites": state(True, "桌面端含收藏区。", ""),
        }
    if sample_type == "frontend_only":
        return {
            "playback": state(True, "前端中有视频播放页。", ""),
            "video_info": state(True, "前端中有信息展示。", ""),
            "comments": state(True, "前端评论区域已实现。", ""),
            "danmaku": state(True, "前端有弹幕列表或弹幕层。", ""),
            "login": state(True, "前端有登录页/入口。", ""),
            "post_login_actions": {"status": "partial", "summary": "UI 存在，但后端链路不足。"},
            "favorites": state(True, "前端存在收藏/个人页。", ""),
        }

    rich = scores["functionality"] >= 14
    return {
        "playback": state(True, "存在播放能力与官网跳转入口。", ""),
        "video_info": state(True, "存在视频信息展示。", ""),
        "comments": state(True, "存在评论查看能力。", ""),
        "danmaku": state(True, "存在弹幕查看能力。", ""),
        "login": state(True, "存在登录入口与流程 UI。", ""),
        "post_login_actions": {"status": "yes" if rich else "partial", "summary": "声明支持登录后互动，但本轮未做副作用实测。"},
        "favorites": {"status": "yes" if rich else "partial", "summary": "存在收藏/个人中心能力。" if rich else "收藏相关能力存在，但可运行性待进一步确认。"},
    }


def wrap_svg_text(text: str, limit: int = 30, max_lines: int = 4) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text or "").strip()
    if not cleaned:
        return []
    lines: list[str] = []
    current = ""
    for char in cleaned:
        current += char
        if len(current) >= limit:
            lines.append(current)
            current = ""
            if len(lines) >= max_lines:
                break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) == max_lines and sum(len(line) for line in lines) < len(cleaned):
        lines[-1] = lines[-1][:-1].rstrip() + "…"
    return lines


def svg_text_block(x: int, y: int, lines: list[str], font_size: int, color: str, line_height: int, weight: str = "400") -> str:
    rendered = []
    current_y = y
    for line in lines:
        rendered.append(
            f'<text x="{x}" y="{current_y}" fill="{color}" font-size="{font_size}" font-weight="{weight}" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">{escape_xml(line)}</text>'
        )
        current_y += line_height
    return "".join(rendered)


def placeholder_svg(
    title: str,
    subtitle: str,
    bullets: list[str],
    accent: str = "#fb7299",
    score_text: str = "",
    status_text: str = "",
    footer_lines: list[str] | None = None,
    tree_lines: list[str] | None = None,
) -> str:
    footer_lines = footer_lines or []
    tree_lines = tree_lines or []
    title_lines = wrap_svg_text(title, limit=19, max_lines=2)
    subtitle_lines = wrap_svg_text(subtitle, limit=28, max_lines=5)
    bullet_blocks = []
    current_y = 408
    for bullet in bullets[:4]:
        lines = wrap_svg_text(bullet, limit=27, max_lines=3)
        bullet_height = 40 + max(1, len(lines)) * 34
        bullet_blocks.append(
            f'<rect x="72" y="{current_y - 34}" width="640" height="{bullet_height}" rx="22" fill="rgba(255,255,255,0.7)" stroke="rgba(23,32,51,0.08)"/>'
            f'<circle cx="108" cy="{current_y - 4}" r="9" fill="{accent}"/>'
            f'{svg_text_block(132, current_y + 6, lines, 24, "#31425f", 32)}'
        )
        current_y += bullet_height + 18
    footer_blocks = []
    footer_y = 184
    for line in footer_lines[:4]:
        lines = wrap_svg_text(line, limit=26, max_lines=2)
        footer_blocks.append(
            f'<rect x="1088" y="{footer_y - 34}" width="428" height="{56 + len(lines) * 24}" rx="20" fill="rgba(255,255,255,0.62)" stroke="rgba(23,32,51,0.08)"/>'
            f'{svg_text_block(1118, footer_y + 6, lines, 22, "#41516d", 30, "500")}'
        )
        footer_y += 92
    tree_block = ""
    if tree_lines:
        preview = tree_lines[:12]
        block_y = 702
        tree_text = []
        for idx, line in enumerate(preview):
            tree_text.append(
                f'<text x="770" y="{block_y + idx * 24}" fill="#dce7ff" font-size="19" font-family="SFMono-Regular, Menlo, monospace">{escape_xml(line)}</text>'
            )
        tree_block = (
            '<rect x="734" y="612" width="782" height="214" rx="26" fill="#0f1728"/>'
            '<text x="770" y="654" fill="#f7f9ff" font-size="24" font-weight="700" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">目录树预览</text>'
            + "".join(tree_text)
        )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#fff8fb"/>
    <stop offset="52%" stop-color="#f3f6fb"/>
    <stop offset="100%" stop-color="#edf5fb"/>
  </linearGradient>
  <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="{accent}"/>
    <stop offset="100%" stop-color="#48c7df"/>
  </linearGradient>
</defs>
<rect width="1600" height="900" fill="url(#bg)"/>
<circle cx="1388" cy="112" r="220" fill="{accent}" opacity="0.12"/>
<circle cx="1448" cy="762" r="260" fill="#48c7df" opacity="0.1"/>
<rect x="36" y="36" width="1528" height="828" rx="38" fill="rgba(255,255,255,0.76)" stroke="rgba(23,32,51,0.08)"/>
<rect x="56" y="56" width="1488" height="14" rx="7" fill="url(#band)"/>
<text x="72" y="118" fill="#cc5f84" font-size="24" font-weight="700" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">Bilibili One-Shot Benchmark · 失败态 / 证据态卡片</text>
<rect x="72" y="150" width="644" height="676" rx="34" fill="rgba(255,255,255,0.86)" stroke="rgba(23,32,51,0.08)"/>
<rect x="744" y="150" width="772" height="434" rx="34" fill="rgba(255,255,255,0.82)" stroke="rgba(23,32,51,0.08)"/>
<rect x="774" y="182" width="170" height="48" rx="24" fill="rgba(251,114,153,0.14)"/>
<text x="804" y="214" fill="#bf4b75" font-size="24" font-weight="700" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">{escape_xml(score_text or "评测证据")}</text>
<rect x="958" y="182" width="184" height="48" rx="24" fill="rgba(72,199,223,0.14)"/>
<text x="990" y="214" fill="#1c7f92" font-size="24" font-weight="700" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">{escape_xml(status_text or "需结合证据")}</text>
{svg_text_block(72, 214, title_lines, 54, "#18233c", 58, "800")}
{svg_text_block(774, 294, subtitle_lines, 28, "#48597a", 38, "500")}
<text x="72" y="356" fill="#546680" font-size="24" font-weight="700" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">槽位结论</text>
{''.join(bullet_blocks)}
<text x="774" y="396" fill="#546680" font-size="24" font-weight="700" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">关键证据</text>
{''.join(footer_blocks)}
{tree_block}
<text x="72" y="838" fill="#74849f" font-size="22" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">此类图片用于保证横向对比不缺槽位，但文案全部取自当前样本的真实结构、运行结论和扣分依据。</text>
</svg>"""


def escape_xml(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def write_placeholder_images(models: list[dict[str, Any]]) -> None:
    for model in models:
        target_dir = SCREENSHOT_DIR / model["model_id"]
        target_dir.mkdir(parents=True, exist_ok=True)
        score_text = f"{model['scores']['total']} 分"
        common_bullets = [
            f"样本类型：{model['sample_type_label']}",
            f"启动判断：{model['startup_status']['status_label']}，{truncate_text(model['startup_status']['summary'], 48)}",
            f"实测/架构摘要：{truncate_text(model['score_reason_summary'], 52)}",
            f"指令遵循：{truncate_text(model['instruction_following_summary'], 52)}",
        ]
        slot_map = {
            "slot_a_home": ("A-首页/主界面", model["runtime_summary"]["home"]),
            "slot_b_video": ("B-视频播放与信息展示", model["runtime_summary"]["video"]),
            "slot_c_comment_danmaku": ("C-评论与弹幕区域", model["runtime_summary"]["comment_danmaku"]),
            "slot_d_login": ("D-登录入口/登录页/登录弹窗", model["runtime_summary"]["login"]),
            "slot_e_favorites": ("E-收藏/个人中心/登录后能力入口", model["runtime_summary"]["favorites"]),
            "slot_f_architecture": ("F-目录结构与架构总览图", model["runtime_summary"]["architecture"]),
        }
        for slot_key, slot_label in SLOT_DEFS:
            title, summary = slot_map[slot_key]
            footer_lines = [
                f"技术栈：{' / '.join(model['tech_stack']) or '未识别'}",
                f"顶层目录：{', '.join(model['static_metrics']['top_level_entries'][:5]) or '无'}",
                f"文档 {model['static_metrics']['docs_count']} 份；调试/检查文件 {model['static_metrics']['debug_like_count']} 个",
            ]
            runtime_note = model["evidence_refs"].get("runtime_note")
            if runtime_note:
                footer_lines.append(f"补充证据：{truncate_text(runtime_note, 48)}")
            tree_lines = model["tree_summary"]["preview"] if slot_key == "slot_f_architecture" else []
            svg = placeholder_svg(
                title=f"{model['display_name']} · {title}",
                subtitle=summary,
                bullets=common_bullets if slot_key != "slot_f_architecture" else [
                    f"架构判断：{truncate_text(model['architecture_review_summary'], 54)}",
                    f"前端：{truncate_text(model['frontend_quality_summary'], 54)}",
                    f"后端：{truncate_text(model['backend_quality_summary'], 54)}",
                    f"仓库卫生：{truncate_text(model['waste_summary'], 54)}",
                ],
                score_text=score_text,
                status_text=model["startup_status"]["status_label"],
                footer_lines=footer_lines,
                tree_lines=tree_lines,
            )
            (target_dir / f"{slot_key}.svg").write_text(svg, encoding="utf-8")


def status_label(sample_type: str, oneshot: str) -> tuple[str, str]:
    if sample_type == "off_prompt_desktop":
        return "偏题样本", "非网页平台，按偏题样本处理。"
    if sample_type == "incomplete":
        return "不可运行", "目录残缺，无法形成可访问产品。"
    if oneshot == "成功":
        return "可运行", "存在较完整的启动与产品形态。"
    if oneshot == "部分成功":
        return "部分可运行", "具备一定产品形态，但链路不完整或风险较大。"
    return "不可运行", "无法稳定构成题目要求的平台能力。"


def make_model_entry(config: ModelConfig) -> dict[str, Any]:
    metrics = collect_static_metrics(config)
    summaries = make_summary(config, metrics)
    component_scores, tags, oneshot = compute_scores(config, metrics)
    total = sum(component_scores.values())
    label, summary = status_label(config.sample_type, oneshot)
    feature = feature_matrix(config, component_scores)
    slot_paths = {
        slot_key: f"screenshots/{config.model_id}/{slot_key}.svg" for slot_key, _ in SLOT_DEFS
    }
    model = {
        "model_id": config.model_id,
        "display_name": config.display_name,
        "sample_type": config.sample_type,
        "sample_type_label": {
            "web_fullstack": "网页全栈",
            "web_split_static": "网页拆分静态前端",
            "frontend_only": "仅前端壳",
            "off_prompt_desktop": "偏题桌面端",
            "incomplete": "残缺样本",
        }[config.sample_type],
        "app_kind": config.app_kind,
        "root_rel": config.root_rel,
        "root_abs": metrics["root_abs"],
        "notes": config.notes,
        "launch": config.launch,
        "primary_url": config.primary_url,
        "tech_stack": metrics["tech_stack"],
        "startup_status": {
            "status": "planned",
            "status_label": label,
            "summary": summary,
        },
        "oneshot_status": oneshot,
        "scores": {
            **component_scores,
            "total": total,
        },
        "tags": tags,
        "feature_matrix": feature,
        "screenshot_slots": slot_paths,
        "tree_summary": metrics["tree_summary"],
        "tree_file": f"data/trees/{config.model_id}.txt",
        "static_metrics": {
            "file_count": metrics["file_count"],
            "docs_count": metrics["docs_count"],
            "docs_files": metrics["docs_files"],
            "debug_like_count": metrics["debug_like_count"],
            "default_template_hits": metrics["default_template_hits"],
            "bilibili_api_refs": metrics["bilibili_api_refs"],
            "extension_counts": metrics["extension_counts"],
            "debug_like_files": metrics["debug_like_files"],
            "top_level_entries": metrics["top_level_entries"],
            "structure_flags": metrics["structure_flags"],
        },
        "architecture_review_summary": summaries["architecture"],
        "frontend_quality_summary": summaries["frontend"],
        "backend_quality_summary": summaries["backend"],
        "backend_scoring_summary": summaries["backend"],
        "maintainability_summary": summaries["maintainability"],
        "architecture_scoring_summary": summaries["architecture"],
        "docs_quality_summary": summaries["docs"],
        "waste_summary": summaries["waste"],
        "instruction_following_summary": summaries["instruction"],
        "auth_review_summary": "",
        "visual_review_summary": default_visual_review(config, metrics, summaries),
        "interaction_review_summary": default_interaction_review(config, metrics, summaries),
        "runtime_summary": default_runtime_summary(config, summaries),
        "evidence_refs": {
            "root_path": metrics["root_abs"],
            "tree_file": str(TREE_DIR / f"{config.model_id}.txt"),
        },
    }
    override = RUNTIME_OVERRIDES.get(config.model_id, {})
    if override:
        deep_merge(model, override)
    model["scores"] = remap_scores(model["scores"])
    apply_ui_review(model)
    apply_strict_review(model)
    if not model["auth_review_summary"]:
        model["auth_review_summary"] = default_auth_review_summary(model)
    model["scores"]["total"] = sum(
        model["scores"][key] for key in SCORE_WEIGHTS
    )
    model["score_reason_summary"] = build_score_reason(model)
    return model


def deep_merge(base: dict[str, Any], override: dict[str, Any]) -> None:
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(base.get(key), dict):
            deep_merge(base[key], value)
        else:
            base[key] = value


def render_report(models: list[dict[str, Any]]) -> str:
    model_rows = json.dumps(models, ensure_ascii=False)
    weights = json.dumps(SCORE_WEIGHTS, ensure_ascii=False)
    slots = json.dumps([{"key": key, "label": label} for key, label in SLOT_DEFS], ensure_ascii=False)
    version = int(time.time())
    return f"""<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bilibili One-Shot 横测报告</title>
    <link rel="stylesheet" href="assets/styles.css?v={version}" />
  </head>
  <body>
    <div id="app"></div>
    <script>
      window.__BENCHMARK_MODELS__ = {model_rows};
      window.__BENCHMARK_WEIGHTS__ = {weights};
      window.__BENCHMARK_SLOTS__ = {slots};
    </script>
    <script src="assets/app.js?v={version}"></script>
  </body>
</html>
"""


def write_assets() -> None:
    styles = r"""
:root {
  --bg: #f4f6fb;
  --panel: rgba(255, 255, 255, 0.88);
  --panel-strong: #ffffff;
  --ink: #172033;
  --muted: #5f6f86;
  --line: rgba(23, 32, 51, 0.1);
  --accent: #fb7299;
  --accent-deep: #d64b79;
  --cyan: #14b8d4;
  --good: #0f9d58;
  --warn: #f59e0b;
  --bad: #e11d48;
  --shadow: 0 24px 80px rgba(16, 30, 55, 0.12);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(251, 114, 153, 0.2), transparent 30%),
    radial-gradient(circle at 85% 10%, rgba(20, 184, 212, 0.18), transparent 24%),
    linear-gradient(180deg, #fdfcff 0%, #f6f8fc 45%, #edf2f8 100%);
  color: var(--ink);
  overflow-x: hidden;
}

a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }

.page-shell {
  width: min(1580px, calc(100vw - 24px));
  margin: 0 auto;
  padding: 16px 0 72px;
  display: grid;
  grid-template-columns: minmax(236px, 272px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.sidebar-panel {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: 18px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.8)),
    linear-gradient(180deg, rgba(251,114,153,0.08), rgba(72,199,223,0.05));
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: var(--shadow);
}

.sidebar-panel::-webkit-scrollbar { width: 8px; }
.sidebar-panel::-webkit-scrollbar-thumb {
  background: rgba(23,32,51,0.14);
  border-radius: 999px;
}

.sidebar-block + .sidebar-block {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(23, 32, 51, 0.08);
}

.sidebar-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--accent-deep);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.sidebar-title {
  margin: 12px 0 8px;
  font-size: 28px;
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.sidebar-copy {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
  font-size: 13px;
}

.sidebar-label {
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sidebar-list,
.sidebar-model-list {
  display: grid;
  gap: 8px;
}

.sidebar-link {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255,255,255,0.68);
  border: 1px solid rgba(23,32,51,0.08);
  color: var(--muted);
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
}

.sidebar-link:hover,
.sidebar-link.is-active {
  transform: translateX(2px);
  color: var(--ink);
  border-color: rgba(251,114,153,0.28);
  background: rgba(255,255,255,0.96);
}

.sidebar-link strong {
  font-size: 14px;
  color: inherit;
}

.sidebar-link span {
  font-size: 12px;
  line-height: 1.55;
}

.sidebar-model {
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
}

.sidebar-model-copy {
  min-width: 0;
}

.sidebar-rank {
  font-size: 12px;
  font-weight: 700;
  color: rgba(23, 32, 51, 0.46);
}

.sidebar-score {
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(251,114,153,0.1);
  color: var(--accent-deep);
  font-size: 12px;
  font-weight: 700;
}

.content-column {
  min-width: 0;
}

.shell {
  display: grid;
  gap: 34px;
  min-width: 0;
}

.shell > *,
.section,
.panel,
.table-wrap,
.feature-grid,
.tree-grid,
.model-detail-grid {
  min-width: 0;
}

.hero {
  padding: 22px 0 0;
}

.hero-panel {
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78));
  border: 1px solid rgba(255,255,255,0.86);
  border-radius: 34px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.hero-inner {
  padding: 26px 28px 28px;
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 22px;
  align-items: start;
}

.hero-title {
  margin: 0 0 6px;
  font-size: clamp(32px, 4vw, 58px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-weight: 800;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: var(--accent-deep);
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.hero-summary {
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
  max-width: 820px;
}

.hero-side {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
}

.hero-chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(23, 32, 51, 0.08);
  font-size: 13px;
  color: var(--muted);
  box-shadow: 0 8px 20px rgba(16, 30, 55, 0.06);
}

.hero-chip strong { color: var(--ink); }

.hero-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 28px 28px;
}

.hero-nav a {
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(23, 32, 51, 0.08);
  color: var(--muted);
  white-space: nowrap;
}

.hero-nav a:hover { color: var(--ink); border-color: rgba(251, 114, 153, 0.36); }

.section {
  scroll-margin-top: 18px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
  margin-bottom: 18px;
}

.section-title h2 {
  margin: 0;
  font-size: clamp(26px, 3vw, 40px);
  line-height: 1;
  letter-spacing: -0.04em;
}

.section-title p {
  margin: 0;
  color: var(--muted);
  max-width: 720px;
  line-height: 1.7;
  font-size: 15px;
}

.panel {
  background: var(--panel);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  box-shadow: var(--shadow);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82));
  border-radius: 22px;
  border: 1px solid rgba(23, 32, 51, 0.08);
}

.stat-label {
  color: var(--muted);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-value {
  margin-top: 12px;
  font-size: clamp(28px, 3vw, 44px);
  font-weight: 800;
  line-height: 1;
}

.stat-meta {
  margin-top: 10px;
  font-size: 14px;
  color: var(--muted);
}

.table-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 0;
}

thead th {
  text-align: left;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 18px 16px;
  border-bottom: 1px solid var(--line);
}

tbody td {
  padding: 18px 16px;
  border-bottom: 1px solid rgba(23, 32, 51, 0.08);
  vertical-align: top;
  overflow-wrap: anywhere;
  word-break: break-word;
}

thead th:nth-child(1),
tbody td:nth-child(1) { width: 92px; }

thead th:nth-child(2),
tbody td:nth-child(2) { width: 250px; }

thead th:nth-child(3),
tbody td:nth-child(3) { width: 148px; }

thead th:nth-child(4),
tbody td:nth-child(4) { width: 330px; }

thead th:nth-child(5),
tbody td:nth-child(5) { width: 110px; }

thead th:nth-child(6),
tbody td:nth-child(6) { width: auto; }

tbody tr:hover td { background: rgba(255,255,255,0.55); }

.rank {
  font-size: 28px;
  font-weight: 800;
  color: rgba(23, 32, 51, 0.3);
}

.model-name {
  font-size: 18px;
  font-weight: 700;
}

.meta-stack {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini-chip,
.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgba(23, 32, 51, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.tag.good { color: var(--good); border-color: rgba(15, 157, 88, 0.22); }
.tag.warn { color: var(--warn); border-color: rgba(245, 158, 11, 0.24); }
.tag.bad { color: var(--bad); border-color: rgba(225, 29, 72, 0.24); }
.tag.pink { color: var(--accent-deep); border-color: rgba(251, 114, 153, 0.28); }

.score-box {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
}

.score-total {
  font-size: 32px;
  line-height: 1;
  font-weight: 800;
}

.score-breakdown {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}

.startup-copy,
.reason-copy {
  display: grid;
  gap: 8px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.72;
}

.reason-line {
  display: block;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(255,255,255,0.52);
  border: 1px solid rgba(23, 32, 51, 0.06);
}

.feature-grid {
  display: grid;
  gap: 14px;
}

.feature-card {
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.84));
  border: 1px solid rgba(23, 32, 51, 0.08);
}

.feature-card h3,
.model-detail h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.feature-card p,
.model-detail p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.gallery-switcher {
  display: grid;
  gap: 18px;
}

.gallery-head {
  display: grid;
  gap: 14px;
}

.gallery-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.gallery-tab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(23, 32, 51, 0.08);
  background: rgba(255,255,255,0.66);
  color: var(--muted);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
}

.gallery-tab:hover,
.gallery-tab.is-active {
  color: var(--ink);
  background: rgba(255,255,255,0.96);
  border-color: rgba(251,114,153,0.28);
  transform: translateY(-1px);
}

.gallery-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.gallery-density-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 16px;
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(23, 32, 51, 0.08);
}

.gallery-density-label {
  padding: 0 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--muted);
  text-transform: uppercase;
}

.gallery-density-button {
  border: none;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, transform 180ms ease;
}

.gallery-density-button:hover,
.gallery-density-button.is-active {
  background: rgba(251,114,153,0.12);
  color: var(--ink);
  transform: translateY(-1px);
}

.gallery-meta-note {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
}

.gallery-slot-panel {
  display: none;
}

.gallery-slot-panel.is-active {
  display: block;
}

.gallery-slot-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}

.gallery-switcher[data-density="detail"] .gallery-slot-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.gallery-card {
  padding: 12px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.82));
  border: 1px solid rgba(23, 32, 51, 0.08);
  box-shadow: 0 12px 28px rgba(20, 34, 56, 0.06);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.gallery-card:hover {
  transform: translateY(-2px);
  border-color: rgba(251,114,153,0.16);
  box-shadow: 0 18px 32px rgba(20, 34, 56, 0.09);
}

.gallery-card-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: start;
  margin-bottom: 10px;
}

.gallery-card-head .model-name {
  font-size: 16px;
  line-height: 1.25;
}

.gallery-card-meta {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
}

.gallery-card-head .subtle-chip {
  flex-shrink: 0;
}

.gallery-thumb {
  display: block;
  border-radius: 18px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(244,247,251,0.95), rgba(236,241,248,0.95));
  border: 1px solid rgba(23, 32, 51, 0.08);
}

.gallery-thumb img {
  width: 100%;
  height: 170px;
  object-fit: contain;
  object-position: center top;
  background: #f4f7fb;
}

.gallery-switcher[data-density="detail"] .gallery-thumb img {
  height: 220px;
}

.gallery-card-copy {
  margin-top: 10px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
}

.gallery-card-copy strong {
  display: block;
  margin-bottom: 4px;
  color: var(--ink);
  font-size: 14px;
}

.gallery-evidence {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gallery-switcher[data-density="detail"] .gallery-evidence {
  -webkit-line-clamp: 4;
}

.tree-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.tree-card {
  padding: 20px 22px;
}

.arch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.arch-section {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.68);
  border: 1px solid rgba(23, 32, 51, 0.08);
}

.arch-section strong {
  display: block;
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.arch-section p {
  margin: 0;
  color: var(--muted);
  line-height: 1.72;
  font-size: 14px;
}

.tree-card pre {
  margin: 14px 0 0;
  padding: 16px;
  border-radius: 16px;
  background: #0f1728;
  color: #dce7ff;
  overflow: auto;
  font-size: 13px;
  line-height: 1.6;
}

.model-detail-grid {
  display: grid;
  gap: 20px;
}

.model-detail {
  padding: 22px 24px;
}

.detail-columns {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 18px;
}

.detail-list {
  display: grid;
  gap: 10px;
}

.detail-item {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(23, 32, 51, 0.08);
  background: rgba(255,255,255,0.72);
}

.detail-item strong {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.score-bars {
  display: grid;
  gap: 10px;
}

.score-bar {
  display: grid;
  gap: 6px;
}

.score-bar-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.track {
  height: 10px;
  border-radius: 999px;
  background: rgba(23, 32, 51, 0.08);
  overflow: hidden;
}

.track > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--cyan));
}

.method-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.method-card {
  padding: 22px 24px;
}

.method-card ul {
  margin: 14px 0 0;
  padding-left: 18px;
  color: var(--muted);
  line-height: 1.8;
}

.footer-note {
  margin-top: 28px;
  color: var(--muted);
  font-size: 13px;
  text-align: center;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(12, 18, 32, 0.82);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}

.modal.open { display: flex; }

.modal img {
  max-width: min(96vw, 1440px);
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 30px 90px rgba(0,0,0,0.4);
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subtle-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--muted);
  background: rgba(255,255,255,0.64);
  border: 1px solid rgba(23,32,51,0.08);
}

@media (max-width: 1180px) {
  .page-shell,
  .hero-inner,
  .detail-columns,
  .method-grid,
  .tree-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-shell {
    width: min(100vw - 24px, 1680px);
  }

  .sidebar-panel {
    position: relative;
    top: auto;
    max-height: none;
  }

  table {
    table-layout: auto;
    min-width: 1180px;
  }

  .gallery-slot-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .gallery-switcher[data-density="detail"] .gallery-slot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .hero-inner,
  .hero-nav {
    padding-left: 18px;
    padding-right: 18px;
  }

  .hero-nav a { padding: 10px 12px; border-radius: 14px; }
  .panel { border-radius: 22px; }
  .tree-card pre { font-size: 12px; }
  .arch-grid { grid-template-columns: 1fr; }
  .page-shell { width: min(100vw - 16px, 1580px); }
  .gallery-slot-grid { grid-template-columns: 1fr; }
  .gallery-switcher[data-density="detail"] .gallery-slot-grid { grid-template-columns: 1fr; }
  .gallery-thumb img { height: 210px; }
  .gallery-switcher[data-density="detail"] .gallery-thumb img { height: 240px; }
  .gallery-controls { align-items: flex-start; }
}
"""

    app_js = r"""
const models = [...window.__BENCHMARK_MODELS__].sort((a, b) => b.scores.total - a.scores.total);
const weights = window.__BENCHMARK_WEIGHTS__;
const slots = window.__BENCHMARK_SLOTS__;
const app = document.getElementById("app");

const totals = {
  total: models.length,
  success: models.filter((model) => model.oneshot_status === "成功").length,
  partial: models.filter((model) => model.oneshot_status === "部分成功").length,
  failed: models.filter((model) => model.oneshot_status === "失败").length,
  offPrompt: models.filter((model) => model.tags.includes("偏题实现")).length,
};

const topModel = models[0];
const bottomModel = models[models.length - 1];
const strongestUi = [...models].sort((a, b) => b.scores.ui_quality - a.scores.ui_quality)[0];
const strongestBackend = [...models].sort((a, b) => b.scores.backend_quality - a.scores.backend_quality)[0];
const strongestArchitecture = [...models].sort((a, b) => b.scores.architecture_quality - a.scores.architecture_quality)[0];
const slotSummaryKey = {
  slot_a_home: "home",
  slot_b_video: "video",
  slot_c_comment_danmaku: "comment_danmaku",
  slot_d_login: "login",
  slot_e_favorites: "favorites",
  slot_f_architecture: "architecture",
};
const featureLabels = {
  playback: "播放与官网跳转",
  video_info: "视频信息展示",
  comments: "评论查看",
  danmaku: "弹幕查看",
  login: "登录流程",
  post_login_actions: "登录后互动",
  favorites: "收藏/个人中心",
};

function tagClass(tag) {
  if (tag.includes("成功")) return "good";
  if (tag.includes("部分")) return "warn";
  if (tag.includes("失败") || tag.includes("残缺")) return "bad";
  return "pink";
}

function formatList(values, fallback = "无") {
  return values && values.length ? values.join("、") : fallback;
}

function renderSentenceBlocks(text) {
  const safeText = (text || "").trim();
  if (!safeText) return "";
  const chunks = safeText
    .split(/(?<=[。！？；])/)
    .map((item) => item.trim())
    .filter(Boolean);
  return chunks.map((item) => `<span class="reason-line">${item}</span>`).join("");
}

function renderSidebar() {
  const sections = [
    ["overview", "总榜", "综合排名与高低分样本"],
    ["feature-compare", "功能对比", "按播放/评论/登录横向对照"],
    ["gallery", "截图对比", "6 个统一截图槽位并排看"],
    ["architecture", "架构对比", "目录、分层、文档和冗余文件"],
    ["model-details", "模型详细页", "逐个模型的完整评价卡"],
    ["methodology", "方法论", "评分权重与实测规则"],
  ];
  return `
    <aside class="sidebar-panel">
      <div class="sidebar-block">
        <div class="sidebar-kicker">Report Navigation</div>
        <h2 class="sidebar-title">讲解目录</h2>
        <p class="sidebar-copy">左侧目录固定，右侧自由滚动。章节入口和模型详情锚点分开列出，适合录屏时直接按顺序讲。</p>
      </div>
      <div class="sidebar-block">
        <div class="sidebar-label">页面章节</div>
        <div class="sidebar-list">
          ${sections.map(([id, title, summary]) => `
            <a class="sidebar-link" href="#${id}" data-nav-link>
              <strong>${title}</strong>
              <span>${summary}</span>
            </a>
          `).join("")}
        </div>
      </div>
      <div class="sidebar-block">
        <div class="sidebar-label">模型锚点</div>
        <div class="sidebar-model-list">
          ${models.map((model, index) => `
            <a class="sidebar-link sidebar-model" href="#${model.model_id}" data-nav-link>
              <div class="sidebar-model-copy">
                <div class="sidebar-rank">#${index + 1}</div>
                <strong>${model.display_name}</strong>
                <span>${model.sample_type_label} · ${model.oneshot_status}</span>
              </div>
              <span class="sidebar-score">${model.scores.total}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </aside>
  `;
}

function renderHero() {
  return `
    <section class="hero">
      <div class="hero-panel">
        <div class="hero-inner">
          <div>
            <div class="hero-kicker">Bilibili One-Shot Benchmark</div>
            <h1 class="hero-title">大模型一轮直出<br/>B站平台横测报告</h1>
            <p class="hero-summary">报告只基于当前仓库和真实运行结果打分，不给“看起来像完整项目”额外加分。每个模型都保留同一套截图槽位，做成页的展示实拍，做不成的展示明确失败态或证据态卡片，方便横向讲解时逐项对照。</p>
          </div>
          <div class="hero-side">
            <div class="hero-chip"><strong>${totals.total}</strong> 个模型样本</div>
            <div class="hero-chip"><strong>${totals.success}</strong> 个 oneshot 成功</div>
            <div class="hero-chip"><strong>${totals.partial}</strong> 个部分成功</div>
            <div class="hero-chip"><strong>${totals.failed}</strong> 个失败</div>
            <div class="hero-chip"><strong>${totals.offPrompt}</strong> 个偏题样本</div>
          </div>
        </div>
        <nav class="hero-nav">
          <a href="#overview">总榜</a>
          <a href="#feature-compare">功能对比</a>
          <a href="#gallery">截图对比</a>
          <a href="#architecture">架构对比</a>
          <a href="#model-details">模型详细页</a>
          <a href="#methodology">方法论</a>
        </nav>
      </div>
    </section>
  `;
}

function renderStats() {
  return `
    <section class="section" id="overview">
      <div class="section-title">
        <div>
          <h2>总览</h2>
          <p>本版总榜改成“后端代码严审 40 分 + UI 人工复核 30 分 + 其余 30 分”。其中架构分单列，不再藏在维护性里；后端分也按代码细节重判，不再因为“功能勉强有了”就给相近分数。</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card panel">
          <div class="stat-label">综合第一</div>
          <div class="stat-value">${topModel.display_name}</div>
          <div class="stat-meta">${topModel.scores.total} 分 · ${topModel.oneshot_status}</div>
        </div>
        <div class="stat-card panel">
          <div class="stat-label">UI 最佳</div>
          <div class="stat-value">${strongestUi.display_name}</div>
          <div class="stat-meta">UI/交互 ${strongestUi.scores.ui_quality} / ${weights.ui_quality}</div>
        </div>
        <div class="stat-card panel">
          <div class="stat-label">后端最佳</div>
          <div class="stat-value">${strongestBackend.display_name}</div>
          <div class="stat-meta">后端 ${strongestBackend.scores.backend_quality} / ${weights.backend_quality}</div>
        </div>
        <div class="stat-card panel">
          <div class="stat-label">架构最佳</div>
          <div class="stat-value">${strongestArchitecture.display_name}</div>
          <div class="stat-meta">架构 ${strongestArchitecture.scores.architecture_quality} / ${weights.architecture_quality}</div>
        </div>
        <div class="stat-card panel">
          <div class="stat-label">低分样本</div>
          <div class="stat-value">${bottomModel.display_name}</div>
          <div class="stat-meta">${bottomModel.scores.total} 分 · ${bottomModel.tags.join(" / ")}</div>
        </div>
      </div>
    </section>
  `;
}

function renderRanking() {
  const rows = models.map((model, index) => {
    const stack = model.tech_stack.map((item) => `<span class="mini-chip">${item}</span>`).join("");
    const tags = model.tags.map((tag) => `<span class="tag ${tagClass(tag)}">${tag}</span>`).join(" ");
    return `
      <tr>
        <td><div class="rank">#${index + 1}</div></td>
        <td>
          <div class="model-name">${model.display_name}</div>
          <div style="margin-top: 8px; color: var(--muted); font-size: 14px;">${model.sample_type_label} · ${model.notes}</div>
          <div class="meta-stack">${stack}</div>
        </td>
        <td>
          <div class="score-box">
            <div class="score-total">${model.scores.total}</div>
            <div class="pill-row">${tags}</div>
          </div>
        </td>
        <td>
          <strong>${model.startup_status.status_label}</strong>
          <div class="startup-copy" style="margin-top: 8px;">${renderSentenceBlocks(model.startup_status.summary)}</div>
        </td>
        <td>
          <div class="score-breakdown">
            <span>后端 ${model.scores.backend_quality}/${weights.backend_quality}</span>
            <span>UI ${model.scores.ui_quality}/${weights.ui_quality}</span>
            <span>架构 ${model.scores.architecture_quality}/${weights.architecture_quality}</span>
            <span>功能 ${model.scores.functionality}/${weights.functionality}</span>
            <span>运行 ${model.scores.runnability}/${weights.runnability}</span>
          </div>
        </td>
        <td><div class="reason-copy">${renderSentenceBlocks(model.score_reason_summary)}</div></td>
      </tr>
    `;
  }).join("");

  return `
    <section class="section">
      <div class="section-title">
        <div>
          <h2>综合总榜</h2>
          <p>当前排序优先放大三件事：后端代码是否稳、UI 是否真有产品感、系统架构是否清楚。关键分项先显示后端、UI 和架构；最后一列保留实测证据，避免只看高权重却看不到实际扣分点。</p>
        </div>
      </div>
      <div class="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>模型</th>
              <th>总分</th>
              <th>启动结论</th>
              <th>关键分项</th>
              <th>实测/扣分依据</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderFeatureCompare() {
  const features = [
    ["playback", "播放与官网跳转"],
    ["video_info", "视频信息展示"],
    ["comments", "评论查看"],
    ["danmaku", "弹幕查看"],
    ["login", "登录流程"],
    ["post_login_actions", "登录后评论/弹幕能力"],
    ["favorites", "收藏/个人中心能力"],
  ];
  const cards = features.map(([key, label]) => {
    const best = models.filter((model) => model.feature_matrix[key].status === "yes").map((model) => model.display_name);
    const partial = models.filter((model) => model.feature_matrix[key].status === "partial").map((model) => model.display_name);
    const missing = models.filter((model) => model.feature_matrix[key].status === "no").map((model) => model.display_name);
    return `
      <article class="feature-card panel">
        <h3>${label}</h3>
        <p><strong>明确具备：</strong>${formatList(best)}</p>
        <p style="margin-top: 10px;"><strong>部分具备：</strong>${formatList(partial)}</p>
        <p style="margin-top: 10px;"><strong>缺失/不可验证：</strong>${formatList(missing)}</p>
      </article>
    `;
  }).join("");

  return `
    <section class="section" id="feature-compare">
      <div class="section-title">
        <div>
          <h2>功能对比</h2>
          <p>这部分适合回答“谁能真实播放，谁只能看详情壳，谁连登录都没有接通”。状态判断直接来自功能矩阵，不额外做主观美化。</p>
        </div>
      </div>
      <div class="feature-grid">${cards}</div>
    </section>
  `;
}

function renderGallery() {
  const panels = slots.map((slot, index) => `
    <div class="gallery-slot-panel ${index === 0 ? "is-active" : ""}" data-gallery-panel="${slot.key}">
      <div class="gallery-slot-grid">
        ${models.map((model) => {
          const summaryKey = slotSummaryKey[slot.key];
          const imagePath = model.screenshot_slots[slot.key];
          const isRealShot = imagePath.endsWith(".png");
          return `
            <article class="gallery-card">
              <div class="gallery-card-head">
                <div>
                  <div class="model-name">${model.display_name}</div>
                  <div class="gallery-card-meta">${model.sample_type_label} · ${model.scores.total} 分</div>
                </div>
                <span class="subtle-chip">${isRealShot ? "真实截图" : "失败/证据态"}</span>
              </div>
              <a class="gallery-thumb" href="${imagePath}" data-fullimg="${imagePath}">
                <img src="${imagePath}" alt="${model.display_name} ${slot.label}" loading="lazy" />
              </a>
              <div class="gallery-card-copy">
                <strong>${slot.label}</strong>
                <p class="gallery-evidence">${model.runtime_summary[summaryKey] || model.runtime_summary.home}</p>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </div>
  `).join("");
  return `
    <section class="section" id="gallery">
      <div class="section-title">
        <div>
          <h2>统一截图对比</h2>
          <p>这里改成“同一功能位看全部模型”的对比板，不再把 6 列截图硬塞进一张超宽矩阵。默认用概览密度先看全局，想看细节再切到清晰模式或点开原图。</p>
        </div>
      </div>
      <div class="panel" style="padding: 18px;">
        <div class="gallery-switcher" data-density="compact">
          <div class="gallery-head">
            <div class="gallery-toolbar">
              ${slots.map((slot, index) => `<button class="gallery-tab ${index === 0 ? "is-active" : ""}" type="button" data-gallery-tab="${slot.key}">${slot.label}</button>`).join("")}
            </div>
            <div class="gallery-controls">
              <div class="gallery-meta-note">默认每屏展示更多模型卡片，适合口播横向比较；点击图片可看原图，完整长评保留在“模型详情页”。</div>
              <div class="gallery-density-group" aria-label="截图密度切换">
                <span class="gallery-density-label">视图</span>
                <button class="gallery-density-button is-active" type="button" data-gallery-density="compact">概览</button>
                <button class="gallery-density-button" type="button" data-gallery-density="detail">清晰</button>
              </div>
            </div>
          </div>
          ${panels}
        </div>
      </div>
    </section>
  `;
}

function renderArchitecture() {
  const cards = models.map((model) => {
    const docs = model.static_metrics.docs_files && model.static_metrics.docs_files.length
      ? model.static_metrics.docs_files.map((file) => `<span class="subtle-chip">${file}</span>`).join("")
      : '<span class="subtle-chip">无成体系文档</span>';
    const tops = model.static_metrics.top_level_entries && model.static_metrics.top_level_entries.length
      ? model.static_metrics.top_level_entries.map((entry) => `<span class="subtle-chip">${entry}</span>`).join("")
      : '<span class="subtle-chip">无有效顶层目录</span>';
    const launch = model.launch && model.launch.length
      ? model.launch.map((item) => `${item.cwd} · ${item.cmd}`).join("<br/>")
      : "无可执行入口";
    return `
      <article class="tree-card panel">
        <div class="model-name">${model.display_name}</div>
        <div style="margin-top: 10px; color: var(--muted); font-size: 14px;">${model.sample_type_label} · 文件 ${model.static_metrics.file_count} · 文档 ${model.static_metrics.docs_count} · 调试/清单 ${model.static_metrics.debug_like_count}</div>
        <div style="margin-top: 8px; color: var(--muted); font-size: 14px;">架构 ${model.scores.architecture_quality}/${weights.architecture_quality} · 后端 ${model.scores.backend_quality}/${weights.backend_quality} · 前端工程 ${model.scores.frontend_quality}/${weights.frontend_quality}</div>
        <div class="pill-row" style="margin-top: 12px;">
          ${model.tech_stack.map((item) => `<span class="mini-chip">${item}</span>`).join("")}
        </div>
        <div class="pill-row" style="margin-top: 10px;">${tops}</div>
        <div class="arch-grid">
          <div class="arch-section"><strong>架构判断 · ${model.scores.architecture_quality}/${weights.architecture_quality}</strong><p>${model.architecture_review_summary}</p></div>
          <div class="arch-section"><strong>前端 · ${model.scores.frontend_quality}/${weights.frontend_quality}</strong><p>${model.frontend_quality_summary}</p></div>
          <div class="arch-section"><strong>后端 · ${model.scores.backend_quality}/${weights.backend_quality}</strong><p>${model.backend_quality_summary}</p></div>
          <div class="arch-section"><strong>可维护性</strong><p>${model.maintainability_summary}</p></div>
          <div class="arch-section"><strong>文档与仓库卫生</strong><p>${model.docs_quality_summary} ${model.waste_summary}</p></div>
          <div class="arch-section"><strong>主要入口</strong><p>${launch}</p></div>
        </div>
        <div class="pill-row" style="margin-top: 14px;">${docs}</div>
        <pre>${model.tree_summary.preview.join("\n")}</pre>
      </article>
    `;
  }).join("");
  return `
    <section class="section" id="architecture">
      <div class="section-title">
        <div>
          <h2>目录结构与架构对比</h2>
          <p>这里不只看树状图，而是逐个说明它到底是模板站、前后端分离、前端壳、桌面偏题还是残缺样本；前端、后端、文档和仓库卫生也一起展开，避免只凭文件多寡做判断。</p>
        </div>
      </div>
      <div class="tree-grid">${cards}</div>
    </section>
  `;
}

function renderScoreBars(model) {
  const labels = [
    ["backend_quality", "后端工程质量"],
    ["ui_quality", "UI 还原与交互"],
    ["architecture_quality", "架构设计"],
    ["functionality", "功能完成度"],
    ["runnability", "可运行性"],
    ["instruction_following", "指令遵循度"],
    ["frontend_quality", "前端工程质量"],
    ["docs_quality", "文档/注释"],
    ["waste_control", "垃圾代码控制"],
  ];
  return `
    <div class="score-bars">
      ${labels.map(([key, label]) => `
        <div class="score-bar">
          <div class="score-bar-head"><span>${label}</span><strong>${model.scores[key]} / ${weights[key]}</strong></div>
          <div class="track"><span style="width:${(model.scores[key] / weights[key]) * 100}%"></span></div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderModelDetails() {
  return `
    <section class="section" id="model-details">
      <div class="section-title">
        <div>
          <h2>每模型详细页</h2>
          <p>这里给逐个模型的完整评语。除了前后端、视觉、交互和分项分，还单独补进架构点评、证据备注和目录预览，方便你讲每个模型为什么得这个分。</p>
        </div>
      </div>
      <div class="model-detail-grid">
        ${models.map((model) => `
          <article class="model-detail panel" id="${model.model_id}">
            <div class="section-title" style="margin-bottom: 14px;">
              <div>
                <h2 style="font-size: 32px;">${model.display_name}</h2>
                <p>${model.notes}</p>
              </div>
              <div class="pill-row">
                <span class="tag ${tagClass("oneshot " + model.oneshot_status)}">oneshot ${model.oneshot_status}</span>
                ${model.tags.filter((tag) => !tag.startsWith("oneshot")).map((tag) => `<span class="tag ${tagClass(tag)}">${tag}</span>`).join("")}
              </div>
            </div>
            <div class="detail-columns">
              <div class="detail-list">
                <div class="detail-item"><strong>样本类型</strong>${model.sample_type_label}</div>
                <div class="detail-item"><strong>技术栈</strong>${model.tech_stack.join(" / ") || "未识别"}</div>
                <div class="detail-item"><strong>启动判断</strong>${model.startup_status.status_label}。${model.startup_status.summary}</div>
                <div class="detail-item"><strong>架构点评</strong>${model.architecture_review_summary}</div>
                <div class="detail-item"><strong>指令遵循</strong>${model.instruction_following_summary}</div>
                <div class="detail-item"><strong>登录后能力审计</strong>${model.auth_review_summary}</div>
                <div class="detail-item"><strong>前端评价</strong>${model.frontend_quality_summary}</div>
                <div class="detail-item"><strong>后端评价</strong>${model.backend_quality_summary}</div>
                <div class="detail-item"><strong>后端打分依据</strong>${model.backend_scoring_summary}</div>
                <div class="detail-item"><strong>架构打分依据</strong>${model.architecture_scoring_summary}</div>
                <div class="detail-item"><strong>UI 打分依据</strong>${model.ui_scoring_summary}</div>
                <div class="detail-item"><strong>视觉审查</strong>${model.visual_review_summary}</div>
                <div class="detail-item"><strong>交互与流畅性</strong>${model.interaction_review_summary}</div>
                <div class="detail-item"><strong>维护性</strong>${model.maintainability_summary}</div>
                <div class="detail-item"><strong>文档/注释</strong>${model.docs_quality_summary}</div>
                <div class="detail-item"><strong>垃圾文件</strong>${model.waste_summary}</div>
                ${model.evidence_refs.runtime_note ? `<div class="detail-item"><strong>补充证据</strong>${model.evidence_refs.runtime_note}</div>` : ""}
              </div>
              <div>${renderScoreBars(model)}</div>
            </div>
            <div class="detail-columns" style="margin-top: 18px;">
              <div class="panel" style="padding: 18px;">
                <h3>功能矩阵</h3>
                <div class="detail-list">
                  ${Object.entries(model.feature_matrix).map(([key, item]) => `
                    <div class="detail-item">
                      <strong>${featureLabels[key]}</strong>
                      ${item.summary}
                    </div>
                  `).join("")}
                </div>
              </div>
              <div class="panel" style="padding: 18px;">
                <h3>目录结构预览</h3>
                <pre style="margin: 0; max-height: 420px;">${model.tree_summary.preview.join("\n")}</pre>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMethodology() {
  const weightRows = [
    ["backend_quality", "后端工程质量"],
    ["ui_quality", "UI 还原与交互质量"],
    ["architecture_quality", "架构设计"],
    ["functionality", "功能完成度"],
    ["runnability", "可运行性"],
    ["instruction_following", "指令遵循度"],
    ["frontend_quality", "前端工程质量"],
    ["docs_quality", "代码规范、注释、文档"],
    ["waste_control", "垃圾代码与无效文件控制"],
  ].map(([key, label]) => `<li>${label}：${weights[key]} 分</li>`).join("");
  return `
    <section class="section" id="methodology">
      <div class="section-title">
        <div>
          <h2>方法论与评分标准</h2>
          <p>这一版改成强偏置评分：后端 40 分、UI 30 分、架构 8 分，其余 22 分再分给功能、可运行性、指令遵循和工程卫生。后端和架构都按代码细节逐模型重判，不再沿用自动映射。</p>
        </div>
      </div>
      <div class="method-grid">
        <article class="method-card panel">
          <h3>评分权重</h3>
          <ul>${weightRows}</ul>
        </article>
        <article class="method-card panel">
          <h3>后端复核口径</h3>
          <ul>
            <li>后端实现正确性：12 分，看 API 调用是否真实可用、是否依赖错误接口或私有字段。</li>
            <li>工程分层与边界：10 分，看 route、service、schema、auth、config 是否真正分开。</li>
            <li>状态与认证设计：8 分，看登录态、凭据存储、会话隔离、权限门禁是否合理。</li>
            <li>错误处理与可运维性：6 分，看参数校验、异常映射、配置化、启动稳定性。</li>
            <li>代码卫生：4 分，看硬编码、调试残留、全局状态和脆弱实现细节。</li>
          </ul>
        </article>
        <article class="method-card panel">
          <h3>UI 复核口径</h3>
          <ul>
            <li>美观完成度：10 分，看配色、排版、品牌完整度与整体质感。</li>
            <li>B 站风格与业务适配：8 分，看是否真的像 B 站视频平台，而不是泛视频站或后台面板。</li>
            <li>信息架构与阅读效率：7 分，看首页、详情页、评论区和登录入口是否符合视频产品的阅读路径。</li>
            <li>状态细节与异常表达：5 分，看空态、加载态、失败态、破图与门禁是否处理得像产品而不是 demo。</li>
          </ul>
        </article>
        <article class="method-card panel">
          <h3>架构复核口径</h3>
          <ul>
            <li>看前后端边界是否清楚，而不是把所有职责塞进一个入口文件。</li>
            <li>看外部 B 站能力是否被适配层隔离，而不是让业务代码直接到处调用底层库或手搓请求。</li>
            <li>看登录、评论、弹幕、收藏这些链路是否在系统设计上能闭环，而不是表面有页面、实则无承接层。</li>
          </ul>
        </article>
        <article class="method-card panel">
          <h3>执行原则</h3>
          <ul>
            <li>不修复参赛代码，结论基于当前仓库实际状态。</li>
            <li>本轮已在用户授权下使用真实 B 站凭据做只读验证，包括登录状态、个人资料和收藏读取；仍未做真实发评/发弹幕/收藏等副作用操作。</li>
            <li>所有模型必须拥有统一截图槽位；缺失功能也要用失败态图占位。</li>
            <li>偏题、残缺、前端壳样本统一进总榜，但会明确标注并重罚。</li>
            <li>oneshot 结论仍以真实运行状态为主，不因为权重重排而改写运行事实。</li>
          </ul>
        </article>
      </div>
      <p class="footer-note">报告入口：output/bilibili-benchmark-site/index.html · 证据文件与截图位均位于同目录下，适合本地离线讲解。</p>
    </section>
  `;
}

app.innerHTML = `
  <div class="page-shell">
    ${renderSidebar()}
    <div class="content-column">
      ${renderHero()}
      <main class="shell">
        ${renderStats()}
        ${renderRanking()}
        ${renderFeatureCompare()}
        ${renderGallery()}
        ${renderArchitecture()}
        ${renderModelDetails()}
        ${renderMethodology()}
      </main>
    </div>
  </div>
  <div class="modal" id="modal"><img alt="截图预览" /></div>
`;

const modal = document.getElementById("modal");
const modalImg = modal.querySelector("img");
document.querySelectorAll("[data-fullimg]").forEach((node) => {
  node.addEventListener("click", (event) => {
    event.preventDefault();
    modalImg.src = node.getAttribute("data-fullimg");
    modal.classList.add("open");
  });
});
modal.addEventListener("click", () => modal.classList.remove("open"));

const galleryTabs = [...document.querySelectorAll("[data-gallery-tab]")];
const galleryPanels = [...document.querySelectorAll("[data-gallery-panel]")];
const gallerySwitcher = document.querySelector(".gallery-switcher");
const galleryDensityButtons = [...document.querySelectorAll("[data-gallery-density]")];
galleryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.getAttribute("data-gallery-tab");
    galleryTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    galleryPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.getAttribute("data-gallery-panel") === key);
    });
  });
});

galleryDensityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const density = button.getAttribute("data-gallery-density");
    galleryDensityButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    if (gallerySwitcher) {
      gallerySwitcher.setAttribute("data-density", density);
    }
  });
});

const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const sections = [...new Set(navLinks.map((link) => link.getAttribute("href").slice(1)))]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function refreshActiveNav() {
  let activeId = sections[0] ? sections[0].id : "";
  let bestDistance = Infinity;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const anchorDistance = Math.abs(rect.top - 160);
    if (rect.top <= window.innerHeight * 0.55 && anchorDistance < bestDistance) {
      bestDistance = anchorDistance;
      activeId = section.id;
    }
  });
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });
}

window.addEventListener("scroll", refreshActiveNav, { passive: true });
window.addEventListener("resize", refreshActiveNav);
refreshActiveNav();
"""

    (ASSET_DIR / "styles.css").write_text(styles.strip() + "\n", encoding="utf-8")
    (ASSET_DIR / "app.js").write_text(app_js.strip() + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    models = [make_model_entry(config) for config in MODEL_CONFIGS]
    models.sort(key=lambda item: item["scores"]["total"], reverse=True)
    write_placeholder_images(models)
    write_assets()
    report_html = render_report(models)
    (OUT / "index.html").write_text(report_html, encoding="utf-8")
    (DATA_DIR / "models.json").write_text(json.dumps(models, ensure_ascii=False, indent=2), encoding="utf-8")
    (DATA_DIR / "scores.json").write_text(
        json.dumps(
            [
                {
                    "model_id": model["model_id"],
                    "display_name": model["display_name"],
                    "scores": model["scores"],
                    "tags": model["tags"],
                    "oneshot_status": model["oneshot_status"],
                }
                for model in models
            ],
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    (DATA_DIR / "features.json").write_text(
        json.dumps(
            [
                {
                    "model_id": model["model_id"],
                    "display_name": model["display_name"],
                    "feature_matrix": model["feature_matrix"],
                }
                for model in models
            ],
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Generated report site at {OUT}")


if __name__ == "__main__":
    main()
