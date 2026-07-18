# DjangoBlog 迁移报告：Django 1.11 / Python 3.5 → Django 5.2 / Python 3.10

---

## 一、迁移概览

| 项目 | 迁移前 | 迁移后 |
|------|--------|--------|
| Python | 3.5 | 3.10.20 |
| Django | 1.11.5 | 5.2 |
| 数据库驱动 | PyMySQL 0.7.11 | mysqlclient 2.2.8 |
| Markdown 渲染 | mistune 0.7.4 | markdown 3.10.2 |
| 富文本编辑器 | django-pagedown | django-mdeditor |
| 缓存后端 | MemcachedCache | LocMemCache |
| 插件系统 | 无 | 自研 Hook 机制 |

---

## 二、约束遵循确认

| 约束 | 遵循情况 |
|------|---------|
| 严禁读取/参考新仓库源码 | ✅ 仅阅读 README，未读任何源码 |
| 插件系统需自行设计，不得雷同 | ✅ 独立设计 HookRegistry + BasePlugin 架构 |
| 修复所有废弃 API，check/migrate/collectstatic 通过 | ✅ 三项命令均通过 |
| 保证文章、评论、OAuth 入口渲染正常 | ✅ 全部返回 200/302 |
| 环境用 conda djangoblog-revise | ✅ 全程在该环境下操作 |

---

## 三、依赖变更

### requirements.txt

```
# 升级
Django              1.11.5  → 5.2
django-haystack     2.6.1   → 3.4.0
django-compressor   2.2     → 4.6.0
django-appconf      1.0.2   → 1.2.0
django-uuslug       1.1.8   → 2.0.0
jieba               0.39    → 0.42.1
jsonpickle          0.9.5   → 4.1.2
Pillow              4.2.1   → 12.3.0
requests            2.18.4  → 2.34.2
rcssmin             1.0.6   → 1.2.2
rjsmin              1.0.12  → 1.2.5
urllib3             1.22    → 2.7.0
WeRoBot             1.1.1   → 1.13.1
python-slugify      1.2.4   → 8.0.4

# 替换
django-autoslug     → django-uuslug
django-pagedown     → django-mdeditor
mistune             → markdown
markdown2           → (移除，不再需要)
PyMySQL             → mysqlclient

# 移除
django-debug-toolbar
six
pytz
appdirs
pyparsing
olefile
python-memcached

# 新增
pymemcache          (Django 5.2 memcached 后端依赖)
pygments            (代码高亮)
django-ipware       (IP 获取)
```

---

## 四、废弃 API 修复清单

### 4.1 URL 路由层

| 废弃 API | 新 API | 涉及文件 |
|---------|--------|---------|
| `from django.conf.urls import url` | `from django.urls import re_path, path` | 所有 `urls.py` |
| `url(r'^...$', view)` | `re_path(r'^...$', view)` / `path(...)` | 所有 `urls.py` |
| `include('app.urls', namespace='n', app_name='a')` | `include('app.urls', namespace='n')` + 模块内 `app_name = 'a'` | `DjangoBlog/urls.py`, 所有子 `urls.py` |

### 4.2 数据库/模型层

| 废弃 API | 新 API | 涉及文件 |
|---------|--------|---------|
| `from django.core.urlresolvers import reverse` | `from django.urls import reverse` | `models.py`, `views.py`, `sitemap.py`, `feeds.py`, `templatetags` |
| `django.utils.encoding.force_text` | `django.utils.encoding.force_str` | `whoosh_cn_backend.py`, `utils.py` |
| `six.integer_types` / `six.string_types` | `(int,)` / `str` | `whoosh_cn_backend.py` |
| `django.utils.datetime_safe.datetime` | `datetime.datetime` | `whoosh_cn_backend.py` |
| `abstractproperty` (abc 模块) | `@property` + `@abstractmethod` | `oauth/oauthmanager.py` |
| `BaseOauthManager(metaclass=ABCMeta)` | `BaseOauthManager(ABC)` | `oauth/oauthmanager.py` |

### 4.3 视图/请求层

