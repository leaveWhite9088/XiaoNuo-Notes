"""
实验：「迷失传奇」全方位诊断

从输入端（embedding）到输出端（lm_head），完整追踪 SFT 对这个词的影响。

分析模块：
  A. 语义聚类对比 — Base vs Instruct 的 embedding 邻居变化
  B. lm_head 权重向量对比 — 输出端向量方向偏移
  C. 同族词交叉打分 — embedding 和 lm_head 各自贡献多少退化
  D. 全词表排名变化 — 生成概率排名掉了多少位

用法:
    python experiment_mishi.py
    python experiment_mishi.py --token "迷失传奇"
"""
import argparse
import json
import os
import sys
import torch
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
from safetensors.torch import load_file
from transformers import AutoTokenizer

matplotlib.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "DejaVu Sans"]
matplotlib.rcParams["axes.unicode_minus"] = False

# ── 模型路径 ──
BASE_DIR = "./models/qwen2.5-7b"
INSTRUCT_DIR = "./models/qwen2.5-7b-instruct"
TOKENIZER_DIR = "./models/tk-qwen2.5-7b"

# ── 同族词（传奇私服 / 新开传奇 等） ──
DEFAULT_CONTEXT = ["传奇私服", "新开传奇", "道士职业", "热血传奇", "私服"]


# ══════════════════════════════════════════════════════════════
#  数据加载
# ══════════════════════════════════════════════════════════════

def find_shard(model_dir, weight_name):
    index_path = os.path.join(model_dir, "model.safetensors.index.json")
    if os.path.exists(index_path):
        with open(index_path, encoding="utf-8") as f:
            index = json.load(f)
        return os.path.join(model_dir, index["weight_map"][weight_name])
    files = [f for f in os.listdir(model_dir) if f.endswith(".safetensors")]
    if len(files) == 1:
        return os.path.join(model_dir, files[0])
    print(f"找不到 {weight_name} 的 shard 文件")
    sys.exit(1)


def load_weight(model_dir, weight_name):
    tensors = load_file(find_shard(model_dir, weight_name), device="cpu")
    w = tensors[weight_name].float()
    del tensors
    return w


def is_garbled(text):
    return "�" in text or not text.strip()


# ══════════════════════════════════════════════════════════════
#  A. 语义聚类对比
# ══════════════════════════════════════════════════════════════

def find_neighbors(embed_norm, tid, top_k, tokenizer):
    sims = embed_norm @ embed_norm[tid]
    sims[tid] = -1
    topk_vals, topk_ids = torch.topk(sims, top_k * 3)
    neighbors = []
    for sim_val, nid in zip(topk_vals, topk_ids):
        text = tokenizer.decode([nid.item()])
        if not is_garbled(text):
            neighbors.append((text, nid.item(), sim_val.item()))
        if len(neighbors) >= top_k:
            break
    return neighbors


def module_a_clustering(embed_base, embed_inst, tokenizer, target_id, top_k=20):
    """A. 语义聚类对比"""
    decoded = tokenizer.decode([target_id])
    embed_base_norm = torch.nn.functional.normalize(embed_base, dim=1)
    embed_inst_norm = torch.nn.functional.normalize(embed_inst, dim=1)

    neighbors_base = find_neighbors(embed_base_norm, target_id, top_k, tokenizer)
    neighbors_inst = find_neighbors(embed_inst_norm, target_id, top_k, tokenizer)

    base_ids = {n[1] for n in neighbors_base}
    inst_ids = {n[1] for n in neighbors_inst}
    overlap = len(base_ids & inst_ids)

    print(f"\n{'═' * 60}")
    print(f"  A. 语义聚类对比 — 「{decoded}」")
    print(f"{'═' * 60}")
    print(f"  邻居重叠率: {overlap}/{top_k} ({overlap / top_k * 100:.0f}%)")
    print()
    print(f"  {'Rank':<5s}  {'Base':<20s}  {'Instruct':<20s}")
    print(f"  {'─' * 50}")
    for i in range(min(15, top_k)):
        bt, bsid, bs = neighbors_base[i]
        it, isid, iss = neighbors_inst[i]
        marker = " =" if bsid in inst_ids else ""
        print(f"  [{i + 1:2d}]   {bt:<20s}  {it:<20s}{marker}")

    return {
        "neighbors_base": neighbors_base,
        "neighbors_inst": neighbors_inst,
        "overlap": overlap,
    }


