"""
view_count plugin - tracks article view counts via the after_article_body_get hook.
"""

from plugins.base import BasePlugin


class Plugin(BasePlugin):
    name = 'view_count'
    description = '文章浏览计数统计'
    version = '1.0.0'

    def register(self, registry):
        registry.register_hook('after_article_body_get', self.track_view, priority=10)

    @staticmethod
    def track_view(article, *args, **kwargs):
        """Increment view count when an article is fetched for display."""
        try:
            article.viewed()
        except Exception:
            pass
        return article
