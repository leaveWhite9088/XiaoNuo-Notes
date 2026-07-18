"""
DjangoBlog Plugin System

A lightweight hook-based plugin system that allows extending blog functionality
without modifying core code. Plugins register callbacks to named hooks that
are fired at specific points in the request/response lifecycle.

Hooks:
    - after_article_body_get: fired after an article object is fetched for detail view
    - before_article_body_render: fired before article body is rendered in template
    - after_comment_post: fired after a comment is successfully posted
"""

from .hooks import hooks, register_hook, apply_filters, do_action
from .loader import load_plugins, get_plugin, get_all_plugins

__all__ = [
    'hooks',
    'register_hook',
    'apply_filters',
    'do_action',
    'load_plugins',
    'get_plugin',
    'get_all_plugins',
]
