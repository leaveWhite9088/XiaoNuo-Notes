#!/usr/bin/env python
# encoding: utf-8


"""
@author: liangliangyy
@license: MIT Licence
@contact: liangliangyy@gmail.com
@site: https://www.lylinux.org/
@software: PyCharm
@file: utils.py
"""
import logging
import threading
from hashlib import md5

import markdown as md_lib
from django.contrib.sites.models import Site
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name

from django.conf import settings

logger = logging.getLogger('djangoblog')


def get_max_articleid_commentid():
    from blog.models import Article
    from comments.models import Comment
    return (Article.objects.latest().pk, Comment.objects.latest().pk)


def get_md5(st):
    m = md5(st.encode('utf-8'))
    return m.hexdigest()


def cache_decorator(expiration=3 * 60):
    def wrapper(func):
        def news(*args, **kwargs):
            key = ''
            try:
                view = args[0]
                key = view.get_cache_key()
            except Exception:
                key = None
            if not key:
                unique_str = repr((func, args, kwargs))

                m = md5(unique_str.encode('utf-8'))
                key = m.hexdigest()
            value = cache.get(key)
            if value:
                logger.info('cache_decorator get cache:%s key:%s', func.__name__, key)
                return value
            else:
                logger.info('cache_decorator set cache:%s key:%s', func.__name__, key)
                value = func(*args, **kwargs)
                cache.set(key, value, expiration)
                return value

        return news

    return wrapper


def expire_view_cache(path, servername, serverport, key_prefix=None):
    from django.http import HttpRequest
    from django.utils.cache import get_cache_key

    request = HttpRequest()
    request.META = {'SERVER_NAME': servername, 'SERVER_PORT': serverport}
    request.path = path

    key = get_cache_key(request, key_prefix=key_prefix, cache=cache)
    if key:
        logger.info('expire_view_cache:get key:{path}'.format(path=path))
        if cache.get(key):
            cache.delete(key)
        return True
    return False


def block_code(text, lang, inlinestyles=False, linenos=False):
    if not lang:
        text = text.strip()
        return '<pre><code>%s</code></pre>\n' % md_lib.markdown(text, extensions=['fenced_code'])

    try:
        lexer = get_lexer_by_name(lang, stripall=True)
        formatter = HtmlFormatter(
            noclasses=inlinestyles, linenos=linenos
        )
        code = highlight(text, lexer, formatter)
        if linenos:
            return '<div class="highlight">%s</div>\n' % code
        return code
    except Exception:
        return '<pre class="%s"><code>%s</code></pre>\n' % (
            lang, md_lib.markdown(text, extensions=['fenced_code'])
        )


class BlogMarkDownRenderer:
    """Custom markdown renderer that applies blog-specific link logic."""

    def __init__(self):
        self.md = md_lib.Markdown(
            extensions=['fenced_code', 'codehilite', 'tables', 'toc', 'nl2br'],
            extension_configs={
                'codehilite': {
                    'linenums': False,
                    'guess_lang': False,
                }
            },
        )

    def autolink(self, link, is_email=False):
        import html
        text = html.escape(link)
        if is_email:
            link = 'mailto:%s' % link
        if not link:
            link = "#"
        site = Site.objects.get_current()
        nofollow = "" if link.find(site.domain) > 0 else "rel='nofollow'"
        return '<a href="%s" %s>%s</a>' % (link, nofollow, text)

    def convert(self, value):
        return self.md.convert(value)


class CommonMarkdown:
    @staticmethod
    def get_markdown(value):
        renderer = BlogMarkDownRenderer()
        return renderer.convert(value)


def send_email(emailto, title, content):
    msg = EmailMultiAlternatives(title, content, from_email=settings.DEFAULT_FROM_EMAIL, to=emailto)
    msg.content_subtype = "html"
    _thread = threading.Thread(target=msg.send, args=(msg,))
    _thread.start()


def parse_dict_to_url(d):
    from urllib.parse import quote
    url = '&'.join(['{}={}'.format(quote(k, safe='/'), quote(v, safe='/'))
                    for k, v in d.items()])
    return url
