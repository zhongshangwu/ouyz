---
title: Python源码阅读-import机制
abbrlink: 5a3f63f9
date: 2018-01-11 20:40:47
tags:
    - 源码
    - Python
categories: Python
---

## import指令

`import`有两种形式:

- `import ...`
- `from ... import ...`

我们从简单的`import sys`开始，看看背后都发生了什么：

<!-- more -->

```python
import sys
# 0 LOAD_CONST               0 (0)
# 2 LOAD_CONST               1 (None)
# 4 IMPORT_NAME              0 (sys)
# 6 STORE_NAME               0 (sys)
```

关键的`IMPORT_NAME 0`指令：

```c
names = co->co_names;

TARGET(IMPORT_NAME) {
    PyObject *name = GETITEM(names, oparg); /* 从co->const常量表中获取"sys" */
    PyObject *fromlist = POP(); /* None */
    PyObject *level = TOP(); /* 0 */
    PyObject *res;
    res = import_name(f, name, fromlist, level); /* f是frame */
    SET_TOP(res);
    DISPATCH();
}
```

在`IMPORT_NAME`指令中首先获取到了几个参数，然后调用`import_name`导入模块，并通过`SET_TOP`将模块对象压入栈顶，最终指令`STORE_NAME`将把模块对象存入命名空间中。

```c
static PyObject *
import_name(PyFrameObject *f, PyObject *name, PyObject *fromlist, PyObject *level)
{
    _Py_IDENTIFIER(__import__);
    PyObject *import_func, *res;
    PyObject* stack[5];
    /* 获取builtins模块的__import__函数*/
    import_func = _PyDict_GetItemId(f->f_builtins, &PyId___import__);
    /* 如果用户没有重写import_func */
    if (import_func == PyThreadState_GET()->interp->import_func) {
        int ilevel = _PyLong_AsInt(level);
        res = PyImport_ImportModuleLevelObject(
                        name,
                        f->f_globals,
                        f->f_locals == NULL ? Py_None : f->f_locals,
                        fromlist,
                        ilevel);
        return res;
    }
}
```

`import_name`函数首先从全局命名空间`builtins`(默认就是`builtins`模块的`md_dict`)中获取`__import__`函数。这个函数是对`builtin___import__`函数指针的包装，虚拟机会检查程序员是否对这个函数进行了重写, 如果没有重写(这里我们只考虑没有重写的情况), 就调用`PyImport_ImportModuleLevelObject`导入模块. 

`PyImport_ImportModuleLevelObject`函数的实现十分复杂, 这里列出了精简后的代码:

```c
PyObject *
PyImport_ImportModuleLevelObject(PyObject *name, PyObject *globals,
                                 PyObject *locals, PyObject *fromlist,
                                 int level)
{
    _Py_IDENTIFIER(_find_and_load);
    _Py_IDENTIFIER(_handle_fromlist);
    PyObject *abs_name = NULL;
    PyObject *final_mod = NULL;
    PyObject *mod = NULL;
    PyObject *package = NULL;
    PyInterpreterState *interp = PyThreadState_GET()->interp; /* 获取进程状态对象 */
    int has_from;

    if (level > 0) {
        abs_name = resolve_name(name, globals, level); /* 解析模块的绝对路径 */
    }
    else {  /* level == 0 */
        abs_name = name;
    }

    mod = PyDict_GetItem(interp->modules, abs_name); /* 尝试从全局的interp->modules中获取模块 */
    if (mod != NULL && mod != Py_None) {
        _Py_IDENTIFIER(__spec__);
        _Py_IDENTIFIER(_initializing);
        _Py_IDENTIFIER(_lock_unlock_module);
        PyObject *value = NULL;
        PyObject *spec;
        int initializing = 0;

        spec = _PyObject_GetAttrId(mod, &PyId___spec__);
        if (spec != NULL) {
            value = _PyObject_GetAttrId(spec, &PyId__initializing);
        }
        if (value == NULL)
            PyErr_Clear();
        else {
            initializing = PyObject_IsTrue(value);
            if (initializing == -1)
                PyErr_Clear();
            if (initializing > 0) {
                value = _PyObject_CallMethodIdObjArgs(interp->importlib,
                                                &PyId__lock_unlock_module, abs_name,
                                                NULL);
            }
        }
    }
    else { /* 模块第一次加载 */
        mod = _PyObject_CallMethodIdObjArgs(interp->importlib,
                                            &PyId__find_and_load, abs_name,
                                            interp->import_func, NULL);
    }
    /* 处理from ... import ... 形式的导入 */
    has_from = 0;
    if (fromlist != NULL && fromlist != Py_None) {
        has_from = PyObject_IsTrue(fromlist);
        if (has_from < 0)
            goto error;
    }
    if (!has_from) { /* 不是from ... 格式 */
        Py_ssize_t len = PyUnicode_GET_LENGTH(name);
        if (level == 0 || len > 0) {
            Py_ssize_t dot;
            /* 查找是否包含".", 有则返回索引,否则返回-1 */
            dot = PyUnicode_FindChar(name, '.', 0, len, 1);
            if (dot == -1) { /* */
                final_mod = mod;
                goto error;
            }

            if (level == 0) {
                PyObject *front = PyUnicode_Substring(name, 0, dot);
                if (front == NULL) {
                    goto error;
                }

                final_mod = PyImport_ImportModuleLevelObject(front, NULL, NULL, NULL, 0);
            }
            else {
                Py_ssize_t cut_off = len - dot;
                Py_ssize_t abs_name_len = PyUnicode_GET_LENGTH(abs_name);
                PyObject *to_return = PyUnicode_Substring(abs_name, 0,
                                                        abs_name_len - cut_off);
                if (to_return == NULL) {
                    goto error;
                }

                final_mod = PyDict_GetItem(interp->modules, to_return);
                Py_DECREF(to_return);
                if (final_mod == NULL) {
                    PyErr_Format(PyExc_KeyError,
                                 "%R not in sys.modules as expected",
                                 to_return);
                    goto error;
                }
                Py_INCREF(final_mod);
            }
        }
        else {
            final_mod = mod;
            Py_INCREF(mod);
        }
    }
    else {
        final_mod = _PyObject_CallMethodIdObjArgs(interp->importlib,
                                                  &PyId__handle_fromlist, mod,
                                                  fromlist, interp->import_func,
                                                  NULL);
    }
  error:
    if (final_mod == NULL)
        remove_importlib_frames();
    return final_mod;
}
```

在导入模块时, Python会先尝试从全局的`interp->modules`集合(即`sys.modules`)中获取模块. 如果模块缓存中存在, Python还会检查模块是否处于初始化状态中, 如果模块正在初始化(其它线程), 那么会调用`_lock_unlock_module`等待锁的释放(`import`动作需要加锁). 

我们可以看到Python3中, `import`的实现是`importlib`. 比较特殊的是在Python内部, 通过文件`_freeze_importlib.c`将以Python实现的`importlib/_bootstrap.py`转换成了字节码序列的形式在内部执行.

```c
const unsigned char _Py_M__importlib[] = {
    99,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,
    ...
}
```

和在`sys.modules`缓存中找到模块对应, 如果模块是第一次加载, 则会调用`_find_and_load`导入模块.