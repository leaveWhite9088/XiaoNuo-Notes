"""
稀疏 Token 遗忘诊断报告
对比任意两个 Qwen2.5-7B 变体的 lm_head / embed_tokens 权重。

用法:
    # 对比 Base vs Instruct
    python scan_degraded_tokens.py

    # 对比 Base vs GPTQ-Int4

    # 自定义模型路径
    python scan_degraded_tokens.py --base ./models/qwen2.5-7b --compare ./models/qwen2.5-7b-instruct
"""
import argparse
import csv
import json
import os
import re
import sys
import torch
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
from safetensors.torch import load_file
from transformers import AutoTokenizer

import matplotlib.font_manager as fm

# 加载中文字体
font_path = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
if os.path.exists(font_path):
    fm.fontManager.addfont(font_path)
    prop = fm.FontProperties(fname=font_path)
    matplotlib.rcParams["font.family"] = prop.get_name()
    matplotlib.rcParams["axes.unicode_minus"] = False
else:
    matplotlib.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "DejaVu Sans"]
    matplotlib.rcParams["axes.unicode_minus"] = False

# ── 预设模型路径 ──
MODEL_PRESETS = {
    "instruct":    "./models/qwen2.5-7b-instruct",
}
DEFAULT_BASE = "./models/qwen2.5-7b"
TOKENIZER_DIR = "./models/tk-qwen2.5-7b"

# ── 可视化配色 ──
HIST_COLOR = "#7294bb"
TARGET_COLOR = "#e74c3c"


# ══════════════════════════════════════════════════════════════
#  1. 数据加载
# ══════════════════════════════════════════════════════════════

def find_shard(model_dir: str, weight_name: str) -> str:
    """根据 index 文件定位 weight 所在的 shard"""
    index_path = os.path.join(model_dir, "model.safetensors.index.json")
    if os.path.exists(index_path):
        with open(index_path, encoding="utf-8") as f:
            index = json.load(f)
        shard_file = index["weight_map"][weight_name]
    else:
        files = [f for f in os.listdir(model_dir) if f.endswith(".safetensors")]
        shard_file = files[0] if len(files) == 1 else None
        if not shard_file:
            print(f"找不到 {weight_name} 的 shard 文件")
            sys.exit(1)
    return os.path.join(model_dir, shard_file)


def load_weight(model_dir: str, weight_name: str) -> torch.Tensor:
    """从 safetensors 中提取单个权重，转为 float32"""
    shard_path = find_shard(model_dir, weight_name)
    tensors = load_file(shard_path, device="cpu")
    w = tensors[weight_name].float()
    del tensors
    return w


def load_model_data(model_dir: str):
    """提取 embed_tokens 和 lm_head 权重"""
    print(f"提取权重: {model_dir}")
    embed = load_weight(model_dir, "model.embed_tokens.weight")
    lm_head = load_weight(model_dir, "lm_head.weight")
    print(f"  embed_tokens: {embed.shape}  lm_head: {lm_head.shape}")
    return embed, lm_head


# ══════════════════════════════════════════════════════════════
#  2. 数学计算
# ══════════════════════════════════════════════════════════════

def compute_metrics(embed_base, lm_base, lm_inst):
    """计算四个核心指标"""
    print("\n计算指标 ...")

    # (1) embed_tokens Norm (Base)
    embed_norm_base = torch.norm(embed_base, p=2, dim=1)

    # (2) lm_head Norm (Base)
    lm_norm_base = torch.norm(lm_base, p=2, dim=1)

    # (3) lm_head Cosine Similarity (Base vs Instruct)
    lm_base_norm = torch.nn.functional.normalize(lm_base, dim=1)
    lm_inst_norm = torch.nn.functional.normalize(lm_inst, dim=1)
    cosine_sim = (lm_base_norm * lm_inst_norm).sum(dim=1)

    # (4) lm_head L2 Diff (Instruct - Base)
    l2_diff = torch.norm(lm_inst - lm_base, p=2, dim=1)

    return {
        "embed_norm_base": embed_norm_base,
        "lm_norm_base": lm_norm_base,
        "cosine_sim": cosine_sim,
        "l2_diff": l2_diff,
    }


# ══════════════════════════════════════════════════════════════
#  3. 可视化
# ══════════════════════════════════════════════════════════════

def plot_histogram(data, subplot_title, xlabel, target_ids, tokenizer, filename, ax):
    """绘制单张直方图，标注目标 token"""
    arr = data.numpy()
    ax.hist(arr, bins=100, color=HIST_COLOR, edgecolor="white", alpha=0.85)
    ax.set_title(title, fontsize=13, fontweight="bold")
    ax.set_xlabel(xlabel, fontsize=11)
    ax.set_ylabel("Token 数量", fontsize=11)
    ax.grid(True, alpha=0.3)

    # 标注目标 token
    for tid in target_ids:
        val = arr[tid]
        decoded = tokenizer.decode([tid])
        ax.axvline(val, color=TARGET_COLOR, linestyle="--", linewidth=1.5, alpha=0.9)
        ax.annotate(
            f"{decoded}\n{val:.4f}",
            xy=(val, ax.get_ylim()[1] * 0.92),
            fontsize=8,
            color=TARGET_COLOR,
            ha="center",
            va="top",
            fontweight="bold",
        )