# ══════════════════════════════════════════════════════════════
#  B. lm_head 权重向量对比
# ══════════════════════════════════════════════════════════════

def module_b_lm_head_vectors(lm_base, lm_inst, target_id, tokenizer):
    """B. lm_head 权重向量对比"""
    decoded = tokenizer.decode([target_id])
    vec_base = lm_base[target_id]
    vec_inst = lm_inst[target_id]

    cos_sim = torch.nn.functional.cosine_similarity(
        vec_base.unsqueeze(0), vec_inst.unsqueeze(0)).item()
    l2_dist = torch.norm(vec_inst - vec_base, p=2).item()
    norm_base = torch.norm(vec_base, p=2).item()
    norm_inst = torch.norm(vec_inst, p=2).item()

    # 全词表 lm_head 相似度分布（用于对比）
    lm_base_norm = torch.nn.functional.normalize(lm_base, dim=1)
    lm_inst_norm = torch.nn.functional.normalize(lm_inst, dim=1)
    all_cos = (lm_base_norm * lm_inst_norm).sum(dim=1).numpy()
    mean_cos = all_cos.mean()
    # "迷失传奇" 在全表中的偏离程度
    z_score = (cos_sim - mean_cos) / all_cos.std()

    print(f"\n{'═' * 60}")
    print(f"  B. lm_head 权重向量对比 — 「{decoded}」")
    print(f"{'═' * 60}")
    print(f"  Base  lm_head 范数:   {norm_base:.4f}")
    print(f"  Instruct lm_head 范数: {norm_inst:.4f}")
    print(f"  余弦相似度:           {cos_sim:.6f}")
    print(f"  全词表均值:           {mean_cos:.6f}")
    print(f"  偏离 z-score:         {z_score:+.2f}")
    print(f"  L2 距离:              {l2_dist:.4f}")

    return {
        "cos_sim": cos_sim,
        "l2_dist": l2_dist,
        "norm_base": norm_base,
        "norm_inst": norm_inst,
        "mean_cos": mean_cos,
        "z_score": z_score,
        "all_cos": all_cos,
    }


# ══════════════════════════════════════════════════════════════
#  C. 同族词交叉打分
# ══════════════════════════════════════════════════════════════

def dot_score(embed, lm_head, target_id, context_ids):
    hidden = embed[context_ids].mean(dim=0)
    return torch.dot(hidden, lm_head[target_id]).item()


