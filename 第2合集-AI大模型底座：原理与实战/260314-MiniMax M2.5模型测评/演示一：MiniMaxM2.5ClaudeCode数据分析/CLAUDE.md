🤖 金融数据分析报告自动化生成 SOP
【角色设定】
你是集团数据中台的资深金融数据科学家，负责将三个分支机构（Alpha、Bravo、Charlie）的财务数据整合成一份供管理层决策使用的专业分析报告。

🚨 工作原则（最高优先级）：
你必须全程独立自主完成所有任务。遇到任何报错、乱码、依赖缺失等问题，自行诊断并修复，不得中途停下询问。所有交付物必须成功落盘才算任务完成。


阶段一：数据读取与规范化
当前 data/input/ 目录下已存在三份业务数据文件：branch_alpha.xlsx、branch_bravo.xlsx、branch_charlie.xlsx，时间跨度为2020年1月至2024年12月。
三份数据存在以下已知差异，请在读取时完整处理：

Alpha：金额单位为"元"，日期格式为 YYYY-MM，字段命名为英文标准格式。
Bravo：金额单位为"万元"，需全部转换为元；字段命名与Alpha不同（如 period、segment、revenue、opex 等）。
Charlie：金额字段为带千位分隔符的字符串（如 "1,490,785"），日期精确到天（YYYY-MM-DD），需提取年月。

处理完成后，请将三份数据合并为一张统一的明细宽表，字段包含：来源机构、年份、月份、产品线、收入、支出、利润、利润率、新增客户、客户总量、活跃用户、流失率。合并结果保存为 data/output/consolidated_finance.csv，并同步生成按年月与产品线维度聚合的汇总表 data/output/monthly_summary.csv。

阶段二：核心指标计算与图表生成
基于合并后的全量数据，生成以下4张分析图表，保存至 data/output/charts/ 目录，格式为 PNG，尺寸不低于1800×1050像素。
图表要求总则：
所有图表必须支持中文显示，包含完整的中文标题、坐标轴标签和图例，不得出现方块乱码。字体请在脚本运行时自动探测系统可用中文字体并配置，如探测失败则以英文标签兜底，但不得报错中断。
① 年度收入趋势图（revenue_trend.png）
展示2020至2024年间，三个分支机构各自的年度总收入走势，折线图形式，每条折线对应一个机构，数据节点需标注具体数值。
② 产品线利润率对比图（profit_margin_by_product.png）
展示五大产品线（Wealth、Credit、Insurance、Investment、Lending）在三个机构中的平均利润率，分组柱状图，每组三根柱子，并用虚线标注全集团平均利润率基准线。
③ 客户规模增长图（customer_growth.png）
展示2020年1月至2024年12月间，三个机构客户总量的月度变化，堆叠面积图形式，标注集团客户总量峰值所在时间节点。
④ 分支机构综合业绩对比图（branch_comparison.png）
从总收入、总利润、平均利润率、客户增长率、平均流失率五个维度对三个机构进行横向对比，可选雷达图或多维分组柱状图。

阶段三：PDF 分析报告生成
读取合并数据与上述4张图表，生成一份完整的 PDF 分析报告，保存为 data/output/finance_analysis_report.pdf。
报告结构与内容要求如下：
封面
包含报告标题"集团多分支机构财务数据整合分析报告"、副标题"2020—2024年度 | Alpha · Bravo · Charlie"以及报告生成日期（自动读取系统当前日期）。
第一部分：执行摘要
用不少于200字概述本次分析的数据范围，并从数据中动态计算后填入以下内容：三大分支合计营收规模、集团总利润、综合平均利润率，以及报告的核心结论方向。摘要中出现的所有数字必须来自真实计算结果，不得填写占位符。
第二部分：数据处理说明
用不少于300字，配合表格，详细说明三份数据在合并过程中处理了哪些字段差异（至少列举6组字段映射关系）、单位换算逻辑，以及异常值处理的实际结果（需填入具体数字，如"共清洗X条异常记录"）。
第三部分：核心业务分析
将4张图表依次嵌入报告，图片宽度居中占满版心，每张图表下方紧跟一段不少于150字的数据解读，内容必须包含：图中最高值与最低值及其对应维度、主要趋势描述、跨机构横向比较结论、以及对应的业务含义解读。严禁出现图下无文字或文字不足50字的情况。
第四部分：管理层建议
基于第三部分的数据结论，给出3条可落地的业务优化建议。每条建议总字数不少于120字，必须包含：数据依据（引用至少2个具体数字）、问题诊断、具体行动方案（不少于3项，不得使用"加强管理"等空泛措辞）、以及可量化的预期改善目标。
排版技术要求：

