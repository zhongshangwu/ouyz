---
title: 进程管理工具Supervisor
tags:
  - Linux
categories: Linux
abbrlink: 779b7ee0
date: 2017-08-29 17:21:29
---

# Supervisor简介

>   [官方文档]('http://supervisord.org/installing.html#installing-a-distribution-package')

Supervisor是一个用 Python 写的进程管理工具，可以很方便的用来启动、重启、关闭进程。能够将命令行进程变为后台守护进程，并监控进程状态，在意外崩溃时重启进程。Supervisor采用 C/S 架构，有几个部分组成:
*   supervisord: 服务守护进程
*   supervisorctl: 命令行客户端
*   Web Server: 提供相当于supervisorctl功能的WEB操作界面
*   XML-RPC Interface: XML-RPC接口

<!-- more -->

# 安装

Debian/Ubuntu 通过apt安装:
    # apt-get install supervisor

Pyhon 2　通过pip 安装
    # pip install supervisor

# 配置

Supervisor配置分为两个部分:supervisord(服务端，对应客户端supervisorctl)和应用程序配置。
安装完supervisor后，运行echo_supervisord_conf命令生成默认的配置文件，也可以重定向到一个指定文件:

    echo_supervisord_conf > /etc/supervisord.conf

## supervisord配置:

```ini
[unix_http_server]
file=/tmp/supervisor.sock   ; UNIX socket 文件，supervisorctl 会使用
;chmod=0700                 ; socket 文件的 mode，默认是 0700
;chown=nobody:nogroup       ; socket 文件的 owner，格式： uid:gid

;[inet_http_server]         ; HTTP 服务器，提供 web 管理界面
;port=127.0.0.1:9001        ; Web 管理后台运行的 IP 和端口，如果开放到公网，需要注意安全性
;username=user              ; 登录管理后台的用户名
;password=123               ; 登录管理后台的密码

[supervisord]
logfile=/tmp/supervisord.log ; 日志文件，默认是 $CWD/supervisord.log
logfile_maxbytes=50MB        ; 日志文件大小，超出会 rotate，默认 50MB
logfile_backups=10           ; 日志文件保留备份数量默认 10
loglevel=info                ; 日志级别，默认 info，其它: debug,warn,trace
pidfile=/tmp/supervisord.pid ; pid 文件
nodaemon=false               ; 是否在前台启动，默认是 false，即以 daemon 的方式启动
minfds=1024                  ; 可以打开的文件描述符的最小值，默认 1024
minprocs=200                 ; 可以打开的进程数的最小值，默认 200

; the below section must remain in the config file for RPC
; (supervisorctl/web interface) to work, additional interfaces may be
; added by defining them in separate rpcinterface: sections
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; 通过 UNIX socket 连接 supervisord，路径与 unix_http_server 部分的 file 一致
;serverurl=http://127.0.0.1:9001 ; 通过 HTTP 的方式连接 supervisord

; 包含其他的配置文件
[include]
files = relative/directory/*.ini    ; 可以是 *.conf 或 *.ini
```

## program配置

这部分是supervisord要管理的进程的配置文件。这里有两种方式:
1.  把所有配置文件都放在supervisord.conf配置文件里面
2.  通过include的方式把不同程序写到不同的配置文件里

**示例**:
新建目录/etc/supervisor/存放不同程序的配置文件，修改/etc/supervisord.conf:

    [include]
    files = /etc/supervisor/*.conf
以uwsgi的方式部署FLASK应用:

```
[program:your appname]
command=/path/to/virtual/env/bin/uwsgi -s /tmp/uwsgi.sock -w flask_file_name:app -H /path/to/virtual/env --chmod-socket 666
directory=/path/to/app
autostart=true
autorestart=true
stdout_logfile=/path/to/app/logs/uwsgi.log
redirect_stderr=true
stopsignal=QUIT
```
一份supervisord配置文件至少需要一个[program:x]部分的部署，x表示program name，会在supervisorctl或Web管理界面显示，在supervisorctl中通过这个值对程序进行start、stop、restart等操作

# 启动
supervisord启动配置文件的默认查找顺序为:$CWD/supervisord.conf, $CWD/etc/supervisord.conf, /etc/supervisord.conf。也可以通过 -c 选项指定配置文件路径:
    supervisord -c /etc/supervisord.conf

# 使用supervisorctl
supervisorctl是supervisord的一个命令行管理客户端工具、启动是需要和supervisord一样指定配置文件、否则按照与supervisord一样的顺序查找配置文件。
    supervisorctl -c /etc/supervisord.conf
supervisorctl命令会启动Shell界面，然后可以执行各种命令:
    > status    # 查看程序状态
    > stop usercenter   # 关闭 usercenter 程序
    > start usercenter  # 启动 usercenter 程序
    > restart usercenter    # 重启 usercenter 程序
    > reread    ＃ 读取有更新（增加）的配置文件，不会启动新添加的程序
    > update    ＃ 重启配置文件修改过的程序
除了进入Shell界面，也可以直接在Bash终端运行:
    $ supervisorctl status
    $ supervisorctl stop usercenter
    $ supervisorctl start usercenter
    $ supervisorctl restart usercenter
    $ supervisorctl reread
    $ supervisorctl update
另外也可以登入WEB管理界面进行操作，除了单进程管理，supervisor还具备配置group，进行分组管理等功能
