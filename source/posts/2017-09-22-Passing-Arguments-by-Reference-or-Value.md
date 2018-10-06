---
title: Passing Arguments by Reference or Value
tags: Python
categories: Python
abbrlink: e40cacb6
date: 2017-09-22 10:31:59
---
在区分这两种方式之前，先要理解所有的对象或者说是基本数据类型，都有两样东西：
* 值
* 指向内存地址的引用
假设有`foo = "hello world!"`
> **Passing by Value**指将值的副本传递给被调用的函数，意味着有了两个**独立**的变量，互不干扰。传递的就是`hello world`
>
> **Passing by Reference**指将变量或者说是引用传递给函数，对**引用的实体**的修改将改变原有的变量。传递的可能是`0x7fd5d258dd00`这种形式的内存地址，任何指向这个地址变量的值都是`hello world`

<!-- more -->

在这里介绍了一下Java和Python关于参数传递的过程和机制：

## Java
在大多java的书籍中都强调：**只有值传递**。v
像这样：

```java
Dog myDog = new Dog("Bailey")  // 内存地址&42

public void foo(Dog someDog){
    someDog.setName("Max");  // Line A
    someDog = new Dog("Buddy");  // Line B
    someDog.setName("Rocky");  // Line C
}

foo(myDog)
```
看看都发生些什么：
* `foo`方法中的参数`someDog`，接收到`Dog Bailey`的引用的值的副本`&42`
* Line A
    * `someDog`现在的内存地址`&42`
    * 然后将`Dog Bailey`更名为`Max`
* Line B
    * 新创建了一只`Dog Buddy`，它在内存中的地址是`&63`
    * 将变量`someDog`的引用指向到`&63`
* Line C
    * `someDog`现在的内存地址`&63`
    * 将`Dog Buddy` 更名为`Rocky`

最后myDog的名称应该是`Max`，指向地址`&42`

## Python


## Difference