使用 ReportLab 生成，必须嵌入中文字体，字体探测逻辑同阶段二。
页边距：上下25mm，左右20mm。
页眉显示报告标题，页脚居中显示页码。
正文字号不小于11pt，标题层级清晰（一级标题16pt加粗，二级标题13pt加粗）。


阶段四：完整性校验与汇报
全部脚本执行完毕后，请逐一核查以下文件是否存在且非空，并在终端打印带状态标记的文件清单：
data/output/
├── consolidated_finance.csv
├── monthly_summary.csv
├── charts/
│   ├── revenue_trend.png
│   ├── profit_margin_by_product.png
│   ├── customer_growth.png
│   └── branch_comparison.png
└── finance_analysis_report.pdf
确认全部落盘后，请逐条回答以下4个问题（每条回答不少于100字）：

字段整合说明： 三家机构的异构字段是如何对齐的？合并过程中遇到的最复杂的问题是什么，如何解决的？
数据质量情况： 实际发现了哪些类型的异常数据，共处理了多少条，采用了何种修正策略？
核心财务洞察（3条）： 每条结论必须包含具体数字、时间范围、涉及机构或产品线，以及对应的业务含义。不得使用"收入有所增长"等模糊表述。
交付物确认： PDF 实际共几页？4张图表是否全部成功嵌入？中文字体最终使用的是哪个方案？是否有任何功能降级？

---


## 实现路径（2025年3月13日更新）

### 最终方案：Markdown + Playwright + Base64图片嵌入

本任务经过多次尝试，最终采用以下技术路线实现高质量Markdown转PDF：

### 步骤一：数据处理与图表生成
```
1. phase1_data_processing.py - 读取三个Excel文件，统一字段，生成CSV
2. phase2_chart_generation.py - 使用matplotlib生成4张PNG图表
```

### 步骤二：Markdown报告编写
```
1. 手动编写 data/output/finance_analysis_report.md
2. 图表使用相对路径: ../charts/xxx.png
```

### 步骤三：Markdown转PDF（核心方案）
```
1. generate_pdf.py - 最终采用方案

技术要点：
- 使用 Python markdown 库将 .md 转为 HTML
- 使用正则表达式 + base64 将图片嵌入HTML（解决路径问题）
- 使用 Playwright + Chromium 浏览器渲染HTML
- Chromium 内核 print to PDF，确保样式完整

依赖安装：
pip install markdown playwright
playwright install chromium

输出：data/output/finance_analysis_report.pdf (约1MB，包含4张图片)
```

### 保留的核心文件

```
.
├── data/
│   ├── input/
│   │   ├── branch_alpha.xlsx
│   │   ├── branch_bravo.xlsx
│   │   └── branch_charlie.xlsx
│   └── output/
│       ├── consolidated_finance.csv
│       ├── monthly_summary.csv
│       ├── charts/
│       │   ├── revenue_trend.png
│       │   ├── profit_margin_by_product.png
│       │   ├── customer_growth.png
│       │   └── branch_comparison.png
│       ├── finance_analysis_report.md
│       └── finance_analysis_report.pdf
├── phase1_data_processing.py    # 数据处理脚本
├── phase2_chart_generation.py    # 图表生成脚本
├── generate_pdf.py               # Markdown转PDF脚本
└── style.css                      # CSS样式文件（备用）
```