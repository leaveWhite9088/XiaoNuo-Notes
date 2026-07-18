#!/usr/bin/env python
# encoding: utf-8


"""
@version: ??
@author: liangliangyy
@license: MIT Licence
@contact: liangliangyy@gmail.com
@site: https://www.lylinux.org/
@software: PyCharm
@file: urls.py
@time: 2016/11/2 下午7:15
"""

from django.urls import re_path
from . import views

app_name = 'blog'

urlpatterns = [
    re_path(r'^$', views.IndexView.as_view(), name='index'),
    re_path(r'^page/(?P<page>\d+)$', views.IndexView.as_view(), name='index_page'),

    re_path(r'^article/(?P<year>\d+)/(?P<month>\d+)/(?P<day>\d+)/(?P<article_id>\d+).html$',
            views.ArticleDetailView.as_view(),
            name='detailbyid'),

    re_path(r'^blogpage/(?P<year>\d+)/(?P<month>\d+)/(?P<day>\d+)/(?P<page_id>\d+)-(?P<slug>[\w-]+).html$',
            views.ArticleDetailView.as_view(),
            name='pagedetail'),

    re_path(r'^category/(?P<category_name>[\w-]+).html$', views.CategoryDetailView.as_view(), name='category_detail'),
    re_path(r'^category/(?P<category_name>[\w-]+)/(?P<page>\d+).html$', views.CategoryDetailView.as_view(),
            name='category_detail_page'),
    # re_path(r'^category/(?P<category_name>[\w-]+)/(?P<page>\d+).html$', views.CategoryDetailView.as_view(),
    #   name='category_detail'),

    re_path(r'^author/(?P<author_name>\w+).html$', views.AuthorDetailView.as_view(), name='author_detail'),
    re_path(r'^author/(?P<author_name>\w+)/(?P<page>\d+).html$', views.AuthorDetailView.as_view(),
            name='author_detail_page'),

    re_path(r'^tag/(?P<tag_name>.+).html$', views.TagDetailView.as_view(), name='tag_detail'),
    re_path(r'^tag/(?P<tag_name>.+)/(?P<page>\d+).html$', views.TagDetailView.as_view(), name='tag_detail_page'),

    re_path(r'^upload/$', views.fileupload, name='upload'),
    re_path(r'^refresh/$', views.refresh_memcache, name='refresh'),
]
