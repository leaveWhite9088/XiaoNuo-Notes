"""
批量 Tokenizer 对比测试
加载业界标杆模型的分词器，输入文本对比分词结果。
"""
import os
import warnings
warnings.filterwarnings("ignore")
from transformers import AutoTokenizer
from tokenizers import Tokenizer

MODELS = {
    "gpt2":           "./models/tk-gpt2",
    "llama3-8b":      "./models/tk-llama3-8b",
    "llama3.1-8b":    "./models/tk-llama3.1-8b",
    "qwen2.5-1.5b":   "./models/tk-qwen2.5-1.5b",
    "qwen2.5-7b":     "./models/tk-qwen2.5-7b",
    "deepseek-v3":    "./models/tk-deepseek-v3",
    "deepseek-r1":    "./models/tk-deepseek-r1",
    "mistral-7b":     "./models/tk-mistral-7b-v0.3",
    "minimax-m2.5":   "./models/tk-minimax-m2.5",
}


def load_tokenizer(path):
    """优先用 transformers，如果中文 encode 为空则回退到 tokenizers 库直接加载"""
    tok = AutoTokenizer.from_pretrained(path, clean_up_tokenization_spaces=False)
    # 测试中文是否能 encode
    if tok.encode("你好"):
        return tok, "transformers"
    # 回退：直接用 tokenizers 库加载 tokenizer.json
    json_path = os.path.join(path, "tokenizer.json")
    if os.path.exists(json_path):
        return Tokenizer.from_file(json_path), "tokenizers"
    return tok, "transformers"


class TokenizersWrapper:
    """统一 tokenizers 库和 transformers 库的接口"""
    def __init__(self, tok, backend):
        self.tok = tok
        self.backend = backend

    def encode(self, text):
        if self.backend == "transformers":
            return self.tok.encode(text)
        out = self.tok.encode(text)
        return out.ids

    def decode_one(self, tid):
        if self.backend == "transformers":
            decoded = self.tok.decode([tid])
            if "�" in decoded:
                raw = self.tok.convert_ids_to_tokens(tid)
                return raw if isinstance(raw, str) else repr(raw)
            return decoded
        # tokenizers 库：用 decode 还原
        decoded = self.tok.decode([tid])
        if not decoded or "�" in decoded:
            return self.tok.id_to_token(tid)
        return decoded


# 加载所有分词器
tokenizers = {}
for name, path in MODELS.items():
    print(f"加载 {name} ...")
    try:
        tok, backend = load_tokenizer(path)
        tokenizers[name] = TokenizersWrapper(tok, backend)
    except Exception as e:
        print(f"  跳过 {name}: {e}")

print(f"\n已加载 {len(tokenizers)} 个分词器，输入文本开始分词（输入 q 退出）\n")

while True:
    text = input(">>> ").strip()
    if text.lower() == "q":
        break
    if not text:
        continue

    for name, tw in tokenizers.items():
        ids = tw.encode(text)
        readable = [tw.decode_one(tid) for tid in ids]
        print(f"{name}：({len(ids)} tokens)")
        print(f"  IDs    : {ids}")
        print(f"  Tokens : {readable}")
    print("---\n")