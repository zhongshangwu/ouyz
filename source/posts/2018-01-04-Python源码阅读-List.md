---
title: Python源码阅读-List
abbrlink: 1d425055
date: 2018-01-04 13:01:15
tags:
  - 源码
  - Python
categories: Python
---

和前面的整数,字符串不同的是,List除了是一个变长对象,也需要动态的调整其所维护的内存和元素,所以,他还是一个可变对象.

在这篇(以及后续的博客)里面只会对Python3的源码进行分析.

<!-- more -->

## 定义

```c
[include/listobject.c]
typedef struct {
    PyObject_VAR_HEAD
    /* Vector of pointers to list elements.  list[0] is ob_item[0], etc. */
    PyObject **ob_item;

    /* ob_item contains space for 'allocated' elements.  The number
     * currently in use is ob_size.
     * Invariants:
     *     0 <= ob_size <= allocated
     *     len(list) == ob_size
     *     ob_item == NULL implies ob_size == allocated == 0
     * list.sort() temporarily sets allocated to -1 to detect mutations.
     *
     * Items must normally not be NULL, except during construction when
     * the list is not yet visible outside the function that builds it.
     */
    Py_ssize_t allocated;
} PyListObject;
```

从`PyListObject`的定义和注释中我们可以知道:

- `ob_item`:指向一个内部的元素列表的内存块首地址,所以注释里会有`list[0] is ob_item[0]`.
- `allocated`:元素列表可容纳的元素总数.这一点需要和`ob_size`区分,`ob_size`是实际使用的元素数量.所以有:<br>
    `0 <= ob_size <= allocated`<br>
    `len(list) == ob_size`<br>
    `ob_item == NULL 意味着 ob_size == allocated == 0`

在许多行为上,Python中的list和C++中的`vector`十分相像.

## 创建

Python中创建列表只有通过一种方式,那就是`PyList_New`,其中`size`指示初始的元素个数.

```c
[Objects/listobject.c]
PyObject *
PyList_New(Py_ssize_t size)
{
    PyListObject *op;
#ifdef SHOW_ALLOC_COUNT
    static int initialized = 0;
    if (!initialized) {
        Py_AtExit(show_alloc);
        initialized = 1;
    }
#endif

    if (size < 0) {
        PyErr_BadInternalCall();
        return NULL;
    }
    /* 缓冲池机制 */
    if (numfree) {  /* 可用 */
        numfree--;
        op = free_list[numfree];
        _Py_NewReference((PyObject *)op);
#ifdef SHOW_ALLOC_COUNT
        count_reuse++;
#endif
    } else {  /* 不可用,创建PyListObject对象本身 */
        op = PyObject_GC_New(PyListObject, &PyList_Type);
        if (op == NULL)
            return NULL;
#ifdef SHOW_ALLOC_COUNT
        count_alloc++;
#endif
    }
    if (size <= 0)
        op->ob_item = NULL;
    else {  /* 为内部的元素列表分配内存 */
        op->ob_item = (PyObject **) PyMem_Calloc(size, sizeof(PyObject *));
        if (op->ob_item == NULL) {  /* 内存溢出 */
            Py_DECREF(op);
            return PyErr_NoMemory();
        }
    }
    /* 设置值 */
    Py_SIZE(op) = size;
    op->allocated = size;
    _PyObject_GC_TRACK(op);
    return (PyObject *) op;
}
```

通过源代码可以看到,`List`的创建分为两个部分:

- `PyListObject`本身的创建:又到了熟悉的地方,对象缓冲池机制(具体实现思路在后面会讲到).
- 为所维护的元素列表申请内存:申请大小为`size * sizeof(PyObjetc *)`的内存.

创建结束会有:

- `PyListObject.ob_size == size`
- `PyListObject.allocated == size`

## 设置

假设我们第一次通过`PyList_New(6)`创建一个`PyListObject`对象,它的内存分配如下(正常情况下,不会有`NULL`):

![](/images/pylistobject1.png)

如果尝试把一个整数对象`100`放到第4个位置,也就是`list[3]=100`,Python内部会调用:

```c
[Objects/listobject.c]

int
PyList_SetItem(PyObject *op, Py_ssize_t i,
               PyObject *newitem)
{
    PyObject **p;
      /* 类型检查 */
    if (!PyList_Check(op)) {
        Py_XDECREF(newitem);
        PyErr_BadInternalCall();
        return -1;
    }
    /* 索引检查 */
    if (i < 0 || i >= Py_SIZE(op)) {
        Py_XDECREF(newitem);
        PyErr_SetString(PyExc_IndexError,
                        "list assignment index out of range");
        return -1;
    }
    /* 引用调整 */
    p = ((PyListObject *)op) -> ob_item + i;
    Py_XSETREF(*p, newitem);
    return 0;
}
```

