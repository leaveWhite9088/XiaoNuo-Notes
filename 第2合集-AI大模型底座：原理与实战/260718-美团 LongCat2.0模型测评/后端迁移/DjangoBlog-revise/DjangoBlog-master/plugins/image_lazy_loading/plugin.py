"""
image_lazy_loading plugin - adds loading="lazy" to images in article body.

同时支持两种语法：
  - Markdown 图片: ![alt](url)   (http/https 外链 或 /static/... 本地路径均可)
  - HTML 图片:    <img src="..." ...>
"""

import re

from plugins.base import BasePlugin


class Plugin(BasePlugin):
    name = 'image_lazy_loading'
    description = '图片懒加载优化（适配 Markdown + HTML 双语法）'
    version = '1.1.0'

    def register(self, registry):
        registry.register_hook('after_article_body_get', self.add_lazy_loading, priority=60)

    @staticmethod
    def add_lazy_loading(article, *args, **kwargs):
        """把正文里的图片全部加上 loading="lazy"。"""
        if not hasattr(article, '_lazy_loaded'):
            article._lazy_loaded = True
            body = article.body or ''

            # 1) Markdown 图片: ![alt](url)  ->  <img alt="alt" src="url">
            # 注意：url 可能是 http(s) 外链，也可能是 /static/... 本地路径，所以不限制协议
            def md_img(m):
                alt = m.group(1) or ''
                url = m.group(2)
                return '<img alt="{0}" src="{1}">'.format(alt, url)

            body = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', md_img, body)

            # 2) HTML 图片: 给 <img ...> 补上 loading="lazy"（已带 loading= 的不重复）
            # 注意：re.sub 传给回调的是 re.Match 对象，要用 m.group(0) 取匹配文本
            def with_lazy(m):
                tag = m.group(0)
                if 'loading=' in tag:
                    return tag
                return tag.replace('<img', '<img loading="lazy"', 1)

            body = re.sub(r'<img[^>]*>', with_lazy, body)

            article.body = body
        return article
