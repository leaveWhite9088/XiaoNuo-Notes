import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
import os

# 确保输出目录存在
os.makedirs('data/output/charts', exist_ok=True)

# 探测系统可用中文字体
def find_chinese_font():
    fonts = [f.name for f in fm.fontManager.ttflist]
    chinese_fonts = ['SimHei', 'Microsoft YaHei', 'SimSun', 'STHeiti', 'WenQuanYi Micro Hei', 'Noto Sans CJK SC', 'Source Han Sans SC', 'PingFang SC', 'Heiti SC']
    for font in chinese_fonts:
        if font in fonts:
            return font
    # 尝试其他可能的字体
    for f in fm.fontManager.ttflist:
        if 'CJK' in f.name or 'Chinese' in f.name or 'Hei' in f.name or 'Song' in f.name:
            return f.name
    return None

chinese_font = find_chinese_font()
print(f"检测到的中文字体: {chinese_font}")

# 设置matplotlib参数
plt.rcParams['font.sans-serif'] = [chinese_font] if chinese_font else ['Arial']
plt.rcParams['axes.unicode_minus'] = False
if chinese_font:
    plt.rcParams['font.family'] = chinese_font

# 读取合并后的数据
df = pd.read_csv('data/output/consolidated_finance.csv')

# 机构名称映射
branch_names = {'Alpha': 'Alpha', 'Bravo': 'Bravo', 'Charlie': 'Charlie'}
colors = {'Alpha': '#2E86AB', 'Bravo': '#A23B72', 'Charlie': '#F18F01'}
markers = {'Alpha': 'o', 'Bravo': 's', 'Charlie': '^'}

# ========== 图1: 年度收入趋势图 ==========
annual_revenue = df.groupby(['年份', '来源机构'])['收入'].sum().reset_index()
annual_revenue_pivot = annual_revenue.pivot(index='年份', columns='来源机构', values='收入')

fig, ax = plt.subplots(figsize=(12, 7))
for branch in ['Alpha', 'Bravo', 'Charlie']:
    if branch in annual_revenue_pivot.columns:
        values = annual_revenue_pivot[branch] / 1e8  # 转换为亿元
        ax.plot(annual_revenue_pivot.index, values, marker=markers[branch],
                color=colors[branch], linewidth=2.5, markersize=10, label=branch)
        # 标注数值
        for x, y in zip(annual_revenue_pivot.index, values):
            ax.annotate(f'{y:.1f}', (x, y), textcoords="offset points",
                       xytext=(0, 10), ha='center', fontsize=9)

ax.set_xlabel('年份', fontsize=12)
ax.set_ylabel('收入（亿元）', fontsize=12)
ax.set_title('2020-2024年度收入趋势图', fontsize=16, fontweight='bold')
ax.legend(loc='upper left', fontsize=11)
ax.grid(True, alpha=0.3)
ax.set_xticks(annual_revenue_pivot.index)
plt.tight_layout()
plt.savefig('data/output/charts/revenue_trend.png', dpi=150, bbox_inches='tight')
plt.close()
print("✓ 年度收入趋势图已生成")

# ========== 图2: 产品线利润率对比图 ==========
profit_margin = df.groupby(['产品线', '来源机构'])['利润率'].mean().reset_index()
pivot_margin = profit_margin.pivot(index='产品线', columns='来源机构', values='利润率')

# 五大产品线
products = ['Wealth', 'Credit', 'Insurance', 'Investment', 'Lending']
x = np.arange(len(products))
width = 0.25

fig, ax = plt.subplots(figsize=(14, 7))
for i, branch in enumerate(['Alpha', 'Bravo', 'Charlie']):
    if branch in pivot_margin.columns:
        values = [pivot_margin.loc[p, branch] * 100 if p in pivot_margin.index else 0 for p in products]
        bars = ax.bar(x + i * width, values, width, label=branch, color=colors[branch])

# 全集团平均利润率基准线
overall_avg = df['利润率'].mean() * 100
ax.axhline(y=overall_avg, color='red', linestyle='--', linewidth=2, label=f'集团平均: {overall_avg:.1f}%')

ax.set_xlabel('产品线', fontsize=12)
ax.set_ylabel('平均利润率（%）', fontsize=12)
ax.set_title('五大产品线利润率对比', fontsize=16, fontweight='bold')
ax.set_xticks(x + width)
ax.set_xticklabels(products, fontsize=11)
ax.legend(loc='upper right', fontsize=11)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('data/output/charts/profit_margin_by_product.png', dpi=150, bbox_inches='tight')
plt.close()
print("✓ 产品线利润率对比图已生成")

