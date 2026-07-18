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
@time: 2016/11/12 下午3:03
"""

from django.urls import re_path
from . import views

app_name = 'comments'

urlpatterns = [
    # re_path(r'^postcomment/(?P<article_id>\d+)$', views.CommentPostView.as_view(), name='postcomment'),
    re_path(r'^article/(?P<article_id>\d+)/postcomment$', views.CommentPostView.as_view(), name='postcomment'),
]