在Python中运行`list[3] = 100`时,首先会进行类型检查和索引有效性检查,如果通过就会把对象`100`的`PyObject *`指针:
```c
#define Py_XSETREF(op, op2)                     \
    do {                                        \
        PyObject *_py_tmp = (PyObject *)(op);   \
        (op) = (op2);                           \
        Py_XDECREF(_py_tmp);                    \
    } while (0)
```

这里的`do while(0)`结构不代表循环, 这是编写宏的小技巧, 在以后的源码阅读中经常会出现. 

可以看到指针修改的过程又分为两步:

- 先是把新的对象`100`的指针放在了该位置上
- 调用`Py_XDECREF`将原来存放的对象的引用减一, 可能会遇到原来对象是`NULL`的情况.

现在,`PyListObject`的情形应该变成这样了:

![](/images/pylistobject2.png)

## 插入

插入和设置不同,插入会导致`ob_item`维护的内存发生变化.

```c
[Objects/listobject.c]
int
PyList_Insert(PyObject *op, Py_ssize_t where, PyObject *newitem)
{
    if (!PyList_Check(op)) {  /* 类型检查 */
        PyErr_BadInternalCall();
        return -1;
    }
    return ins1((PyListObject *)op, where, newitem);
}


static int
ins1(PyListObject *self, Py_ssize_t where, PyObject *v)
{
    Py_ssize_t i, n = Py_SIZE(self);
    PyObject **items;
    if (v == NULL) {  /* 插入元素为NULL */
        PyErr_BadInternalCall();
        return -1;
    }
    if (n == PY_SSIZE_T_MAX) { /* 内存已满 */
        PyErr_SetString(PyExc_OverflowError,
            "cannot add more objects to list");
        return -1;
    }
    /* 调整元素列表容量 */
    if (list_resize(self, n+1) < 0)
        return -1;
    /* 对索引进行修正 */
    if (where < 0) {
        where += n;
        if (where < 0)
            where = 0;
    }
    if (where > n)
        where = n;
    /* 插入元素 */
    items = self->ob_item;
    for (i = n; --i >= where; )
        items[i+1] = items[i];
    Py_INCREF(v);
    items[where] = v;
    return 0;
}
```

Python在内部使用`PyList_Insert`执行插入操作,而`PyList_Insert`实际调用的是`insl`,在插入元素时,Python会先做一些类型检查以及`list`大小是否达到`PY_SSIZE_T_MAX`.

为确保`list`中有足够的位置容纳新的元素,Python会通过`list_resize`调整列表大小.

```c
static int
list_resize(PyListObject *self, Py_ssize_t newsize)
{
    PyObject **items;
    size_t new_allocated;
    Py_ssize_t allocated = self->allocated;

    /* 不需要重新分配内存 */
    if (allocated >= newsize && newsize >= (allocated >> 1)) {
        assert(self->ob_item != NULL || newsize == 0);
        Py_SIZE(self) = newsize;
        return 0;
    }

    /* 计算一个增长趋势 */
    new_allocated = (newsize >> 3) + (newsize < 9 ? 3 : 6);

    /* 检查是否数值溢出 */
    if (new_allocated > SIZE_MAX - newsize) {
        PyErr_NoMemory();
        return -1;
    } else {
        new_allocated += newsize;
    }

    if (newsize == 0)
        new_allocated = 0;
    /* 需要重新分配内存 */
    items = self->ob_item;
    if (new_allocated <= (SIZE_MAX / sizeof(PyObject *)))
        PyMem_RESIZE(items, PyObject *, new_allocated);
    else
        items = NULL;
    if (items == NULL) {
        PyErr_NoMemory();
        return -1;
    }
    self->ob_item = items;
    Py_SIZE(self) = newsize;
    self->allocated = new_allocated;
    return 0;
}

```

在`list_resize`在很多对列表的修改中都会调用,它调整列表分两种情况:

- `new_size`在`[allocated/2, allocated]`区间内,Python不会修改内存,只是简单的将`ob_size`修改为`new_size`;
- 如果不在这个区间,会调用`realloc`重新分配内存.其中`new_size<allocated/2`会导致列表的内存空间收缩.<br>
    Python在计算新申请的内存时使用式子`(newsize >> 3) + (newsize < 9 ? 3 : 6)`来保证内存开辟有一个温和的增长趋势, 避免频繁的调用`realloc`.

现在回到元素的插入上来,在`list_resize`调整列表大小过后,Python会对传进来的索引位置`n`进行修正,也就是我们可以使用"负索引":
对于`list:l[n]`,`l[-1]`也就相当于`l[n-1]`.

和C中的`vector`的插入一样,会把插入位置以及之后的所有元素往后移一位,插入位置设置为我们需要插入的元素.

所以对于`PyList_New(6)`创建的`list`,执行一次插入`PyList_Insert()`操作后:`allocated=10  ob_size=7`

## 追加

和插入操作一样,Python中列表的`append()`操作对应`PyList_Append`,在内部也会调用一个函数`app1`:

```c
[Objects/listobject.c]
static int
app1(PyListObject *self, PyObject *v)
{
    Py_ssize_t n = PyList_GET_SIZE(self);
    /* 省略掉了检查 */ 
    if (list_resize(self, n+1) < 0) /* 调整大小 */
        return -1;
    Py_INCREF(v); /* 引用计数加一 */
    PyList_SET_ITEM(self, n, v); /* 设置操作 */
    return 0;
}
```

在进行append操作时,也会先调用`list_size`调整列表大小,然后使用设置操作在`ob_size`设置值(不是`allocated`).

## 删除

删除也是一个常用操作,当Python执行`remove`时,`PyListObject`中的`listremove`操作会被激活:

```c
[Objects/listobject.c]
static PyObject *
listremove(PyListObject *self, PyObject *v)
{
    Py_ssize_t i;
    for (i = 0; i < Py_SIZE(self); i++) {
        int cmp = PyObject_RichCompareBool(self->ob_item[i], v, Py_EQ);
        if (cmp > 0) {
            if (list_ass_slice(self, i, i+1,
                               (PyObject *)NULL) == 0)
                Py_RETURN_NONE;
            return NULL;
        }
        else if (cmp < 0)
            return NULL;
    }
    PyErr_SetString(PyExc_ValueError, "list.remove(x): x not in list");
    return NULL;
}
```

删除操作会遍历整个列表,将待删除元素和每一个元素比较,若果找到就删除该元素,否则返回错误.

内部的删除操作是调用`list_ass_slice`完成的:

```c
/* a[ilow:ihigh] = v if v != NULL.
 * del a[ilow:ihigh] if v == NULL.
 *
 * Special speed gimmick:  when v is NULL and ihigh - ilow <= 8, it's
 * guaranteed the call cannot fail.
 */
static int
list_ass_slice(PyListObject *a, Py_ssize_t ilow, Py_ssize_t ihigh, PyObject *v)
```

这个函数不仅仅用来删除元素, 当传入进来的参数`v==NULL`时,会进行删除(`remove`)操作(通过`memmove`内存搬移实现); 当`v!=NULL`时, 会进行替换(`replace`)操作. Python中的切片赋值就执行这个操作:
```python
>>> l = [1, 2, 3,4]
>>> l[1:3] = ['a', 'b']
>>> l[1:2] = []
>>> l
[1, 'b', 4]
```

## 销毁和对象缓冲池

在创建`PyListObject`对象的时候, 我们提过"对象缓冲池"的概念.
```c 
[Objects/listobject.c]
#ifndef PyList_MAXFREELIST
#define PyList_MAXFREELIST 80
#endif
static PyListObject *free_list[PyList_MAXFREELIST];
static int numfree = 0;

PyObject *
PyList_New(Py_ssize_t size)
{   
    ....
    if (numfree) {
        numfree--;
        op = free_list[numfree];
        _Py_NewReference((PyObject *)op);
    #ifdef SHOW_ALLOC_COUNT
        count_reuse++;
    #endif
    }
    ...
```

可以看到`free_list`中维护一个缓冲池(最大为80), 创建对象的时候会先检查里面是否有空闲对象`numfree>0`, 若有就直接从里面获取, 不会新建一个`PyListObject`.

那么`PyListObject`对象是什么时候加入到缓冲池中去的呢? 答案是销毁一个`PyListObject`时, 下面是它的`list_dealloc`方法:

```c
static void
list_dealloc(PyListObject *op)
{
    Py_ssize_t i;
    PyObject_GC_UnTrack(op);
    Py_TRASHCAN_SAFE_BEGIN(op)
    if (op->ob_item != NULL) {
        /* Do it backwards,  for Christian Tismer.
           There's a simple test case where somehow this reduces
           thrashing when a *very* large list is created and
           immediately deleted. */
        i = Py_SIZE(op);
        while (--i >= 0) {
            Py_XDECREF(op->ob_item[i]);
        }
        PyMem_FREE(op->ob_item);
    }
    if (numfree < PyList_MAXFREELIST && PyList_CheckExact(op))
        free_list[numfree++] = op;
    else
        Py_TYPE(op)->tp_free((PyObject *)op);
    Py_TRASHCAN_SAFE_END(op)
}
```

和创建一个`PyListObject`相对应的, 在调用`list_dealloc`也分为两步:

- 会先减少里面保存的元素的引用计数, 对于引用计数减到`0`的对象, 自然会触发对象的销毁机制. 这一部分, 在"垃圾回收篇"还会讲到.
- 第二步是`PyListObject`自身的去留: 如果`free_list`没有满, 并且是`list`对象, 那么这个对象会被加入到缓存`free_list`中去, 供循环利用; 否则会使用`tp_free`释放掉这块内存.

## 总结

- 列表对象有`ob_size`和`allocated`两个概念;
- 列表对象本身的缓冲池`free_list`;
- 列表的大小的调整