| 废弃 API | 新 API | 涉及文件 |
|---------|--------|---------|
| `request.user.is_authenticated()` (方法调用) | `request.user.is_authenticated` (属性) | `blog/views.py`, `comments/views.py`, `oauth/views.py` |
| `form.save(False)` | `form.save(commit=False)` | `blog/views.py`, `comments/views.py`, `accounts/views.py` |
| `comment.save(True)` | `comment.save()` | `comments/views.py` |
| `super(Cls, self).method()` | `super().method()` | 所有子类方法 |
| `django.utils.http.is_safe_url(url, host)` | `django.utils.http.url_has_allowed_host_and_scheme(url, allowed_hosts={...})` | `accounts/views.py` |
| `request.is_anonymous()` | `request.is_anonymous` | (已检查无此问题) |
| `u'...'` Unicode 前缀 | `''` 常态字符串 | `blog/views.py` 等 |

### 4.4 信号层

| 废弃 API | 新 API | 涉及文件 |
|---------|--------|---------|
| `django.dispatch.Signal(providing_args=[...])` | `django.dispatch.Signal()` | `blog_signals.py` |
| `providing_args` 参数 | 移除 | `blog_signals.py` |

### 4.5 中间件层

| 废弃 API | 新 API | 涉及文件 |
|---------|--------|---------|
| `MIDDLEWARE_CLASSES = [...]` | `MIDDLEWARE = [...]` | `settings.py` |
| `class OnlineMiddleware(object):` + `process_request/process_view/process_response` | `class OnlineMiddleware:` + `__init__(self, get_response)` + `__call__` | `blog/middleware.py` |
| `from ipware.ip import get_real_ip` | `from ipware import get_client_ip` | `blog/middleware.py` |

### 4.6 模板标签层

| 废弃 API | 新 API | 涉及文件 |
|---------|--------|---------|
| `@register.assignment_tag` | `@register.simple_tag` | `blog/templatetags/blog_tags.py`, `comments/templatetags/comments_tags.py` |
| `from django.core.urlresolvers import reverse` | `from django.urls import reverse` | `blog/templatetags/blog_tags.py`, `oauth/templatetags/oauth_tags.py` |

### 4.7 邮件/工具层

| 废弃 API | 新 API | 涉及文件 |
|---------|--------|---------|
| `import _thread; _thread.start_new_thread(func, args)` | `threading.Thread(target=func, args=args).start()` | `utils.py` |
| `mistune.Markdown / mistune.Renderer` | `markdown.Markdown` | `utils.py` |
| `django.contrib.sitemaps.ping_google` | `urllib.request.urlopen(google_ping_url)` | `spider_notify.py` |

### 4.8 表单/Admin 层

| 废弃 API | 新 API | 涉及文件 |
|---------|--------|---------|
| `from django.utils.translation import ugettext_lazy as _` | `from django.utils.translation import gettext_lazy as _` | `blog/admin.py` |
| `from pagedown.widgets import AdminPagedownWidget` | `from mdeditor.widgets import MDEditorWidget` | `blog/admin.py` |
| `'pagedown'` INSTALLED_APPS | `'mdeditor'` | `settings.py` |

### 4.9 配置层

| 废弃 API / 问题 | 修复 | 涉及文件 |
|----------------|------|---------|
| `STATICFILES = os.path.join(...)` (无效设置名) | `STATICFILES_DIRS = [os.path.join(...)]` | `settings.py` |
| `settings.OAHUTH` 命名容易混淆 | `settings.OAUTH` | `settings.py`, `oauth/oauthmanager.py` |
| `SECRET_KEY = os.environ.get(...)` (测试环境为空) | 增加 fallback 默认值 | `settings.py` |
| 缺少 `DEFAULT_AUTO_FIELD` | 新增 `DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'` | `apps.py` × 5 |

---

## 五、插件系统设计

### 5.1 架构概览

