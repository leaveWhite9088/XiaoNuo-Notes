"""
Base class for DjangoBlog plugins.

Every plugin should subclass ``BasePlugin`` and implement ``register()``.
The ``register`` method receives the ``HookRegistry`` instance so the plugin
can subscribe to any hook it cares about.
"""

from abc import ABC, abstractmethod


class BasePlugin(ABC):
    """Abstract base class for plugins."""

    #: Human-readable plugin name
    name = ''
    #: Short description of what the plugin does
    description = ''
    #: Plugin version string
    version = '1.0.0'

    @abstractmethod
    def register(self, registry):
        """Register plugin hooks with the given registry.

        Args:
            registry: The ``HookRegistry`` singleton.
        """
        raise NotImplementedError()

    def enable(self):
        """Called when the plugin is enabled. Override for setup logic."""
        pass

    def disable(self):
        """Called when the plugin is disabled. Override for teardown logic."""
        pass
