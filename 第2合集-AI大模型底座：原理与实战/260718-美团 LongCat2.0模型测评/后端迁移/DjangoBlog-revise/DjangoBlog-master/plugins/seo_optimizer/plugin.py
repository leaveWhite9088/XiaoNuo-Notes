"""
seo_optimizer plugin - adds SEO meta tags to articles.
"""

from plugins.base import BasePlugin


class Plugin(BasePlugin):
    name = 'seo_optimizer'
    description = 'SEO 优化增强'
    version = '1.0.0'

    def register(self, registry):
        registry.register_hook('after_article_body_get', self.optimize_seo, priority=20)

    @staticmethod
    def optimize_seo(article, *args, **kwargs):
        """Attach SEO metadata to the article instance for template use."""
        if not hasattr(article, '_seo_optimized'):
            article._seo_optimized = True
            article.seo_title = article.title
            article.seo_keywords = ','.join(t.name for t in article.tags.all()) if article.tags else ''
        return article
