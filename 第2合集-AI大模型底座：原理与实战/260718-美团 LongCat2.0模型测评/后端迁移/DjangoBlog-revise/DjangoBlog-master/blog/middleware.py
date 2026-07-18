#!/usr/bin/env python
# encoding: utf-8


"""
@version: ??
@author: liangliangyy
@license: MIT Licence
@contact: liangliangyy@gmail.com
@site: https://www.lylinux.org/
@software: PyCharm
@file: middleware.py
@time: 2017/1/19 上午12:36
"""

import time
from ipware import get_client_ip
from DjangoBlog.utils import cache


class OnlineMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        response = self.process_request(request)
        if response is None:
            response = self.get_response(request)
        return self.process_response(request, response, start_time)

    def process_request(self, request):
        http_user_agent = request.META.get('HTTP_USER_AGENT', [])
        if 'Spider' in http_user_agent or 'spider' in http_user_agent:
            return None

        online_ips = cache.get("online_ips", [])
        if online_ips:
            online_ips = cache.get_many(online_ips).keys()
            online_ips = list(online_ips)
        ip, _ = get_client_ip(request)

        cache.set(ip, 0, 5 * 60)

        if ip not in online_ips:
            online_ips.append(ip)
            cache.set("online_ips", online_ips)
        return None

    def process_response(self, request, response, start_time):
        cast_time = 0.921
        cast_time = time.time() - start_time
        if hasattr(response, 'content'):
            response.content = response.content.replace(b'<!!LOAD_TIMES!!>', str.encode(str(cast_time)[:5]))
        return response
