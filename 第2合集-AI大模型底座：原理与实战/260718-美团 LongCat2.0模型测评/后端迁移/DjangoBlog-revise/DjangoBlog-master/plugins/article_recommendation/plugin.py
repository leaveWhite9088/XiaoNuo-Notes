"""
article_recommendation plugin - suggests related articles.
"""

from plugins.base import BasePlugin


class Plugin(BasePlugin):
    name = 'article_recommendation'
    description = '智能文章推荐（响应式卡片布局）'
    version = '1.0.0'

    def register(self, registry):
        registry.register_hook('after_article_body_get', self.attach_recommendations, priority=40)

    @staticmethod
    def attach_recommendations(article, *args, **kwargs):
        """Attach a list of related articles based on shared tags."""
        if not hasattr(article, '_recommendations_attached'):
            article._recommendations_attached = True
            try:
                from blog.models import Article
                tag_ids = article.tags.values_list('pk', flat=True)
                related = Article.objects.filter(
                    tags__in=tag_ids, status='p',
                ).exclude(pk=article.pk).distinct()[:5]
                article.related_articles = list(related)
            except Exception:
                article.related_articles = []
        return article
