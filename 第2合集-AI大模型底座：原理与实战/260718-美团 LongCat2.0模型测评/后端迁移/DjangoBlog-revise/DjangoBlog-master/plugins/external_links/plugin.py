"""
external_links plugin - marks external links in article body.

Matches BOTH forms:
  - HTML:   <a href="https://...">...</a>
  - Markdown: [text](https://...)
"""

import re

from plugins.base import BasePlugin


class Plugin(BasePlugin):
    name = 'external_links'
    description = '外部链接处理（自动添加图标）— 支持 HTML + Markdown 双语法'
    version = '1.1.0'

    def register(self, registry):
        registry.register_hook('after_article_body_get', self.process_external_links, priority=50)

    @staticmethod
    def process_external_links(article, *args, **kwargs):
        """Mark external links in the article body so templates can style them."""
        if not hasattr(article, '_links_processed'):
            article._links_processed = True
            site = article.get_absolute_url().split('/')[0] + '//' + article.get_absolute_url().split('/')[2]

            # 1) HTML 形态: href="https://..."
            html_links = re.findall(r'href=["\'](https?://[^"\']+)["\']', article.body)
            # 2) Markdown 形态: [text](https://...)
            md_links = re.findall(r'\[[^\]]*\]\((https?://[^)]+)\)', article.body)

            # 保序去重（Markdown 渲染后生成的 HTML 会同时命中上面两条）
            all_links = list(dict.fromkeys(html_links + md_links))
            article.external_links = [l for l in all_links if site not in l]
        return article
