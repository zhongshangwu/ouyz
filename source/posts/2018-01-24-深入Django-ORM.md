---
title: 深入Django ORM
abbrlink: 83dc4fd4
date: 2018-01-24 13:56:25
tags:
  - Python
  - Django
  - 源码
categories: Python
---
<!--  -->
<!-- more -->
大多数人对`ORM`褒贬不一, 一方面`ORM`能够以编码面向对象的设计方式和关系数据库关联, 从底层的数据库操作中解脱出来. 但是另一方面, `ORM`框架也导致了程序员对底层的控制力明显减弱, 而且使用`ORM`很难有针对的进行优化.

Django ORM框架

## 源码组织

Django ORM实现的源码都在`django.db`包中, 先来看一下它的代码组织结构:

```python
├── db
│   ├── models  # 以面向对象的方式和数据库关联
│   │   ├── aggregates.py  # 聚合查询
│   │   ├── base.py  # Model类定义
│   │   ├── constants.py  # 常量
│   │   ├── deletion.py  # 数据库表项删除的实现
│   │   ├── expressions.py  # 表达式
│   │   ├── fields  # 字段以及关联me
│   │   ├── functions  # 数据库函数
│   │   ├── indexes.py  # 索引
│   │   ├── __init__.py  
│   │   ├── lookups.py  # 属性查找器
│   │   ├── manager.py  # 对象管理器
│   │   ├── options.py  # 数据库属性
│   │   ├── query.py  # 查询集
│   │   ├── query_utils.py  # 查询工具
│   │   ├── signals.py  # 信号
│   │   ├── sql # sql语句
│   │   └── utils.py 
```

本篇文章主要针对`db.models`的各个模块分析`Django ORM`是怎么实现对象关系映射的以及有哪些地方是可以优化.


## 简单的例子

官方文档中的一个例子:

```python
from django.db import models

class Person(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)

    class Meta:
        pass
```

## 运行时创建模型类

`Django`用到了`Python`许多强大的特性, 而`Django ORM`部分就使用`元类(metaclass)`编程技术, 在运行时动态创建模型类.


`ModelBase`正是创建模型类的元类. 它实现了`__new__(cls, name, bases, attrs)`方法, 接收四个参数:

- `cls`: 元类类对象;
- `name`: 模型类名称;
- `bases`: 模型类的基类列表, `ModelBase`只能创建继承自`Model`的模型类;
- `attrs`: 模型类的命名空间, 模型的`Field`字段申明以及元信息`Meta`都在这个字典里面;

`ModelBase`中创建模型类对象的过程: 是通过基本`type`先创建一个简单的Python类对象, 然后使用`ModelBase`中定义的类方法`add_to_class`动态地设置模型类对象. `__new__`创建并初始化一个类对象分为一下几个步骤:

1. 生成一个模型类, 保留原始模型定义所在的模块;
2. 从原始模型类的定义中获取`Meta`元信息, `Django`会尝试从中获取一些模型类的相关属性, 例如: `abstract`,`ordering by`等;
3. 查找`model`所在的应用程序的`app_config`, 如果原始模型类没有提供自定义`app_label`, 那么它将被声明为模块所在`app`的标志;
4. 原始模型的元信息类`Meta`会别包装成一个特殊`Options`对象, 并设置在新创建的模型类对象的属性`_meta`上;
5. 为新创建模型类对象添加两个模型相关的异常类`DoesNotExist`和`MultipleObjectsReturned`;
6. 如果是一个代理模型类, 必须确保它的基类没有被`swapped out`;
7. 添加原始模型类中定义的所有属性和字段到新创建的模型类对象上;
8. 设置代理模型类;
9. 从父类继承部分属性和字段;
10. 如果是一个抽象模型类则直接返回;
11. 如果模型类没有提供一个对象管理器, 那么就设置一个名为`objects`的`Manager`默认对象管理器;
12. 新的模型类会被缓存在应用程序中;
13. 返回新创建的模型类, 供以后创建类的实例使用;






## 查询

## 事务



