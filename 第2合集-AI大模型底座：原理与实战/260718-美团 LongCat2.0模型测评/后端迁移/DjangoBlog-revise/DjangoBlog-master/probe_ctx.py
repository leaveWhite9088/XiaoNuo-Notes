import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DjangoBlog.settings')
sys.path.insert(0, os.path.dirname(__file__))
import django
django.setup()
from blog.models import Article
a = Article.objects.get(pk=4)
body = a.body or ''
lines = body.split('\n')
for i, line in enumerate(lines):
    if '![' in line or 'trans-status' in line or '3.6' in line or 'image_lazy' in line or '示意图' in line or '<img' in line:
        # print surrounding context
        for j in range(max(0,i-1), min(len(lines), i+2)):
            print(f"L{j}: {lines[j][:200]}")
        print("----")