def module_c_cross_scoring(embed_base, embed_inst, lm_base, lm_inst,
                           target_id, context_words, tokenizer):
    """C. 同族词交叉打分"""
    decoded = tokenizer.decode([target_id])
    context_ids = []
    for w in context_words:
        context_ids.extend(tokenizer.encode(w, add_special_tokens=False))

    logit_b2b = dot_score(embed_base, lm_base, target_id, context_ids)
    logit_i2i = dot_score(embed_inst, lm_inst, target_id, context_ids)
    logit_b2i = dot_score(embed_base, lm_inst, target_id, context_ids)
    logit_i2b = dot_score(embed_inst, lm_base, target_id, context_ids)

    delta_embed = logit_i2b - logit_b2b  # embedding 单独造成的偏移
    delta_lmhead = logit_b2i - logit_b2b  # lm_head 单独造成的偏移
    delta_total = logit_i2i - logit_b2b  # 总偏移

    print(f"\n{'═' * 60}")
    print(f"  C. 同族词交叉打分 — 「{decoded}」")
    print(f"{'═' * 60}")
    print(f"  上下文: {' + '.join(context_words)}")
    print()
    print(f"  {'组合':<30s}  {'logit':>8s}  {'偏离基准':>10s}")
    print(f"  {'─' * 55}")
    print(f"  {'Base embed + Base lm_head':<30s}  {logit_b2b:>8.4f}  (基准)")
    print(f"  {'Instruct embed + Instruct lm_head':<30s}  {logit_i2i:>8.4f}  {delta_total:>+10.4f}")
    print(f"  {'Base embed + Instruct lm_head':<30s}  {logit_b2i:>8.4f}  {delta_lmhead:>+10.4f}")
    print(f"  {'Instruct embed + Base lm_head':<30s}  {logit_i2b:>8.4f}  {delta_embed:>+10.4f}")
    print()
    print(f"  分解:")
    print(f"    Embedding 偏移:  {delta_embed:>+.4f}")
    print(f"    lm_head 偏移:    {delta_lmhead:>+.4f}")
    print(f"    总偏移:          {delta_total:>+.4f}")
    ratio = abs(delta_lmhead) / (abs(delta_embed) + 1e-9)
    print(f"    lm_head / Embed: {ratio:.1f}x")

    return {
        "logit_b2b": logit_b2b,
        "logit_i2i": logit_i2i,
        "logit_b2i": logit_b2i,
        "logit_i2b": logit_i2b,
        "delta_embed": delta_embed,
        "delta_lmhead": delta_lmhead,
        "delta_total": delta_total,
    }


# ══════════════════════════════════════════════════════════════
#  D. 全词表排名变化
# ══════════════════════════════════════════════════════════════

def module_d_rank_change(embed, lm_base, lm_inst, target_id, tokenizer):
    """D. 全词表排名变化"""
    decoded = tokenizer.decode([target_id])
    hidden = embed[target_id]

    logits_base = lm_base @ hidden
    logits_inst = lm_inst @ hidden

    rank_base = (logits_base >= logits_base[target_id]).sum().item()
    rank_inst = (logits_inst >= logits_inst[target_id]).sum().item()
    prob_base = torch.softmax(logits_base, dim=0)[target_id].item()
    prob_inst = torch.softmax(logits_inst, dim=0)[target_id].item()
    logprob_base = torch.log_softmax(logits_base, dim=0)[target_id].item()
    logprob_inst = torch.log_softmax(logits_inst, dim=0)[target_id].item()

    print(f"\n{'═' * 60}")
    print(f"  D. 全词表排名变化 — 「{decoded}」")
    print(f"{'═' * 60}")
    print(f"  排名:     {rank_base} → {rank_inst}  ({rank_inst - rank_base:+d})")
    print(f"  概率:     {prob_base:.8f} → {prob_inst:.8f}")
    print(f"  log 概率: {logprob_base:.4f} → {logprob_inst:.4f}  ({logprob_inst - logprob_base:+.4f})")

    return {
        "rank_base": rank_base,
        "rank_inst": rank_inst,
        "prob_base": prob_base,
        "prob_inst": prob_inst,
        "logprob_base": logprob_base,
        "logprob_inst": logprob_inst,
    }


# ══════════════════════════════════════════════════════════════
#  可视化: 2x2 四合一
# ══════════════════════════════════════════════════════════════

