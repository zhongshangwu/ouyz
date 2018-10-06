---
title: Python网络编程
tags:
  - Python
  - Socket
categories: Python
abbrlink: d317e8c4
date: 2017-12-02 15:17:57
---

> Socket(套接字)通常指”通信端点“，用于进程间通信。
<!-- more -->

## 概述
Socket API 是由操作系统提供的一个编程接口，让应用程序可以控制使用 socket 技术。

在TCP/IP五层架构中，Socket API 不属于TCP/IP协议簇，只是操作系统提供的一个用于网络编程的接口，工作在应用层与传输层之间：
```code
     +----------------+
     |  Application   | <+
     +----------------+  |
     +----------------+  |
  +> |   Socket API   | <+
  |  +----------------+  |
  |  +----------------+  |
  |  |   Transport    | <+
  |  +----------------+
  |  +----------------+
  +> |    Internet    |
     +----------------+
     +----------------+
     | Network Access |
     +----------------+
```

一个socket包含两个必要组成部分：
- 地址，由ip和端口组成，例如192.168.1.10：80。
- 协议，socket用的传输控制层协议，目前有三种：`TCP`，`UDP`和`rawIP`。

地址与协议可以确定一个socket；一台机器上，只允许存在一个同样的socket。TCP 端口 53 的 socket 与 UDP 端口 53 的 socket 是两个不同的 socket。

根据 socket 传输数据方式的不同（使用协议不同），可以分为以下三种：
1. `Stream sockets`，也称为“面向连接”的 socket，使用 TCP 协议。提供序列化的，可靠地和不重复的数据交付，而没有记录边界，这意味着上层协议需要自己去界定数据分隔符，其优势是数据是可靠的。创建流套接字，必须使用`SOCK_STREAM`作为套接字类型。
2. `Datagram sockets`，也称为“无连接”的 socket，使用 UDP 协议。实际通信前不需要连接，在传输过程中，无法确保它的顺序性，可靠性或重复性，然而数据确实保存了边界记录，这意味着消息是以整体发送的。创建数据包套接字，必须使用`SOCK_DAGRAM`作为套接字类型。
3.` Raw sockets`, 原始套接字（raw socket）是一种网络套接字，允许直接发送/接收IP协议数据包而不需要任何传输层协议格式。用原始套接字发送数据，是否自动增加传输层协议包头是可选的。`SOCK_RAW`作为套接字类型。

根据使用的地址家族不同，可以分为两种：
1. UNIX套接字：基于文件，创建时使用`AF_UNIX`，或`AF_LOCAL`作为地址家族。
2. INET套接字：面向网络，创建时使用`AF_INET`,或`AF_INET6`作为地址家族。

## Python中的Socket编程

在Python中提供了socket和SocketServer模块可以面向套接字编程。

### TCP Socket通信

[tcp_echo_server.py]()
```python
import socket
from time import ctime

tcp_server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp_server_sock.bind(('', 1024))
tcp_server_sock.listen(5)


def handle_message(client_sock, addr):
    while True:
        data = client_sock.recv(1024)
        if not data:
            break
        print('[from %s:%s] %s' % (addr + (data.decode('utf-8'),)))
        client_sock.\
            send(bytes("[%s] %s" % (ctime(), data.decode('utf-8')), 'utf-8'))
    client_sock.close()
    print('client[%s:%s] socket closed' % addr)


def loop_forever():
    try:
        while True:
            print("waiting for connection...")
            tcp_client_sock, addr = tcp_server_sock.accept()
            print("connected from:%s:%s", addr)
            handle_message(tcp_client_sock, addr)
    finally:
        tcp_server_sock.close()
        print('server socket closed...')


if __name__ == '__main__':
    loop_forever()
```

[tcp_echo_client.py]()
```python
import socket

tcp_client_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp_client_sock.connect(('', 1024))


def loop_forver():
    try:
        while True:
            data = input('> ')
            if not data:
                break
            tcp_client_sock.send(bytes(data, 'utf-8'))
            data = tcp_client_sock.recv(1024)
            if not data:
                break
            print(data.decode('utf-8'))
    finally:
        tcp_client_sock.close()
        print('client socket closed...')


if __name__ == '__main__':
    loop_forver()
```

### UDP Socke通信

[udp_server.py]()
```python
import socket
from time import ctime

udp_server_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp_server_sock.bind(('', 1024))


def loop_forever():
    try:
        while True:
            print("waiting for message...")
            data, addr = udp_server_sock.recvfrom(1024)
            if not data:
                break
            print('[from %s:%s] %s' % (addr + (data.decode('utf-8'),)))
            udp_server_sock.\
                sendto(bytes("[%s] %s" % (ctime(),
                             data.decode('utf-8')), 'utf-8'), addr)
            print('...received from and returned to:%s:%s' % addr)
    finally:
        udp_server_sock.close()
        print('server socket closed...')


if __name__ == '__main__':
    loop_forever()

```

[udp_client.py]()
```python
import socket

udp_client_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)


def loop_forver():
    try:
        while True:
            data = input('> ')
            if not data:
                break
            udp_client_sock.sendto(bytes(data, 'utf-8'), ('', 1024))
            data, addr = udp_client_sock.recvfrom(1024)
            if not data:
                break
            print(data.decode('utf-8'))
    finally:
        udp_client_sock.close()
        print('client socket closed...')


if __name__ == '__main__':
    loop_forver()

```
###

> <font face="Sans Serif">*__最简单的socket通信__*</font>
<font face="Sans Serif">*__SocketServer__*</font>
<font face="Sans Serif">*__select__*</font>

## 参考链接
- [socket文档](https://docs.python.org/3/library/socket.html)