# ========== 图3: 客户规模增长图（堆叠面积图）==========
monthly_customers = df.groupby(['年份', '月份', '来源机构'])['客户总量'].sum().reset_index()
monthly_customers['年月'] = pd.to_datetime(monthly_customers['年份'].astype(str) + '-' + monthly_customers['月份'].astype(str) + '-01')
monthly_customers = monthly_customers.sort_values('年月')

# 创建透视表
pivot_customers = monthly_customers.pivot(index='年月', columns='来源机构', values='客户总量').fillna(0)

fig, ax = plt.subplots(figsize=(14, 7))
ax.stackplot(pivot_customers.index,
             [pivot_customers[col] for col in ['Alpha', 'Bravo', 'Charlie'] if col in pivot_customers.columns],
             labels=['Alpha', 'Bravo', 'Charlie'],
             colors=[colors['Alpha'], colors['Bravo'], colors['Charlie']],
             alpha=0.8)

# 标注集团客户总量峰值
total_customers = pivot_customers.sum(axis=1)
peak_date = total_customers.idxmax()
peak_value = total_customers.max()
ax.annotate(f'峰值: {peak_date.strftime("%Y-%m")}\n{peak_value:,.0f}人',
            xy=(peak_date, peak_value), xytext=(peak_date, peak_value * 1.1),
            fontsize=11, ha='center', arrowprops=dict(arrowstyle='->', color='red'))

ax.set_xlabel('时间', fontsize=12)
ax.set_ylabel('客户总量', fontsize=12)
ax.set_title('2020-2024客户规模增长图', fontsize=16, fontweight='bold')
ax.legend(loc='upper left', fontsize=11)
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('data/output/charts/customer_growth.png', dpi=150, bbox_inches='tight')
plt.close()
print("✓ 客户规模增长图已生成")

# ========== 图4: 分支机构综合业绩对比图（多维分组柱状图）==========
# 计算五个维度
branch_metrics = df.groupby('来源机构').agg({
    '收入': 'sum',
    '利润': 'sum',
    '利润率': 'mean',
    '新增客户': lambda x: (x.sum() / 5),  # 年均新增
    '流失率': 'mean'
}).reset_index()

# 客户增长率 = (期末-期初)/期初 / 年数
def calc_growth_rate(group):
    first = group[group['年份'] == 2020].iloc[0]['客户总量'] if len(group[group['年份'] == 2020]) > 0 else 0
    last = group[group['年份'] == 2024].iloc[0]['客户总量'] if len(group[group['年份'] == 2024]) > 0 else 0
    if first > 0:
        return ((last - first) / first) * 100 / 5  # 年均增长率
    return 0

growth_rates = df.groupby('来源机构').apply(calc_growth_rate).reset_index()
growth_rates.columns = ['来源机构', '客户增长率']
branch_metrics = branch_metrics.merge(growth_rates, on='来源机构')

# 归一化到0-100便于对比
def normalize(values):
    min_val, max_val = values.min(), values.max()
    if max_val - min_val > 0:
        return (values - min_val) / (max_val - min_val) * 100
    return [50] * len(values)

metrics_normalized = pd.DataFrame({
    '来源机构': branch_metrics['来源机构'],
    '总收入': normalize(branch_metrics['收入']),
    '总利润': normalize(branch_metrics['利润']),
    '平均利润率': normalize(branch_metrics['利润率']),
    '客户增长率': normalize(branch_metrics['客户增长率']),
    '平均流失率': normalize(100 - branch_metrics['流失率'] * 100)  # 流失率越低越好
})

# 多维分组柱状图
categories = ['总收入', '总利润', '平均利润率', '客户增长率', '平均流失率']
x = np.arange(len(categories))
width = 0.25

fig, ax = plt.subplots(figsize=(14, 7))
for i, branch in enumerate(['Alpha', 'Bravo', 'Charlie']):
    row = metrics_normalized[metrics_normalized['来源机构'] == branch]
    if len(row) > 0:
        values = row[categories].values[0]
        ax.bar(x + i * width, values, width, label=branch, color=colors[branch])

ax.set_xlabel('评估维度', fontsize=12)
ax.set_ylabel('归一化得分（0-100）', fontsize=12)
ax.set_title('分支机构综合业绩对比', fontsize=16, fontweight='bold')
ax.set_xticks(x + width)
ax.set_xticklabels(categories, fontsize=11)
ax.legend(loc='upper right', fontsize=11)
ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('data/output/charts/branch_comparison.png', dpi=150, bbox_inches='tight')
plt.close()
print("✓ 分支机构综合业绩对比图已生成")

print("\n=== 图表生成完成 ===")
print(f"中文字体方案: {chinese_font if chinese_font else '英文兜底'}")
