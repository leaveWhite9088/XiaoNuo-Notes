"""
Plugin loader.

Discovers and imports plugins from the ``plugins`` directory. Each plugin is a
subdirectory that contains a ``plugin.py`` module with a ``Plugin`` class that
subclasses ``BasePlugin``.
"""

import importlib
import logging
import os

from django.conf import settings

from .base import BasePlugin
from .hooks import hooks


logger = logging.getLogger('djangoblog')


def discover_plugins():
    """Return a list of plugin directory names that have a plugin.py module."""
    plugins_dir = getattr(settings, 'PLUGINS_DIR', os.path.join(os.path.dirname(__file__)))
    discovered = []
    if not os.path.isdir(plugins_dir):
        return discovered
    for entry in sorted(os.listdir(plugins_dir)):
        plugin_path = os.path.join(plugins_dir, entry)
        if os.path.isdir(plugin_path) and os.path.isfile(os.path.join(plugin_path, 'plugin.py')):
            discovered.append(entry)
    return discovered


def load_plugin(plugin_name):
    """Import and instantiate a single plugin by name.

    Returns the plugin instance, or None if it could not be loaded.
    """
    module_path = 'plugins.{name}.plugin'.format(name=plugin_name)
    try:
        module = importlib.import_module(module_path)
    except Exception as e:
        logger.error('Failed to import plugin %s: %s', plugin_name, e)
        return None

    plugin_class = getattr(module, 'Plugin', None)
    if plugin_class is None or not issubclass(plugin_class, BasePlugin):
        logger.error('Plugin %s does not define a Plugin class.', plugin_name)
        return None

    try:
        instance = plugin_class()
        instance.register(hooks)
        instance.enable()
        logger.info('Loaded plugin: %s (%s)', instance.name or plugin_name, instance.version)
        return instance
    except Exception as e:
        logger.error('Failed to initialize plugin %s: %s', plugin_name, e)
        return None


def load_plugins():
    """Load all enabled plugins from settings.ENABLED_PLUGINS."""
    enabled = getattr(settings, 'ENABLED_PLUGINS', [])
    loaded = {}
    for plugin_name in enabled:
        instance = load_plugin(plugin_name)
        if instance is not None:
            loaded[plugin_name] = instance
    return loaded


def get_plugin(plugin_name):
    """Load and return a single plugin instance by name."""
    return load_plugin(plugin_name)


def get_all_plugins():
    """Load and return all enabled plugins as a dict of name -> instance."""
    return load_plugins()
