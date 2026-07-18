import pandas as pd
import os
import re

# 确保输出目录存在
os.makedirs('data/output', exist_ok=True)
os.makedirs('data/output/charts', exist_ok=True)

# 读取三个Excel文件
alpha = pd.read_excel('data/input/branch_alpha.xlsx')
bravo = pd.read_excel('data/input/branch_bravo.xlsx')
charlie = pd.read_excel('data/input/branch_charlie.xlsx')

# ========== Alpha 处理 ==========
alpha_df = alpha.copy()
alpha_df['来源机构'] = 'Alpha'
alpha_df['年份'] = alpha_df['Month'].str[:4].astype(int)
alpha_df['月份'] = alpha_df['Month'].str[5:7].astype(int)
alpha_df['产品线'] = alpha_df['ProductLine']
alpha_df['收入'] = alpha_df['Revenue_CNY']
alpha_df['支出'] = alpha_df['Expense_CNY']
alpha_df['利润'] = alpha_df['Profit_CNY']
alpha_df['利润率'] = alpha_df['Margin']
alpha_df['新增客户'] = alpha_df['NewClients']
alpha_df['客户总量'] = alpha_df['CustomerCount']
alpha_df['活跃用户'] = alpha_df['ActiveUsers']
alpha_df['流失率'] = alpha_df['ChurnRate']

# ========== Bravo 处理 ==========
bravo_df = bravo.copy()
bravo_df['来源机构'] = 'Bravo'
bravo_df['年份'] = bravo_df['period'].str[:4].astype(int)
bravo_df['月份'] = bravo_df['period'].str[5:7].astype(int)
bravo_df['产品线'] = bravo_df['segment']
# 金额单位为万元，转换为元
bravo_df['收入'] = bravo_df['revenue(万元)'] * 10000
bravo_df['支出'] = bravo_df['opex(万元)'] * 10000
bravo_df['利润'] = bravo_df['profit(万元)'] * 10000
bravo_df['利润率'] = bravo_df['margin']
bravo_df['新增客户'] = bravo_df['new_customers']
bravo_df['客户总量'] = bravo_df['total_customers']
bravo_df['活跃用户'] = bravo_df['active_accounts']
bravo_df['流失率'] = bravo_df['attrition_rate']

# ========== Charlie 处理 ==========
charlie_df = charlie.copy()
charlie_df['来源机构'] = 'Charlie'
# 日期格式为 YYYY-MM-DD，提取年月
charlie_df['年份'] = pd.to_datetime(charlie_df['Date']).dt.year
charlie_df['月份'] = pd.to_datetime(charlie_df['Date']).dt.month
charlie_df['产品线'] = charlie_df['BizUnit']
# 金额为带千位分隔符的字符串，需要清洗并转换为数字
def clean_currency(val):
    if isinstance(val, str):
        return float(val.replace(',', ''))
    return float(val)
charlie_df['收入'] = charlie_df['Sales'].apply(clean_currency)
charlie_df['支出'] = charlie_df['Cost'].apply(clean_currency)
charlie_df['利润'] = charlie_df['Profit'].apply(clean_currency)
charlie_df['利润率'] = charlie_df['ProfitMargin']
charlie_df['新增客户'] = charlie_df['Leads']
charlie_df['客户总量'] = charlie_df['Customers']
charlie_df['活跃用户'] = charlie_df['Active']
charlie_df['流失率'] = charlie_df['Churn']

# ========== 合并数据 ==========
columns = ['来源机构', '年份', '月份', '产品线', '收入', '支出', '利润', '利润率', '新增客户', '客户总量', '活跃用户', '流失率']

alpha_final = alpha_df[columns]
bravo_final = bravo_df[columns]
charlie_final = charlie_df[columns]

# 合并
consolidated = pd.concat([alpha_final, bravo_final, charlie_final], ignore_index=True)

# 保存合并后的明细宽表
consolidated.to_csv('data/output/consolidated_finance.csv', index=False, encoding='utf-8-sig')
print(f"✓ 合并数据已保存: consolidated_finance.csv ({len(consolidated)} 条记录)")

# 生成按年月与产品线维度聚合的汇总表
monthly_summary = consolidated.groupby(['年份', '月份', '产品线']).agg({
    '收入': 'sum',
    '支出': 'sum',
    '利润': 'sum',
    '利润率': 'mean',
    '新增客户': 'sum',
    '客户总量': 'sum',
    '活跃用户': 'sum',
    '流失率': 'mean'
}).reset_index()

monthly_summary.to_csv('data/output/monthly_summary.csv', index=False, encoding='utf-8-sig')
print(f"✓ 月度汇总已保存: monthly_summary.csv ({len(monthly_summary)} 条记录)")

# 输出数据概览
print(f"\n=== 数据概览 ===")
print(f"总记录数: {len(consolidated)}")
print(f"时间范围: {consolidated['年份'].min()}-{consolidated['年份'].max()}")
print(f"产品线: {consolidated['产品线'].unique().tolist()}")
print(f"机构: {consolidated['来源机构'].unique().tolist()}")
