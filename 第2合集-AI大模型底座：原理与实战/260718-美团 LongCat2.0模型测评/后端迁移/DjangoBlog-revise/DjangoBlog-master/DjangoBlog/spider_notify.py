#!/usr/bin/env python
# encoding: utf-8


"""
@author: liangliangyy
@license: MIT Licence
@contact: liangliangyy@gmail.com
@site: https://www.lylinux.org/
@software: PyCharm
@file: spider_notify.py
@time: 2017/1/15 下午1:41
"""
import urllib.request

import requests
from django.conf import settings


class SpiderNotify():
    @staticmethod
    def baidu_notify(urls):
        try:
            data = '\n'.join(urls)
            result = requests.post(settings.BAIDU_NOTIFY_URL, data=data)
            print(result.text)
        except Exception as e:
            print(e)

    @staticmethod
    def _google_notify():
        try:
            # ping_google has been removed from Django 5.0+
            # Use the Google ping URL directly
            url = 'https://www.google.com/ping?sitemap={sitemap_url}'.format(
                sitemap_url=settings.SITE_URL + '/sitemap.xml',
            )
            urllib.request.urlopen(url)
        except Exception as e:
            print(e)

    @staticmethod
    def notify(url):

        SpiderNotify.baidu_notify(url)
        SpiderNotify._google_notify()