```
plugins/
├── __init__.py              # 统一对外导出
├── apps.py                  # Django AppConfig, ready() 时自动加载
├── base.py                  # BasePlugin 抽象基类
├── hooks.py                 # HookRegistry (filters + actions 双模式)
├── loader.py                # 自动发现与加载机制
├── view_count/              # 文章浏览计数统计
├── seo_optimizer/           # SEO 优化增强
├── article_copyright/       # 文章版权声明
├── article_recommendation/  # 智能文章推荐
├── external_links/          # 外部链接处理
├── image_lazy_loading/      # 图片懒加载优化
├── reading_time/            # 文章阅读时间估算
└── cloudflare_cache/        # Cloudflare 缓存管理
```

### 5.2 HookRegistry 设计

```python
class HookRegistry:
    - register_hook(hook_name, callback, priority=10)
    - apply_filters(hook_name, value, *args, **kwargs) → value   # 过滤器链
    - do_action(hook_name, *args, **kwargs)                     # 动作通知
    - get_registered_hooks() → dict                             # 内省
```

- 每个 hook 是有序列表，按 priority 升序执行
- `apply_filters`：每个回调接收当前值，返回修改后的值（链式传递）
- `do_action`：回调仅接收参数，返回值被忽略

### 5.3 BasePlugin 生命周期

```python
class BasePlugin(ABC):
    name: str
    description: str
    version: str
    @abstractmethod register(registry: HookRegistry)  # 注册钩子
    def enable()   # 启用时调用
    def disable()  # 禁用时调用
```

### 5.4 已定义 Hooks

| Hook 名称 | 类型 | 触发位置 |
|-----------|------|---------|
| `after_article_body_get` | filter | `ArticleDetailView.get_object()` |

### 5.5 内置插件列表

| 插件名 | 优先级 | 行为 |
|--------|--------|------|
| `view_count` | 10 | 调用 `article.viewed()` 增加浏览量 |
| `seo_optimizer` | 20 | 挂载 `seo_title` / `seo_keywords` 属性 |
| `article_copyright` | 30 | 生成 `copyright_notice` 属性 |
| `article_recommendation` | 40 | 基于相同标签查询相关文章 |
| `external_links` | 50 | 提取外部链接列表 |
| `image_lazy_loading` | 60 | 为 `<img>` 标签注入 `loading="lazy"` |
| `reading_time` | 70 | 按字符数估算阅读时间（300字/分钟） |
| `cloudflare_cache` | 80 | 标记缓存最大存活时间 |

---

## 六、文件变更统计

| 类型 | 数量 |
|------|------|
| 修改的文件 | 57 |
| 新增的文件 | 19 |
| **合计** | **76** |

### 修改的文件

```
DjangoBlog/__init__.py              DjangoBlog/settings.py
DjangoBlog/urls.py                  DjangoBlog/utils.py
DjangoBlog/blog_signals.py          DjangoBlog/sitemap.py
DjangoBlog/feeds.py                 DjangoBlog/spider_notify.py
DjangoBlog/tests.py                 DjangoBlog/whoosh_cn_backend.py

accounts/apps.py                    accounts/forms.py
accounts/models.py                  accounts/tests.py
accounts/urls.py                    accounts/user_login_backend.py
accounts/views.py                   accounts/migrations/0001_initial.py

blog/admin.py                       blog/apps.py
blog/forms.py                       blog/middleware.py
blog/models.py                      blog/search_indexes.py
blog/templatetags/blog_tags.py      blog/tests.py
blog/urls.py                        blog/views.py
blog/migrations/0001_initial.py

comments/apps.py                    comments/forms.py
comments/models.py                  comments/templatetags/comments_tags.py
comments/tests.py                   comments/urls.py
comments/views.py                   comments/migrations/0001_initial.py

oauth/apps.py                       oauth/forms.py
oauth/models.py                     oauth/oauthmanager.py
oauth/templatetags/oauth_tags.py    oauth/urls.py
oauth/views.py                      oauth/migrations/0001_initial.py

servermanager/apps.py               servermanager/MemcacheStorage.py
servermanager/Api/blogapi.py        servermanager/Api/commonapi.py
servermanager/models.py             servermanager/robot.py
servermanager/tests.py              servermanager/urls.py
servermanager/migrations/0001_initial.py

travis_test/__init__.py             requirements.txt
```

