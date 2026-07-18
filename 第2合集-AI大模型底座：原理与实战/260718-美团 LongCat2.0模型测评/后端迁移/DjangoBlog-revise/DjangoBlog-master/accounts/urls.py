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
@time: 2016/11/20 下午3:52
"""

from django.urls import re_path
from . import views

app_name = 'accounts'

urlpatterns = [
    re_path(r'^login/$', views.LoginView.as_view(success_url='/'), name='login'),
    re_path(r'^register/$', views.RegisterView.as_view(success_url="/"), name='register'),
    re_path(r'^logout/$', views.LogoutView.as_view(), name='logout'),
]