def generate_plots(metrics, tokenizer, target_ids, output_dir, title="SFT Token 遗忘诊断"):
    """生成四张直方图"""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(f"Qwen2.5-7B  {title}", fontsize=16, fontweight="bold", y=0.98)

    configs = [
        (metrics["embed_norm_base"], "embed_tokens Norm (Base)", "L2 范数"),
        (metrics["lm_norm_base"], "lm_head Norm (Base)", "L2 范数"),
        (metrics["cosine_sim"], "lm_head Cosine Similarity\n(Base vs Instruct)", "余弦相似度"),
        (metrics["l2_diff"], "lm_head L2 Diff\n(Instruct - Base)", "L2 范数"),
    ]

    for ax, (data, subplot_title, xlabel) in zip(axes.flat, configs):
        plot_histogram(data, subplot_title, xlabel, target_ids, tokenizer, None, ax)

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    safe_name = title.replace("\n", " ").replace(" ", "_")
    path = os.path.join(output_dir, f"{safe_name}_degradation_report.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    print(f"图表已保存: {path}")
    plt.close()


# ══════════════════════════════════════════════════════════════
#  4. 退化排行榜
# ══════════════════════════════════════════════════════════════

def contains_chinese(s: str) -> bool:
    return bool(re.search(r"[一-鿿]", s))


def degradation_leaderboard(cosine_sim, tokenizer, top_n=50, compare_name=""):
    """找出余弦相似度最低的中文 Token"""
    print(f"\n{'=' * 60}")
    print(f"  退化排行榜 (余弦相似度最低的 {top_n} 个中文 Token)")
    print(f"{'=' * 60}")

    special_ids = set(tokenizer.all_special_ids)
    scores = cosine_sim.numpy()

    # 收集所有中文 token
    chinese = []
    for tid in range(len(scores)):
        if tid in special_ids:
            continue
        text = tokenizer.decode([tid])
        if contains_chinese(text) and text.strip():
            chinese.append((tid, scores[tid], text))

    # 按相似度升序排列
    chinese.sort(key=lambda x: x[1])

    for i, (tid, sim, text) in enumerate(chinese[:top_n]):
        print(f"  [{i + 1:3d}] token_id={tid:>6d}  sim={sim:.4f}  |{text}|")

    # 导出 CSV
    csv_path = f"{compare_name}_degradation_leaderboard.csv" if compare_name else "degradation_leaderboard.csv"
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["rank", "token_id", "cosine_similarity", "token_text"])
        for i, (tid, sim, text) in enumerate(chinese[:top_n]):
            writer.writerow([i + 1, tid, f"{sim:.6f}", text])
    print(f"\n排行榜已导出: {csv_path}")

    return chinese[:top_n]


# ══════════════════════════════════════════════════════════════
#  5. 统计概览
# ══════════════════════════════════════════════════════════════

def print_stats(cosine_sim):
    arr = cosine_sim.numpy()
    print(f"\n{'=' * 60}")
    print(f"  余弦相似度统计")
    print(f"{'=' * 60}")
    print(f"  均值: {arr.mean():.4f}")
    print(f"  中位: {np.median(arr):.4f}")
    print(f"  最小: {arr.min():.4f}")
    print(f"  最大: {arr.max():.4f}")
    n = len(arr)
    for t in [0.99, 0.95, 0.90, 0.70, 0.50]:
        count = (arr < t).sum()
        print(f"  < {t:.2f}: {count} 个 ({count / n * 100:.2f}%)")


# ══════════════════════════════════════════════════════════════
#  Main
# ══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="稀疏 Token 遗忘诊断")
    parser.add_argument("--base", type=str, default=DEFAULT_BASE, help="Base 模型路径")
    parser.add_argument("--compare", type=str, default="instruct", help="对比模型：instruct / 自定义路径")
    parser.add_argument("--top", type=int, default=50, help="排行榜条数")
    parser.add_argument("--probe", nargs="*", default=["迷失传奇"],
                        help="额外探测的词")
    parser.add_argument("--out", type=str, default=".", help="输出目录")
    args = parser.parse_args()

    # 解析对比模型路径
    compare_dir = MODEL_PRESETS.get(args.compare, args.compare)
    compare_name = os.path.basename(compare_dir)

    print(f"Base:      {args.base}")
    print(f"Compare:   {compare_dir}")
    print(f"Output:    {compare_name}_degradation_report.png\n")

    # 加载分词器
    tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_DIR, trust_remote_code=True)

    # 加载权重
    embed_base, lm_base = load_model_data(args.base)
    embed_inst, lm_inst = load_model_data(compare_dir)

    # 计算指标
    metrics = compute_metrics(embed_base, lm_base, lm_inst)

    # 统计概览
    print_stats(metrics["cosine_sim"])

    # 探测指定词
    target_ids = []
    if args.probe:
        print(f"\n{'=' * 60}")
        print(f"  指定词探测")
        print(f"{'=' * 60}")
        for word in args.probe:
            ids = tokenizer.encode(word, add_special_tokens=False)
            for tid in ids:
                sim = metrics["cosine_sim"][tid].item()
                embed_n = metrics["embed_norm_base"][tid].item()
                lm_n = metrics["lm_norm_base"][tid].item()
                l2 = metrics["l2_diff"][tid].item()
                decoded = tokenizer.decode([tid])
                flag = "!!" if sim < 0.7 else ("! " if sim < 0.95 else "  ")
                print(f"  {flag} {decoded:<8s}  sim={sim:.4f}  embed_norm={embed_n:.2f}  lm_norm={lm_n:.2f}  l2_diff={l2:.2f}  (来自 '{word}')")
                target_ids.append(tid)

    # 退化排行榜
    degradation_leaderboard(metrics["cosine_sim"], tokenizer, args.top, compare_name)

    # 可视化
    title = f"Base vs {compare_name}"
    generate_plots(metrics, tokenizer, target_ids, args.out, title=title)


if __name__ == "__main__":
    main()