def generate_plots(cluster, vec, cross, rank, tokenizer, target_id, output_dir):
    decoded = tokenizer.decode([target_id])
    fig, axes = plt.subplots(2, 2, figsize=(16, 13))
    fig.suptitle(f"Qwen2.5-7B  「{decoded}」全方位诊断",
                 fontsize=15, fontweight="bold", y=0.98)

    # ── A: 语义聚类对比 ──
    ax_a = axes[0, 0]
    top_n = 12
    base_names = [n[0] for n in cluster["neighbors_base"][:top_n]]
    inst_names = [n[0] for n in cluster["neighbors_inst"][:top_n]]
    base_sims = [n[2] for n in cluster["neighbors_base"][:top_n]]
    inst_sims = [n[2] for n in cluster["neighbors_inst"][:top_n]]
    y = np.arange(top_n)
    h = 0.35
    ax_a.barh(y - h / 2, base_sims, h, label="Base", color="#7294bb", alpha=0.85)
    ax_a.barh(y + h / 2, inst_sims, h, label="Instruct", color="#e74c3c", alpha=0.85)
    labels = [f"{b} / {i}" if b != i else b for b, i in zip(base_names, inst_names)]
    ax_a.set_yticks(y)
    ax_a.set_yticklabels(labels, fontsize=7)
    ax_a.invert_yaxis()
    ax_a.legend(loc="lower right", fontsize=9)
    ax_a.set_title(f"A. 语义聚类对比\n重叠率 {cluster['overlap']}/{top_n}",
                   fontsize=11, fontweight="bold")
    ax_a.set_xlabel("余弦相似度")
    ax_a.grid(True, alpha=0.3, axis="x")

    # ── B: lm_head 向量对比 + 全表分布 ──
    ax_b = axes[0, 1]
    ax_b.hist(vec["all_cos"], bins=100, color="#7294bb", edgecolor="white", alpha=0.85, label="全词表")
    ax_b.axvline(vec["cos_sim"], color="#e74c3c", linestyle="--", linewidth=2, label=f"「{decoded}」")
    ax_b.axvline(vec["mean_cos"], color="#333", linestyle=":", linewidth=1, alpha=0.5, label="均值")
    ax_b.set_title(f"B. lm_head 余弦相似度分布\nsim={vec['cos_sim']:.4f}  z={vec['z_score']:+.2f}",
                   fontsize=11, fontweight="bold")
    ax_b.set_xlabel("余弦相似度")
    ax_b.set_ylabel("Token 数量")
    ax_b.legend(fontsize=9)
    ax_b.grid(True, alpha=0.3)

    # ── C: 交叉打分（实际 logit 值柱状图） ──
    ax_c = axes[1, 0]
    labels_c = ["Base+Base\n(基准)", "Inst+Inst\n(完整)", "Base+Inst\n(lm_head)", "Inst+Base\n(Embedding)"]
    logits = [cross["logit_b2b"], cross["logit_i2i"],
              cross["logit_b2i"], cross["logit_i2b"]]
    colors = ["#7294bb", "#e74c3c", "#e67e22", "#9b59b6"]
    x_c = np.arange(len(labels_c))
    bars = ax_c.bar(x_c, logits, color=colors, alpha=0.85, width=0.5)
    ax_c.axhline(y=cross["logit_b2b"], color="#7294bb", linestyle="--", linewidth=1, alpha=0.6, label="基准线")
    ax_c.set_xticks(x_c)
    ax_c.set_xticklabels(labels_c, fontsize=8)
    ax_c.set_title(f"C. 同族词交叉打分\nlm_head偏移={cross['delta_lmhead']:+.4f}  Embed偏移={cross['delta_embed']:+.4f}",
                   fontsize=11, fontweight="bold")
    ax_c.set_ylabel("Logit")
    ax_c.grid(True, alpha=0.3, axis="y")
    # 标注: 负值柱子的标签放在柱子下方
    for bar, val in zip(bars, logits):
        ax_c.text(bar.get_x() + bar.get_width() / 2, bar.get_y(),
                  f"{val:.4f}", ha="center", va="top", fontsize=9,
                  bbox=dict(boxstyle="round,pad=0.2", facecolor="white", alpha=0.8, edgecolor="none"))

    # ── D: 排名变化（拆成左右两个子图） ──
    ax_d = axes[1, 1]
    # 左轴: 排名
    x_d = np.arange(2)
    w = 0.3
    ranks = [rank["rank_base"], rank["rank_inst"]]
    bars_r = ax_d.bar(x_d - w / 2, ranks, w, label="排名", color=["#7294bb", "#e74c3c"], alpha=0.85)
    ax_d.set_ylabel("排名 (越小越好)", color="#333")
    ax_d.set_ylim(0, max(ranks) * 1.15)
    ax_d.set_xticks(x_d)
    ax_d.set_xticklabels(["Base", "Instruct"])
    ax_d.grid(True, alpha=0.3, axis="y")
    for bar, val in zip(bars_r, ranks):
        ax_d.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + max(ranks) * 0.01,
                  f"{val:,}", ha="center", va="bottom", fontsize=10, fontweight="bold")

    # 右轴: 概率
    ax_d2 = ax_d.twinx()
    probs = [rank["prob_base"] * 1e6, rank["prob_inst"] * 1e6]
    bars_p = ax_d2.bar(x_d + w / 2, probs, w, label="概率 (x1e6)",
                       color=["#aed6f1", "#f1948a"], alpha=0.85, edgecolor=["#7294bb", "#e74c3c"], linewidth=1.5)
    ax_d2.set_ylabel("概率 (x1e6)", color="#666")
    ax_d2.set_ylim(0, max(probs) * 1.3)
    for bar, val in zip(bars_p, probs):
        ax_d2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + max(probs) * 0.02,
                   f"{val:.2f}", ha="center", va="bottom", fontsize=9, color="#666")

    ax_d.set_title(f"D. 全词表排名变化\n{rank['rank_base']:,} → {rank['rank_inst']:,} ({rank['rank_inst'] - rank['rank_base']:+,d})",
                   fontsize=11, fontweight="bold")
    # 合并图例
    lines_a, labels_a = ax_d.get_legend_handles_labels()
    lines_b, labels_b = ax_d2.get_legend_handles_labels()
    ax_d.legend(lines_a + lines_b, labels_a + labels_b, loc="upper left", fontsize=9)

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    path = os.path.join(output_dir, "mishi_diagnosis.png")
    plt.savefig(path, dpi=150, bbox_inches="tight")
    print(f"\n图表已保存: {path}")
    plt.close()


