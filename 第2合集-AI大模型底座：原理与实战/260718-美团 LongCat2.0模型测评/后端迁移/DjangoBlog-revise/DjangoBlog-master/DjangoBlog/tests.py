#!/usr/bin/env python
# encoding: utf-8


"""
@author: liangliangyy
@license: MIT Licence
@contact: liangliangyy@gmail.com
@site: https://www.lylinux.net/
@software: PyCharm
@file: tests.py
@time: 2017/10/25 下午10:16
"""

from django.test import TestCase
from DjangoBlog.utils import get_md5, CommonMarkdown, parse_dict_to_url


class DjangoBlogTest(TestCase):
    def setUp(self):
        pass

    def test_utils(self):
        md5 = get_md5('test')
        self.assertIsNotNone(md5)
        c = CommonMarkdown.get_markdown('''
        # Title1

        ```python
        import os
        ```

        [url](https://www.lylinux.org/)

        [ddd](http://www.baidu.com)


        ''')
        self.assertIsNotNone(c)
        d = {
            'd': 'key1',
            'd2': 'key2',
        }
        data = parse_dict_to_url(d)
        self.assertIsNotNone(data)
