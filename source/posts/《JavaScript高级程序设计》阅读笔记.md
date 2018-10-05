---
title: 《JavaScript高级程序设计》阅读笔记
date: 2018-09-20 10:03:50
tags:
    - Python
categories:
    - 随笔
---

# 《JavaScript高级程序设计》读书笔记

![JavaScript高级程序设计](http://oufa7cuo5.bkt.clouddn.com/Professional-JavaScript-for-Web-Developers.jpg)

[TOC]

## 第一章 JavaScript简介

一个完整的JavaScript实现应该由下列三个不同的部分组成:

* 核心(ECMAScript)
* 文档对象模型(DOM)
* 浏览器对象模型(BOM)

![JavaScript实现](http://oufa7cuo5.bkt.clouddn.com/Javascript结构.png)

### 1.1 ECMAScript

简称ES，是由Ecma国际（前身为欧洲计算机制造商协会,英文名称是European Computer Manufacturers Association）按照ECMA-262和ISO/IEC 16262标准制定的一种脚本语言规范。

__JavaScript与ECMAScript的关系:__

JavaScript是按ECMAScript规范实现的一种脚本语言，其他的还有JScript、ActionScript

__ECMAScript版本__

截止到2017年年底，ECMAScript共发布了8个版本：

- ECMAScript 1
	1997年06月：发布首版。
- ECMAScript 2
	1997年06月：修改规范完全符合ISO/IEC 16262国际标准。
- ECMAScript 3
	1999年12月：增加正则、更好的文字处理、新的控制语句、try/catch异常处理、更加明确的错误定义，数字输出格式等等。
- ECMAScript 4
	放弃发布。
- ECMAScript 5
	2009年12月：完善了ECMAScript 3版本、增加"strict mode,"（严格模式）、以及新的功能，如getter和setter、JSON库支持和更完整的对象属性。
- ECMAScript 5.1
	2011年06月：使规范更符合ISO/IEC 16262:2011第三版。
- ECMAScript 6
	2015年06月：第六版的名字有很多，可以叫ECMAScript 6（ES6），也可以叫ECMAScript 2015（ES2015）。
	此版本增加了非常重要的东西：let、const、class、modules、 arrow functions,、template string, destructuring, default, rest argument、binary data、promises等等。
	规范地址：http://www.ecma-international.org/ecma-262/6.0/
	ES6及以上的教程可参考Babel提供的： https://babeljs.io/learn-es2015/
- ECMAScript 7
	2016年06月：也被称为ECMAScript 2016。完善ES6规范，还包括两个新的功能：求幂运算符（*）和array.prototype.includes方法。
    规范地址：http://www.ecma-international.org/ecma-262/7.0/
- ECMAScript 8
	2017年06月：增加新的功能，如并发、原子操作、Object.values/Object.entries、字符串填充、promises、await/asyn等等。
	规范地址：http://www.ecma-international.org/ecma-262/8.0/

### 1.2 Babel

想使用JS的新特性，又想兼容旧浏览器版本，那么就需要一种转换工具：把JS的新特性代码转换为旧浏览器可以支持的JS代码。而Babel就是这么一个工具。

Babel，官方介绍一个JavaScript编译器。说简单点就是把使用ES6及以上的特性的代码转换为对应的ES5代码，以使旧浏览器可以运行。

网址：https://babeljs.io/

## 第二章 在HTML中使用JavaScript

### 2.1 &lt; script&gt;元素属性

- `sync`:  可选。表示立即下载脚本，但不妨碍其他资源的加载。(只针对外部脚本文件生效)
- `charset`: 可选。
- `defer`: 可选。表示脚本可以延迟到文档完全被解析和显示后执行。(只针对外部脚本生效)
- `language`: 废弃。
- `src`: 可选。表示包含要执行的外部文件。
- `type`: 可选。

### 2.2 延迟脚本和异步脚本

`defer`属性表明脚本在执行期间不会影响页面的构造，即立即下载脚本，但是脚本会延迟到页面解析完毕后执行。

```javascript
<script type="text/javascript" defer src="examle1.js"></script>
<script type="text/javascript" defer src="examle2.js"></script>
```

`HTML5`规范要求延迟脚本按出现的先后顺序执行，即脚本1会先于脚本2执行，并且在`DOMContentLoaded`事件之前执行。但是现实中，延迟脚本并不一定按顺序执行，也不一定会在触发`DOMContentLoaded`之前执行。

`async`属性告诉浏览器立即下载文件，标记为`async`的脚本并不保证按照他们指定的先后顺序执行。

```javascript
<script type="text/javascript" async src="examle1.js"></script>
<script type="text/javascript" async src="examle2.js"></script>
```

以上代码中，第一个脚本可能会在第一个脚本之前执行。标记为`async`属性的目的是不让页面等待两个脚本下载和执行，从而异步加载页面其他内容。建议异步脚本不要在加载期间改变DOM。

### 2.3 &lt; noscript&gt;元素

`<noscript>`元素中的内容只有在以下两种情况才会显示出来：

- 浏览器不支持javascript;
- 浏览器支持脚本，但是脚本已被禁用

## 第三章 基本概念

### 3.1 语法

1. ECMAScript中的一切(变量、函数名和操作符)都区分大小写;
2. ES5引入了严格模式(strict mode)的概念, 在严格模式下，ECMAScript 3中的一些不确定行为将得到处理，而且对某些不安全的操作会抛出错误
    ```
    "use strict";  // 在整个脚本顶部添加, 启用严格模式
    ```

### 3.2 变量

ECMAScript的变量是松散类型的(可以用来保存任何类型的数据)。

#### 3.2.1 变量提升

W3CShool中是这样描述变量提升(hoisting)的:

> Hoisting is JavaScript's default behavior of moving declarations to the top.

在JavaScript所有声明都会被提升到代码执行上下文顶部(在编译阶段将声明放到内存中)。这样的好处是:

1. 函数可以在声明之前调用:

    ```javascript
    catName("Chole");  // 函数可以在声明之前调用, 实践中不推荐这种方式

    function catName(name) {
        console.log("我的猫名叫:" + name)
    }
    ```

2. JavaScripy仅提升声明，并不提升初始化. 意味着先使用变量，再声明变量，那得到的值将是`undefined`:

    ```javascript
    var x = 1;                  // 声明并初始化x=1
    console.log(x + " " + y);   // 输出x和y, '1 undefined'
    var y = 2;                  // 声明并初始化y=2

    // 等价于
    var x = 1;
    var y;
    console.log(x + " " + y);
    y = 2;
    ```

#### 3.2.2 var VS let

1. Scope:

    - `var` is scoped to the nearest function block;
    - `let` is scoped to the nearest enclosing block;

2. Global:

    分别使用`var`和`let`在最外层作用域定义两个变量:

    ```javascript
    var x = "x";
    let y = "y";
    ```

    然而, 使用`var`声明的变量会定义在全局对象`window`上，而`let`则不会:

    ```javascript
    console.log(window.x);  // 'x'
    console.log(window.y);  // 'undefined'
    ```

3. Redeclaration:

    严格模式下, `var`可以让你在同一作用域多次声明同一变量:

    ```javascript
    "use strict";

    var x = "foo";
    var x = "bar";  // 一切正常，x的值被替换掉了
    ```

    而`let`则不行:

    ```javascript
    "use strict";

    let x = "foo";
    let x = "bar";  // SyntaxError: Identifier 'x' has already been declared
    ```

4. Hoisting

    前面说过，JavaScript中所有的声明都会提升, 不过我们常见的一种说法是:

    > Variables and constants declared with let or const are not hoisted!

    其实这种说法并不准确, `let`和`const`以及`class`也会提升声明, 只不过会引入一个新的概念: 暂死区(Temporal dead zone)。
    在暂死区, 会引发`ReferenceError`:

    ```javascript
    function do_something() {
        console.log(foo);  // 'undefined'
        console.log(bar);  // ReferenceError: bar is not defined
        var foo = 1;
        let bar = 2;
        }
    ```

> 参考:
> 1. [MDN let statement](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let)
> 2. [let 声明会提升（hoist）吗？](https://zhuanlan.zhihu.com/p/27558914)
> 3. [JavaScript variables lifecycle: why let is not hoisted](https://dmitripavlutin.com/variables-lifecycle-and-why-let-is-not-hoisted/)


### 3.3 数据类型

ECMAScript中有5种简单的数据类型: `Undefined`, `Null`, `Boolean`, `Number`和`String`, 此外还有一种复杂数据类型---`Object`。

ECMAScript不支持任何创建自定义类型的机制, 而所有值最终都是上面6种数据类型之一。


## 变量、作用域和内存




