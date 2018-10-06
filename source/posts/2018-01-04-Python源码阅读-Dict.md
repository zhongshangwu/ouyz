---
title: Python源码阅读-Dict
abbrlink: 92346aeb
date: 2018-01-04 13:01:20
tags:
  - 源码
  - Python
categories: Python
---

## 存储策略

Python中字典的实现策略:

1. 底层使用散列表进行存储

<!-- more -->
2. 开放定址发检测冲突
    - 插入：发生冲突，通过二次探测算法，寻找下一个位置，直到找到可用位置，插入元素(构成一条”探测链“)。
    - 查找：需要遍历“探测链”；
    - 删除：如果对象在“探测链”上，不能直接删除元素，会导致探测链上的下个元素找不到，采用标记删除技术。

## 定义

### PyDictEntry

Python2中使用`PyDictEntry`定义一对`key-value`键值对：

```c
typedef struct {
	/* Cached hash code of me_key.  Note that hash codes are C longs.
	 * We have to use Py_ssize_t instead because dict_popitem() abuses
	 * me_hash to hold a search finger.
	 */
	Py_ssize_t me_hash;
	PyObject *me_key;
	PyObject *me_value;
} PyDictEntry;
```

在一个`PyDictEntry`的生存变化过程中，`entey`会在几个状态之间切换：

- `Unused`：当一个`entry`的`me_key`和`me_value`都是`NULL`时，`entry`处于`Unused`态。每个`entry`初始化时会处于这个状态，而且只有`Unused`态下，`me_key`才会为`NULL`。

- `Active`：当`entry`中存储着一对`me_key`和`me_value`时，`entry`处于`Active`态，在这个状态下，`me_key`和`me_value`都不能为`NULL`。

- `Dummy`：当删除一个键值对时，`entry`不能直接删除，这个时候`me_key`指向`dummy`对象，`entry`进入`Dummy`态。

### PyDictObject

Python2中字典的实现是`PyDictObject`，它是一堆`PyDictEntry`集合：

```c
typedef struct _dictobject PyDictObject;
struct _dictobject {
    PyObject_HEAD
    Py_ssize_t ma_fill;  /* 元素个数 Active + # Dummy */
    Py_ssize_t ma_used;  /* 元素个数 Active */

    /* The table contains ma_mask + 1 slots, and that's a power of 2.
    * We store the mask instead of the size because the mask is more
    * frequently needed.
    */
    Py_ssize_t ma_mask;

    /* ma_table points to ma_smalltable for small tables, else to
    * additional malloc'ed memory.  ma_table is never NULL!  This rule
    * saves repeated runtime null-tests in the workhorse getitem and
    * setitem calls.
    */
    PyDictEntry *ma_table;
    PyDictEntry *(*ma_lookup)(PyDictObject *mp, PyObject *key, long hash);
    PyDictEntry ma_smalltable[PyDict_MINSIZE];
};
```

其中：

- `ma_fill`：维护着从`PyDictObject`创建开始直到现在，曾经及正处于`Active`态的`entry`；
- `ma_used`：维护着当期处于`Active`态的`entry`；
- `ma_smalltable`：当一个`PyDictObject`对象创建时，至少有`PyDict_MINSIZE`(8)个`entry`同时创建；
- `ma_table`：指向一片作为`PyDictEntry`集合的内存开始地址。Python对于一个小`dict`(即`entry`少于8个)，`ma_table`指向`ma_smalltable`，否则会申请一片额外的内存，并将`ma_table`指向它。(这个策略可以避免对`ma_table`的有效性检查);
- `ma_mask`：字典拥有的`entry`数量减一， 在将hash值映射到散列表上需要用到这个值；
- `ma_lookup`：字典的搜索策略。

## 创建

