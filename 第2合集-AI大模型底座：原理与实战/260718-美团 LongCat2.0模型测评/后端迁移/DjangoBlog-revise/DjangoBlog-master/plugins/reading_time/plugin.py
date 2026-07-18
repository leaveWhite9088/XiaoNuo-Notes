"""
reading_time plugin - estimates article reading time.
"""

from plugins.base import BasePlugin


class Plugin(BasePlugin):
    name = 'reading_time'
    description = '文章阅读时间估算'
    version = '1.0.0'

    # Average reading speed: characters per minute
    WORDS_PER_MINUTE = 300

    def register(self, registry):
        registry.register_hook('after_article_body_get', self.estimate_reading_time, priority=70)

    def estimate_reading_time(self, article, *args, **kwargs):
        """Estimate how long it takes to read the article."""
        if not hasattr(article, '_reading_time_calculated'):
            article._reading_time_calculated = True
            body_len = len(article.body or '')
            minutes = max(1, round(body_len / self.WORDS_PER_MINUTE))
            article.reading_time_minutes = minutes
        return article
