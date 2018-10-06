---
title: uWsgi部署导致Apscheduler任务不运行
tags:
  - Linux
  - Python
categories: Linux
abbrlink: 431b23f2
date: 2017-09-18 20:39:39
---

**前言**

> [uWSGI官方文档](http://uwsgi-docs-zh.readthedocs.io/zh_CN/latest/index.html)

在一个Flask项目里，采用Apscheduler做定时任务处理（订单的过期和活动的开始）。
但是在正式生产环境下，使用Nginx+Supervisor+uWSGI的方式部署FLask项目，发现定时任务成功存储到了Store job里，然而不会触发，只有在项目重启的时候，才会执行那些没有执行的任务。
采用的uwsgi 配置
<!-- more -->

``` 
[uwsgi]
master = true
wsgi-file = application.py
callable = app
http = :5000
processes = 2
threads = 4
```

在网上查过相关资料，发现两种解决方案：

**方案一：**
uwsgi 默认采用one thread one processor,在没有请求的时候，会导致部分线程会被挂起，
在uwsgi配置文件中加上
```
enable-thread = true 
```
上面这个解决方案，存在两个问题：
> 在上面的配置文件里，我有启用两个进程和四个线程，那么为什么还会导致线程被挂起呢?
另外，在采用这种解决方案后，还是没有触发那些动态添加的定时任务
关于这部分还需要深入研究uwsgi和apscheduler的运行机制，另外有了解的可以在下面的评论区回复:blush::blush::blush:

**方案二：**
尽管uWSGI的最常见的应用场景是作为web服务器使用，但是uWSGI还有许多强大和复杂的功能等待我们发现。
其中一个重要的机制就是uWSGI信号框架(负责进程通信和事件管理)
通过master进程注册信号或者是定时任务，那么worker可以在信号触发的时候运行对应的处理程序
```python
import uwsgi

def hello_timer(num):
        print "2 seconds elapsed, signal %d raised" % num

def oneshot_timer(num):
        print "40 seconds elapsed, signal %d raised. You will never see me again." % num

uwsgi.register_signal(26, "worker", hello_timer)
uwsgi.register_signal(30, "", oneshot_timer)

uwsgi.add_timer(26, 2) # never-ending timer every 2 seconds
uwsgi.add_rb_timer(30, 40, 1) # one shot rb timer after 40 seconds
```
上面是一个简单的官方demo。
首先注册了信号26，发送给第一个可用的worker，执行回调函数hello_timer;
注册信号30,空字符串代表默认选项（发送给第一个可用worker），执行回调函数oneshot_timer
每2秒钟就会引发一次信号26，并且由第一个可用worker处理。40秒过后会引发一次信号30，然后只执行一次。
采用这种方式可以完美的解决上面遇到的问题，但是需要大量的改动原有的代码，无奈只能放弃。

**方案三：**
简单粗暴且高效，直接更换部署方式：采用Nginx+supervisor+gunicorn来部署Flask项目。
    gunicorn -w 4 -b 127.0.0.1:5000 application:app

**总结：**
到这,只有第一种方案是在解决uWSGI和apscheduler的冲突问题，至于后面两种方案只是去避开这个问题。另外关于uWSGI和gunicorn的区别与比较，在后面会进行分析了解。