```c
[Objects/dictobject.c]
#define INIT_NONZERO_DICT_SLOTS(mp) do {				\
	(mp)->ma_table = (mp)->ma_smalltable;				\
	(mp)->ma_mask = PyDict_MINSIZE - 1;				\
    } while(0)

#define EMPTY_TO_MINSIZE(mp) do {					\
	memset((mp)->ma_smalltable, 0, sizeof((mp)->ma_smalltable));	\
	(mp)->ma_used = (mp)->ma_fill = 0;				\
	INIT_NONZERO_DICT_SLOTS(mp);					\
    } while(0)

PyObject *
PyDict_New(void)
{
    register dictobject *mp;
    /* dummy key */
    if (dummy == NULL) { /* Auto-initialize dummy */
        dummy = PyString_FromString("<dummy key>");
        if (dummy == NULL)
            return NULL;
    }
    /* 缓冲池机制 */
    if (num_free_dicts) { /* 从缓冲池中去最后一个空闲对象 */
        mp = free_dicts[--num_free_dicts];
        _Py_NewReference((PyObject *)mp);
        if (mp->ma_fill) {
            EMPTY_TO_MINSIZE(mp);
        } else {
            /* 3. ma_table -> ma_smalltable */
            /* 4. ma_mask = PyDict_MINSIZE - 1 = 7 */
            INIT_NONZERO_DICT_SLOTS(mp);
        }
    } else { /* 创建PyDictObject对象 */
        mp = PyObject_GC_New(dictobject, &PyDict_Type);
        if (mp == NULL)
            return NULL;
        EMPTY_TO_MINSIZE(mp);
    }
    mp->ma_lookup = lookdict_string;

    _PyObject_GC_TRACK(mp);
    return (PyObject *)mp;
}
```

可以看到Python在创建`PyDictObject`会确保`dummy`的存在(这是一个特殊字符串)

和列表相同，字典也使用了缓冲池机制，如果缓冲池有空闲对象，就会从里面获取一个并进行清空操作：

- `EMPTY_TO_MINSIZE`：将`small_table`清零，`ma_size=ma_fill=0`。
- `INIT_NONZERO_DICT_SLOTS`：将`ma_table`指向`small_table`，并设置`ma_mask=7`；

在创建的最后，`lookdict_string`赋予给了`ma_lookup`，它指定了字典的搜索策略。

## 搜索策略

Python 为字典提供了两种搜索策略：`lookdict`和`lookdict_string`(针对`PyStringObject`对象的特殊形式)。由于把字符串作为字典的键十分普遍，Python将`lookdict_string`作为字典的默认搜索策略。

在这里，我们还是看更一般的`lookdict`的实现：

```c

static dictentry *
lookdict(dictobject *mp, PyObject *key, register long hash)
{
    register size_t i;
    register size_t perturb;
    register dictentry *freeslot;
    register size_t mask = (size_t)mp->ma_mask;
    dictentry *ep0 = mp->ma_table;
    register dictentry *ep;
    register int cmp;
    PyObject *startkey;

    /* [1].将散列值与mask做位与运算，保证了i落在范围内 */
    i = (size_t)hash & mask;
    ep = &ep0[i]; /* 找到散列表上该位置的元素 */
    /* [2].entry处于Unused态或者key相等(同一个内存地址)，直接返回 */
    if (ep->me_key == NULL || ep->me_key == key)
        return ep; /* 包含两种情况：没找到和第一次散列就找到了 */
    /* [3].Dummy态，设置freeslot */
    if (ep->me_key == dummy)
        freeslot = ep;
    else {
        if (ep->me_hash == hash) {
            startkey = ep->me_key;
            Py_INCREF(startkey);
            cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
            Py_DECREF(startkey);
            if (cmp < 0)
                return NULL;
            if (ep0 == mp->ma_table && ep->me_key == startkey) {
                if (cmp > 0)
                    return ep;
            }
            else {
                /* The compare did major nasty stuff to the
                    * dict:  start over.
                    * XXX A clever adversary could prevent this
                    * XXX from terminating.
                    */
                return lookdict(mp, key, hash);
            }
        }
        freeslot = NULL;
    }

    /* In the loop, me_key == dummy is by far (factor of 100s) the
        least likely outcome, so test for that last. */
    for (perturb = hash; ; perturb >>= PERTURB_SHIFT) {
        i = (i << 2) + i + perturb + 1;
        ep = &ep0[i & mask];
        if (ep->me_key == NULL)
            return freeslot == NULL ? ep : freeslot;
        if (ep->me_key == key)
            return ep;
        if (ep->me_hash == hash && ep->me_key != dummy) {
            startkey = ep->me_key;
            Py_INCREF(startkey);
            cmp = PyObject_RichCompareBool(startkey, key, Py_EQ);
            Py_DECREF(startkey);
            if (cmp < 0)
                return NULL;
            if (ep0 == mp->ma_table && ep->me_key == startkey) {
                if (cmp > 0)
                    return ep;
            }
            else {
                /* The compare did major nasty stuff to the
                    * dict:  start over.
                    * XXX A clever adversary could prevent this
                    * XXX from terminating.
                    */
                return lookdict(mp, key, hash);
            }
        }
        else if (ep->me_key == dummy && freeslot == NULL)
            freeslot = ep;
    }
    assert(0);	/* NOT REACHED */
    return 0;
}
```