### 新增的文件

```
plugins/__init__.py                 plugins/apps.py
plugins/base.py                     plugins/hooks.py
plugins/loader.py
plugins/view_count/__init__.py      plugins/view_count/plugin.py
plugins/seo_optimizer/__init__.py   plugins/seo_optimizer/plugin.py
plugins/article_copyright/__init__.py  plugins/article_copyright/plugin.py
plugins/article_recommendation/__init__.py  plugins/article_recommendation/plugin.py
plugins/external_links/__init__.py  plugins/external_links/plugin.py
plugins/image_lazy_loading/__init__.py  plugins/image_lazy_loading/plugin.py
plugins/reading_time/__init__.py   plugins/reading_time/plugin.py
plugins/cloudflare_cache/__init__.py  plugins/cloudflare_cache/plugin.py
```

---

## 七、验证结果

### 7.1 管理命令

```bash
python manage.py check          # ✅ System check identified no issues
python manage.py migrate        # ✅ No migrations to apply
python manage.py collectstatic --noinput   # ✅ 730 static files
python manage.py test           # ✅ 9 tests passed
```

### 7.2 HTTP 端点

| 端点 | 状态码 |
|------|--------|
| `/` (首页) | 200 |
| `/login/` (登录) | 200 |
| `/register/` (注册) | 200 |
| `/feed/` (RSS) | 200 |
| `/sitemap.xml` | 200 |
| `/search/` (搜索) | 200 |
| `/article/<year>/<month>/<day>/<id>.html` (文章详情) | 200 |
| `/article/<id>/postcomment` (评论提交) | 302 |
| `/oauth/oauthlogin?type=github` (OAuth 入口) | 302 |
| `/static/blog/css/style.css` (静态资源) | 200 |

### 7.3 插件系统

```python
>>> load_plugins()
{'view_count', 'seo_optimizer', 'article_copyright',
 'article_recommendation', 'external_links', 'image_lazy_loading',
 'reading_time', 'cloudflare_cache'}
# 8 个插件全部加载成功
```

---

## 八、已知限制与后续建议

1. **DEBUG=True 当前为开启状态**：生产部署前需改回 `False` 并配置 Web 服务器（Nginx）处理静态文件
2. **数据库当前为 SQLite**：生产环境需切换为 MySQL，并恢复环境变量中的连接信息
3. **Memcached 未运行**：当前使用 LocMemCache 替代，生产环境需恢复 Memcached
4. **测试密码已增强**：Django 5.2 对密码复杂度要求更严格
5. **`ping_google` 已移除**：Django 5.0+ 不再内置，改为直接 HTTP 请求 Google ping URL（已失效，建议移除或替换为 Google Search Console API）

---

## 九、关键设计决策

### 9.1 插件系统独立设计
- 未参考任何外部实现，仅根据 README 的 `after_article_body_get` 钩子描述和 8 个插件名称进行设计
- 采用 WordPress 风格的 filter/action 双模式（Django 信号不适合做链式修改）
- Plugin 目录约定：子目录 + `plugin.py` + `Plugin` 类的 discover 模式

### 9.2 Markdown 渲染器重写
- 从 mistune 0.7.4 迁移到标准 markdown 库
- 重写 `BlogMarkDownRenderer`：使用 `markdown.Markdown(extensions=[...])` 替代 `mistune.Renderer` 子类化
- 支持 fenced_code、codehilite、tables、toc、nl2br 扩展

### 9.3 中间件现代化
- 将 `process_request/process_view/process_response` 风格重写为 `__call__` 风格
- 兼容 Django 5.2 中间件协议，无需 `MiddlewareMixin`

### 9.4 SECRET_KEY 默认值
- 原代码 `SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')` 在测试环境为空会导致崩溃
- 增加 fallback 默认值，同时保留环境变量覆盖能力

---

*迁移完成时间：2026-07-10*
*迁移人：Claude Code*
