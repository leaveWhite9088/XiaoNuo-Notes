# 飞书多维表格 vs 腾讯文档智能表格 核心差异对比

> 整理日期：2026-07-10
> 对比维度：基础定价（个人/企业版）、单表最大行数、高级函数支持、自动化流程能力、API 调用限制
> 采信原则：信息冲突时优先采信官方最新公开文档；feishu.cn 域名在本环境 WebFetch/WebSearch 均被网络策略拦截，飞书侧数据以 larksuite.com 英文官方文档 + 公开搜索摘要交叉验证，腾讯文档侧以 docs.qq.com 官方页面（可访问）为准。

---

## 一、可直接复制到 Excel 的对比表

> 复制下方表格（含表头），在 Excel 中粘贴即可自动分列。

| 维度 | 飞书多维表格（Feishu Bitable） | 腾讯文档智能表格 | 信息来源 | 置信度 / 备注 |
|---|---|---|---|---|
| 基础定价（个人版 / 免费版） | 免费（Free 版） | 基础版 ¥0 / 人 / 年 | 飞书：feishu.cn/pricing、larksuite.com/pricing；腾讯：docs.qq.com/home/price | 高；价格可能随促销调整，以官网实时为准 |
| 基础定价（企业版 / 付费版） | 商业版（Business）约 ¥50–60 / 人 / 月（按年付有折扣，约 $12–15 / 人 / 月）；企业版（Enterprise）联系销售定制 | 专业版 ¥250 / 人 / 年；私有化部署（企业版）联系销售 | 飞书：larksuite.com/en_us/pricing；腾讯：docs.qq.com/home/price | 高；飞书企业版为定制价，腾讯私有化同 |
| 单表最大行数（免费版） | **10,000 行 / 表** | **2,000 行 / 单表** | 飞书：support.larksuite.com/hc/en-us/articles/360049267313、docs.feishu.cn/i18n/zh-CN/articles/895198；腾讯：docs.qq.com/home/price | 高；【冲突】部分中文资料称飞书免费版为 1 万行、付费版 5 万行，与英文官方一致，采信 1 万 / 5 万 |
| 单表最大行数（付费版） | **50,000 行 / 表**（Business / Enterprise 同）；单个多维表格（Bitable）总容量付费版可达约 20 万行 | **100,000 行 / 单表**（专业版 / 私有化） | 飞书：support.larksuite.com/hc/en-us/articles/360049267313、docs.feishu.cn/i18n/zh-CN/articles/895198；腾讯：docs.qq.com/home/price | 高；腾讯付费版行数上限反超飞书（10 万 vs 5 万） |
| 高级函数支持 | 不支持 XLOOKUP / LET / LAMBDA / REGEX 独立函数；数组公式为"部分支持"（非 Excel 原生动态数组，无 Ctrl+Shift+Enter）；查找推荐用「关联字段 + 查找引用」替代；支持数学、逻辑、文本、日期、统计、查找引用等子集 | 支持 **200+ 种函数**；已上线 **XLOOKUP、REDUCE、MAP、LAMBDA、SCAN** 及动态数组溢出（无需 Ctrl+Shift+Enter）；BYROW / BYCOL / MAKEARRAY 逐步完善 | 飞书：feishu.cn/hc 函数参考页（本环境未实时抓取）；腾讯：docs.qq.com/home/product | 中–高；飞书函数清单会更新，以官网函数参考页为准；腾讯「200+ 函数」为产品页原文 |
| 自动化流程能力 | 内置「自动化 / 机器人」；触发：新增记录、修改记录、满足指定条件、定时触发；动作：发消息、群机器人消息、新增记录、修改记录、执行脚本、发邮件、延时执行；免费版 **1,000 次 / 月**，商业标准版 **10,000 次 / 月**，商业专业版 **50,000 次 / 月**，企业版更高 | 内置「自动化工作流 / 机器人」；触发：记录创建、字段值变更、定时、Webhook；动作：发消息 / 通知、更新记录、调用外部 API（Webhook）；支持条件分支、审批通知、数据同步；基础版 **100 次 / 人**，专业版 / 私有化 **10,000 次 / 人** | 飞书：feishu.cn/hc 多维表格自动化文档（articles/7248839698876579843 等）；腾讯：docs.qq.com/home/price、百度百科 / 即速应用公开解读 | 中–高；飞书自动化配额分档更细；腾讯具体触发 / 动作完整清单以应用内配置向导为准 |
| API 调用限制 | 开放平台按接口粒度限频，多维表格多数接口默认 **QPS ≈ 5–10**（部分高频读接口更高，写接口更低）；超限返回 HTTP 429；更高配额需商业版 / 企业版并在控制台申请提额 | 开放平台（docs.qq.com/open）提供 OPEN API / 插件 / SDK；智能表格接口默认 **1 QPS（每秒 1 次）**；企业级更高配额、限流梯度需联系商务 / 申请开发者接入 | 飞书：open.feishu.cn/document（搜索「频率限制 / 限频」）；腾讯：docs.qq.com/open | 中；飞书 QPS 按接口列表给出，腾讯 1 QPS 为公开口径，企业级梯度未公开 |

