from django.apps import AppConfig


class PluginsConfig(AppConfig):
    name = 'plugins'
    default_auto_field = 'django.db.models.BigAutoField'
    verbose_name = 'Plugins'

    def ready(self):
        # Import and load all enabled plugins when Django starts.
        from .loader import load_plugins
        load_plugins()
