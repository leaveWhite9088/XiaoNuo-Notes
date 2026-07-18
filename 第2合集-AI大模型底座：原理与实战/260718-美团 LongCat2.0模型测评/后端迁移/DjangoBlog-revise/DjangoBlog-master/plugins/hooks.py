"""
Hook registry for the plugin system.

Provides a simple publish/subscribe mechanism that lets plugins register
callbacks at named hook points throughout the codebase.
"""

import logging

logger = logging.getLogger('djangoblog')


class HookRegistry:
    """Central registry for plugin hooks."""

    def __init__(self):
        self._hooks = {}

    def register_hook(self, hook_name, callback, priority=10):
        """Register a callback for a given hook.

        Args:
            hook_name: Name of the hook to register for.
            callback: Callable to invoke when the hook fires.
            priority: Lower numbers run first (default 10).
        """
        if hook_name not in self._hooks:
            self._hooks[hook_name] = []
        self._hooks[hook_name].append((priority, callback))
        self._hooks[hook_name].sort(key=lambda item: item[0])

    def apply_filters(self, hook_name, value, *args, **kwargs):
        """Fire a filter hook, passing value through each registered callback.

        Each callback receives the current value plus any extra args and must
        return the (possibly modified) value.
        """
        if hook_name not in self._hooks:
            return value
        for priority, callback in self._hooks[hook_name]:
            try:
                value = callback(value, *args, **kwargs)
            except Exception as e:
                logger.error('Plugin hook "%s" callback error: %s', hook_name, e)
        return value

    def do_action(self, hook_name, *args, **kwargs):
        """Fire an action hook. Return values are discarded."""
        if hook_name not in self._hooks:
            return
        for priority, callback in self._hooks[hook_name]:
            try:
                callback(*args, **kwargs)
            except Exception as e:
                logger.error('Plugin hook "%s" callback error: %s', hook_name, e)

    def get_registered_hooks(self):
        """Return a dict of hook_name -> list of callback names (for introspection)."""
        result = {}
        for hook_name, callbacks in self._hooks.items():
            result[hook_name] = [cb.__qualname__ for _, cb in callbacks]
        return result


# Singleton registry used across the project
hooks = HookRegistry()


def register_hook(hook_name, callback, priority=10):
    """Convenience wrapper around HookRegistry.register_hook."""
    hooks.register_hook(hook_name, callback, priority=priority)


def apply_filters(hook_name, value, *args, **kwargs):
    """Convenience wrapper around HookRegistry.apply_filters."""
    return hooks.apply_filters(hook_name, value, *args, **kwargs)


def do_action(hook_name, *args, **kwargs):
    """Convenience wrapper around HookRegistry.do_action."""
    hooks.do_action(hook_name, *args, **kwargs)