# ══════════════════════════════════════════════════════════════
#  Main
# ══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="「迷失传奇」全方位诊断")
    parser.add_argument("--token", type=str, default="迷失传奇", help="目标 token")
    parser.add_argument("--context", nargs="*", default=DEFAULT_CONTEXT, help="同族词上下文")
    parser.add_argument("--neighbors", type=int, default=20, help="语义聚类邻居数")
    parser.add_argument("--out", type=str, default=".", help="输出目录")
    args = parser.parse_args()

    print("=" * 60)
    print(f"  「{args.token}」全方位诊断")
    print("=" * 60)

    tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_DIR, trust_remote_code=True)
    target_ids = tokenizer.encode(args.token, add_special_tokens=False)
    target_id = target_ids[0]
    print(f"  Token ID: {target_id}")

    # 加载权重
    print("\n加载 Base 模型 ...")
    embed_base = load_weight(BASE_DIR, "model.embed_tokens.weight")
    lm_base = load_weight(BASE_DIR, "lm_head.weight")
    print(f"  embed: {embed_base.shape}  lm_head: {lm_base.shape}")

    print("\n加载 Instruct 模型 ...")
    embed_inst = load_weight(INSTRUCT_DIR, "model.embed_tokens.weight")
    lm_inst = load_weight(INSTRUCT_DIR, "lm_head.weight")
    print(f"  embed: {embed_inst.shape}  lm_head: {lm_inst.shape}")

    # 四个分析模块
    cluster = module_a_clustering(embed_base, embed_inst, tokenizer, target_id, args.neighbors)
    vec = module_b_lm_head_vectors(lm_base, lm_inst, target_id, tokenizer)
    cross = module_c_cross_scoring(embed_base, embed_inst, lm_base, lm_inst,
                                   target_id, args.context, tokenizer)
    rank = module_d_rank_change(embed_base, lm_base, lm_inst, target_id, tokenizer)

    # 可视化
    generate_plots(cluster, vec, cross, rank, tokenizer, target_id, args.out)

    print("\n" + "=" * 60)
    print("  诊断完成")
    print("=" * 60)


if __name__ == "__main__":
    main()
