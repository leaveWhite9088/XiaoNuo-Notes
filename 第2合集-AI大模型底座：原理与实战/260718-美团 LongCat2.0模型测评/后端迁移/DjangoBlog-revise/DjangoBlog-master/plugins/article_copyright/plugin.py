"""
article_copyright plugin - appends a copyright notice to article body.
"""

from plugins.base import BasePlugin


class Plugin(BasePlugin):
    name = 'article_copyright'
    description = '文章版权声明（现代化样式）'
    version = '1.0.0'

    def register(self, registry):
        registry.register_hook('after_article_body_get', self.attach_copyright, priority=30)

    @staticmethod
    def attach_copyright(article, *args, **kwargs):
        """Attach copyright information to the article for template rendering."""
        if not hasattr(article, '_copyright_attached'):
            article._copyright_attached = True
            article.copyright_notice = (
                '本文由 {} 创作，采用 CC BY-NC-SA 4.0 许可协议。'
                '转载请注明出处。'.format(article.author.username)
            )
        return article
