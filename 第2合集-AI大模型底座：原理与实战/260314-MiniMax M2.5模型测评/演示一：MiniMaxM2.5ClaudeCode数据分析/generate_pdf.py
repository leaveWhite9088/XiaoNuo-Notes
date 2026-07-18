import base64
import re
import os
from markdown import markdown
from playwright.sync_api import sync_playwright

# 读取Markdown文件
with open('data/output/finance_analysis_report.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# 读取CSS样式
css_content = """
<style>
    @page {
        size: A4;
        margin: 25mm 20mm;
    }
    body {
        font-family: 'Microsoft YaHei', 'SimHei', 'PingFang SC', sans-serif;
        font-size: 11pt;
        line-height: 1.8;
        color: #333;
        max-width: 100%;
    }
    h1 {
        font-size: 22pt;
        font-weight: bold;
        text-align: center;
        margin-top: 60px;
        margin-bottom: 30px;
        color: #1a1a1a;
    }
    h2 {
        font-size: 16pt;
        font-weight: bold;
        margin-top: 30px;
        margin-bottom: 15px;
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 8px;
    }
    h3 {
        font-size: 13pt;
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 10px;
        color: #34495e;
    }
    p {
        margin-bottom: 12px;
        text-align: justify;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 10pt;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
    }
    th {
        background-color: #3498db;
        color: white;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    img {
        max-width: 100%;
        display: block;
        margin: 20px auto;
    }
    .subtitle {
        font-size: 14pt;
        text-align: center;
        color: #7f8c8d;
        margin-bottom: 40px;
    }
    .date {
        font-size: 11pt;
        text-align: center;
        color: #95a5a6;
        margin-bottom: 60px;
    }
    ul, ol {
        margin-left: 20px;
        margin-bottom: 12px;
    }
    li {
        margin-bottom: 6px;
    }
    .highlight {
        font-weight: bold;
        color: #e74c3c;
    }
    .bold {
        font-weight: bold;
    }
    hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 30px 0;
    }
</style>
"""

# 将图片转换为Base64并嵌入HTML
def convert_images_to_base64(md_content):
    # 匹配图片标记
    img_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'

    def replace_img(match):
        alt_text = match.group(1)
        img_path = match.group(2)

        # 处理相对路径 - Markdown中的路径是 ../charts/xxx.png
        # 从 data/output/ 到 data/output/charts/
        # 实际图片在 data/output/charts/
        if img_path.startswith('../'):
            img_path = img_path[3:]  # 去掉 ../
        elif not os.path.isabs(img_path):
            img_path = img_path

        # 完整路径
        full_path = os.path.join('data/output', img_path)
        print(f"Loading image: {full_path}")

        # 读取图片并转换为Base64
        try:
            with open(full_path, 'rb') as f:
                img_data = f.read()

            # 根据文件扩展名确定MIME类型
            ext = os.path.splitext(full_path)[1].lower()
            if ext == '.png':
                mime_type = 'image/png'
            elif ext == '.jpg' or ext == '.jpeg':
                mime_type = 'image/jpeg'
            elif ext == '.gif':
                mime_type = 'image/gif'
            else:
                mime_type = 'image/png'

            b64_data = base64.b64encode(img_data).decode('utf-8')
            return f'<img src="data:{mime_type};base64,{b64_data}" alt="{alt_text}">'
        except Exception as e:
            print(f"Warning: Cannot load image {full_path}: {e}")
            return match.group(0)

    return re.sub(img_pattern, replace_img, md_content)

# 转换Markdown为HTML
print("正在转换Markdown为HTML...")
md_with_base64 = convert_images_to_base64(md_content)
html_content = markdown(md_with_base64, extensions=['tables', 'fenced_code', 'toc'])

# 组合完整HTML
full_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>集团多分支机构财务数据整合分析报告</title>
    {css_content}
</head>
<body>
{html_content}
</body>
</html>
"""

# 保存HTML用于调试
with open('data/output/finance_analysis_report.html', 'w', encoding='utf-8') as f:
    f.write(full_html)
print("✓ HTML文件已生成")

# 使用Playwright转换为PDF
print("正在生成PDF...")
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_content(full_html, wait_until='networkidle')

    # 生成PDF - 使用path参数而非output
    page.pdf(
        path='data/output/finance_analysis_report.pdf',
        format='A4',
        margin={
            'top': '25mm',
            'bottom': '25mm',
            'left': '20mm',
            'right': '20mm'
        },
        print_background=True,
        display_header_footer=True,
        header_template='<div style="font-size: 10pt; text-align: center; width: 100%; color: #666;">集团多分支机构财务数据整合分析报告</div>',
        footer_template='<div style="font-size: 10pt; text-align: center; width: 100%; color: #999;">第 <span class="pageNumber"></span> 页 / <span class="totalPages"></span> 页</div>'
    )

    browser.close()

print("✓ PDF报告已生成: data/output/finance_analysis_report.pdf")

# 验证文件
pdf_size = os.path.getsize('data/output/finance_analysis_report.pdf')
print(f"PDF文件大小: {pdf_size / 1024:.1f} KB")
