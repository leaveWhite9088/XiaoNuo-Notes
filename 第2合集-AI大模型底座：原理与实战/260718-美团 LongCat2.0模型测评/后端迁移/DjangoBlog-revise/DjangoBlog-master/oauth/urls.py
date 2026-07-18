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
@time: 2016/11/26 下午5:25
"""

from django.urls import re_path
from . import views

app_name = 'oauth'

urlpatterns = [
    re_path(r'^oauth/authorize$', views.authorize, name='authorize'),
    re_path(r'^oauth/requireemail/(?P<oauthid>\d+).html$', views.RequireEmailView.as_view(), name='require_email'),
    re_path(r'^oauth/emailconfirm/(?P<id>\d+)/(?P<sign>\S+).html$', views.emailconfirm, name='email_confirm'),
    re_path(r'^oauth/bindsuccess/(?P<oauthid>\d+).html$', views.bindsuccess, name='bindsuccess'),
    re_path(r'^oauth/oauthlogin$', views.oauthlogin, name='oauthlogin'),
]