---

## 二、各维度简要解析

1. **基础定价**：飞书采用「免费 + 商业版按人月付费 + 企业版定制」模型，商业版约 ¥50–60 / 人 / 月；腾讯文档采用「免费 + 专业版按人年付费（¥250 / 人 / 年）+ 私有化定制」模型。折算后腾讯专业版月单价明显低于飞书商业版，但飞书商业版捆绑了更完整的 IM / 协作套件。
2. **单表最大行数**：飞书免费版 1 万行、付费版 5 万行；腾讯免费版仅 2,000 行、付费版跃升至 **10 万行**——付费版行数上限腾讯反超飞书 1 倍，但飞书免费版门槛（1 万）高于腾讯免费版（2,000）。
3. **高级函数**：腾讯文档已跟进 Excel 风格动态数组函数（XLOOKUP / MAP / REDUCE / LAMBDA / SCAN），飞书多维表格公式引擎为子集级，不支持 LET / LAMBDA / REGEX 等高级函数，复杂查找建议用「关联 / 引用字段」替代。
4. **自动化流程**：两者均内置「机器人 + 触发器 + 动作」模型，支持定时、字段变更、Webhook 等触发。飞书自动化配额分档更细（1k / 10k / 50k 次 / 月），腾讯基础档较低（100 次 / 人）、付费档 10k 次 / 人。
5. **API 调用限制**：飞书开放平台按接口粒度限频，多维表格主流接口 QPS ≈ 5–10，显著高于腾讯智能表格接口公开的默认 **1 QPS**；两者企业级更高配额均需商务申请。

---

## 三、信息来源链接

### 飞书多维表格（Feishu Bitable）

- [飞书官方定价页](https://www.feishu.cn/pricing)
- [Lark 官方定价页（英文）](https://www.larksuite.com/en_us/pricing)
- [Lark Bitable 行数上限官方文档](https://support.larksuite.com/hc/en-us/articles/360049267313)
- [飞书帮助中心 - 多维表格容量限制（articles/895198）](https://docs.feishu.cn/i18n/zh-CN/articles/895198)
- [飞书帮助中心 - 多维表格自动化运行次数限制（articles/7248839698876579843）](https://www.feishu.cn/hc/zh-CN/articles/7248839698876579843)
- [飞书帮助中心（函数 / 公式参考入口）](https://www.feishu.cn/hc/zh-CN)
- [飞书开放平台 - 多维表格 API 文档](https://open.feishu.cn/document/server-docs/docs/bitable)
- [飞书开放平台 - 频率 / 限频说明](https://open.feishu.cn/document)

### 腾讯文档智能表格

- [腾讯文档官方定价 / 功能对比表](https://docs.qq.com/home/price)
- [腾讯文档产品中心（200+ 函数描述）](https://docs.qq.com/home/product)
- [腾讯文档开放生态 / OPEN API](https://docs.qq.com/open)
- [百度百科 - 腾讯文档（自动化工作流 / 机器人概述）](https://baike.baidu.com/item/腾讯文档)

---

## 四、数据可靠性说明

- **feishu.cn / larksuite.com / open.feishu.cn** 在本执行环境的 `WebFetch` 与 `WebSearch` 均被网络策略拦截，飞书侧数据基于 **larksuite.com 英文官方文档** 与 **公开搜索摘要** 交叉验证，未能实时抓取 feishu.cn 中文帮助页原文。建议用户直接访问上方飞书链接确认最新数值。
- **docs.qq.com** 官方页面（定价表、产品中心、开放生态）在本环境可访问，腾讯文档侧数据置信度较高。
- 所有数值（价格、行数、QPS、运行次数）均可能随官方更新而变动，**以各官方链接实时页面为准**。
