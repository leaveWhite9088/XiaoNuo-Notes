"""
cloudflare_cache plugin - sets Cloudflare cache headers on article responses.
"""

from plugins.base import BasePlugin


class Plugin(BasePlugin):
    name = 'cloudflare_cache'
    description = 'Cloudflare 缓存管理'
    version = '1.0.0'

    CACHE_MAX_AGE = 2592000  # 30 days

    def register(self, registry):
        registry.register_hook('after_article_body_get', self.set_cache_headers, priority=80)

    @staticmethod
    def set_cache_headers(article, *args, **kwargs):
        """Tag the article so the view can emit a Cache-Control header."""
        if not hasattr(article, '_cache_headers_set'):
            article._cache_headers_set = True
            article.cf_cache_max_age = Plugin.CACHE_MAX_AGE
        return article
