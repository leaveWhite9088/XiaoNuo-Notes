import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DjangoBlog.settings')
django.setup()

from plugins.loader import load_plugins
from plugins import hooks

print("========== 1) 已加载插件 ==========")
loaded = load_plugins()
for name, inst in loaded.items():
    print(f"  ✓ {name:<26} v{inst.version:<6}  ({inst.description})")
print(f"\n共 {len(loaded)} 个\n")

print("========== 2) 已注册钩子（按 priority 排好序的执行链）==========")
for hook, cbs in hooks.get_registered_hooks().items():
    print(f"  ▸ {hook}:")
    for cb in cbs:
        print(f"      • {cb}")

print("\n========== 3) 查询数据库里有没有文章可试 ==========")
from blog.models import Article
from django.contrib.auth import get_user_model
User = get_user_model()
qs = Article.objects.all()
print(f"  DB 里文章总数: {qs.count()}")
