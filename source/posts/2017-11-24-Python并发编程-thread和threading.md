---
title: Python并发编程
tags:
  - Python
  - 并发
categories: Python
abbrlink: 6cd209b1
date: 2017-11-24 22:14:18
---

## Python中的并发

本文主要介绍Python中的并发库：

- thread
- threading
- queue
- multiprocessing
- concurrent.futures
- yield协程
- asyncio
<!-- more -->

## 多线程

Python提供了多个模块来支持多线程编程，包括thread、threading和queue。thread提供了基本的线程和锁定的支持，而threading模块提供了更高级别的，功能更全面的线程管理。使用queue.Queue创建队列，用于线程之间共享。

### __thread__

<center>表-1 thread模块和锁对象</center>

函数/方法|描          述
---|---|
thread.start_new_thread(func, args, kwargs=None)|  派生一个新的线程，使用给定的args和可选的kwargs来执行func
thread.allocate_lock()| 分配LockType所对象
thread.exit()|  给线程退出指令
LockType.accquire(wait=None)| 尝试获取所对象
LockType.locked()|  如果获取了锁对象，则返回True，否则返回False
LockType.release()|  释放锁

### __threading__
<center>表-2 threading模块的对象</center>

对象|描          述
---|---|
Thread| 表示一个执行线程的对象
Lock| 锁原语对象
RLock| 可重入所对象，使用单一线程可以再次获得已持有的锁
Coordition|条件变量对象，使得一个线程等待另一个线程满足特定的条件，比如改变状态或者某个数值
Event|条件变量的通用版本，任意数量线程等待某个事件发生，在该事件发生后所有线程被激活
Semaphore|为线程之间共享的资源提供一个“计数器”，如果没有可用资源则阻塞
BoundedSemaphore|与Semaphore相似，不过允许超过初始值
Timer|与Thread相似，不过它在运行前等待一定时间
Barrier|创建一个“障碍”，必须达到制定数量的线程才能继续

避免使用thread模块，推荐使用更高级别的threading模块的原因：

- threading模块更加先进，有更好的线程支持，并且thread中的某些属性和threading的一些属性存在冲突
- 低级别的thread模块拥有同步原语很少，而threding有很多
- thread模块对于进程何时退出没有做控制。当主进程结束时，其他线程也就结束了，没有清理和警告。

`示例`

```python
import threading
from time import ctime, sleep

loops = [4, 2]

def loop(nloop, nsec):
    print("start loop", nloop, "at:", ctime())
    sleep(nsec)
    print("loop", nloop, "done at:", ctime())

def main():
    print("starting at:", ctime())
    threads = []
    for i in loops:
        thread = treading.Thread(target=loop, args=(i, loops[i]))
        threads.append(thread)
    
    for thread in threads:
        thread.start()
    
    for thread in threads:
        thread.join()
    
    print("all done at:", ctime())

if __name__ == '__main__':
    main()
```
可以得到如下输出
```log
starting at: Sat Nov 25 01:34:01 2017
start loop 0 at: Sat Nov 25 01:34:01 2017
start loop 1 at: Sat Nov 25 01:34:01 2017
loop 1 done at: Sat Nov 25 01:34:03 2017
loop 0 done at: Sat Nov 25 01:34:05 2017
all done at: Sat Nov 25 01:34:05 2017
```

在threading模块中，实例化`Thread`和调用`thread.starat_new_thread`的最大的区别就是新的线程不会立即执行，在线程分配完成过后，可以通过`start`方法启动线程。`join`方法将等待线程结束，或者达到超时时间后结束线程。

- __Thread的创建和启动：__

    - 创建Thread实例，并传递一个函数
    - 创建Thread实例，并传递一个可调用对象
    - 派生Thread的子类，并创建子类的实例

- __Lock和RLock__

    RLock是可重入锁，除了Lock使用的锁定和解锁之外，还“拥有线程”和“递归级别”的概念。一旦线程获得了可重入锁，同一线程可以再次获取它而不阻塞；线程必须每获取一次必须有对应的释放一次，才能彻底释放锁。

- __Condition__

    Condition提供了比Lock, RLock更高级的功能，允许我们能够控制复杂的线程同步问题。Condition内部维护一把锁，默认是RLock，也可以通过构造方法传递，accquire和release操作关联的锁。在获取到锁之后，才可以调用相应的其他方法。

    wait方法释放锁，然后阻塞，直到另一个线程通过调用 notify 或 notify_all唤醒它。一旦被唤醒，wait 重新获取锁并返回。也可以指定超时。

    notify 和 notify_all 方法不释放锁；这意味着被唤醒的线程或线程不会立即从它们的 wait 调用返回，而是只有当调用 notify 或 notify_all 的线程最终放弃锁的所有权时

    可以看个生产者-消费者模式
    ```python
    # Consume one item
    with cv:
        while not an_item_is_available():
            cv.wait()
        get_an_available_item()

    # Produce one item
    with cv:
        make_an_item_available()
        cv.notify()
    ```
    while 循环检查应用程序的条件是必要的，因为 wait() 可以在任意长时间后返回，并且 notify() 调用的条件可能不再成立。这是多线程编程固有的。 wait_for() 方法可以用于自动化条件检查，并且减少超时的计算:
    ```python
    # Consume an item
    with cv:
        cv.wait_for(an_item_is_available)
        get_an_available_item()
    ```

- __Semphore和BoundSemphore__

    对于拥有有限资源的应用来说，使用信号量是个不错的选择。BoundedSemphore实现有界信号对象，能保证信号量的释放次数不会大于信号量初始的值。

- __Event__

    事件对象是线程之间通信的最简单机制之一：一个线程表示事件，而其他线程等待它。事件对象管理内部标志，set方法设置为True，clear设置为False，另外wait将阻塞直到另外一个线程调用set将标志设置为True，或者等待可选的超时发生。

- __Barrier__

    这个类提供了一个简单的同步原语，供需要彼此等待的固定数量的线程使用。每个线程尝试通过调用 wait 方法通过屏障，并将阻塞，直到所有线程都已调用。在这一点上，线程被同时释放。

- __在with语句中使用lock，condition和semphore：__

    threading模块提供的所有实现了accquire和release方法的对象，都实现了上下文管理器，在进入时accquire，退出时release。

### __Queue__

在生产者消费者场景下，可以通过queue/Queue模块提供的队列数据结构，进行安全的交换数据。

可以实现一个简单的实例：
```python
from threading import Thread
from queue import Queue
from time import sleep
from random import randint


queue = Queue(32)


def consumer():
    ''' 消费者 '''
    while True:
        queue.get('xxx')
        # do something
        print("consuming from queue...size now:", queue.qsize())
        sleep(randint(2, 5))


def producer():
    ''' 生产者 '''
    while True:
        queue.put('xxx', block=True)
        print("producing to queue...size now:", queue.qsize())
        sleep(randint(1, 3))


if __name__ == '__main__':
    consumers = []
    producers = []

    for i in range(2):
        thread = Thread(target=consumer)
        consumers.append(thread)
        thread = Thread(target=producer)
        producers.append(thread)
    
    for c, p in zip(consumers, producers):
        c.start()
        p.start()

    for c, p in zip(consumers, producers):
        c.join()
        p.join()
```
```code
producing to queue...size now: 1
consuming from queue...size now: 0
producing to queue...size now: 1
consuming from queue...size now: 0
producing to queue...size now: 1
producing to queue...size now: 2
producing to queue...size now: 3
consuming from queue...size now: 2
consuming from queue...size now: 1
producing to queue...size now: 2
producing to queue...size now: 3
producing to queue...size now: 4
```

### 怎么结束线程

### join方法

## 多进程

多进程模块`mutilprocessing`有着类似`threading`相似的接口API。

### GIL是什么？
<!-- more -->
GIL的全称是Global Interpreter Lock(全局解释器锁)，在Python语言的实现CPython中，一个防止多线程并发执行机器码的一个Mutex，并不是 Python 的一个特性。

在解释器解释执行任何 Python 代码时，都需要先获得这把锁才行当一个线程开始sleep或者进行I/O操作时，另一个线程就有机会拿到GIL锁，开始执行它的代码。这就是cooperative multitasking(协作式多任务处理)。

同时CPython也有preemptive multitasking(抢占式多任务处理)的机制：在Python2采用ticks计步，当一个线程无中断地运行了100个字节码(可以通过sys.getcheckinterval()查看)，或者在Python3中，新的GIL实现中用一个固定的超时时间来指示当前的线程放弃全局锁。在当前线程保持这个锁，且其他线程请求这个锁时，当前线程就会在5毫秒后被强制释放该锁。

### 一个例子

```python
import time
from threading import Thread

def countdown(n):
    while n > 0:
        n -= 1

if __name__ == '__main__':
    s = time.time()
    for i in range(2):
        countdown(100000000)
    print("use time:", time.time() - s)
```
单线程下执行耗时:`use time: 11.602031946182251`
```python
import time
from threading import Thread

def countdown(n):
    while n > 0:
        n -= 1


if __name__ == '__main__':
    s = time.time()
    threads = []
    for i in range(2):
        thread = Thread(target=countdown, args=(100000000, ))
        thread.start()
        threads.append(thread)
    for thread in threads:
        thread.join()
    print("use time:", time.time() - s)
```
两个并发线程下执行耗时：`use time: 11.905225038528442`，可以看到Python多线程并不能能提高效率，线程进行锁竞争、切换线程，一定程度上还会消耗资源。

解决GIL问题的方法：

- 使用多线程在解决IO密集型任务，能有效规避GIL
- 使用C扩展，在C扩展里面能够创建原生线程。
- 使用mutilprocessing模块，使用多进程替换多线程。

```python
from multiprocessing import Process
import time

def countdown(n):
    while n > 0:
        n -= 1

if __name__ == '__main__':
    s = time.time()
    processes = []
    for i in range(2):
        process = Process(target=countdown, args=(100000000, ))
        processes.append(process)
        process.start()
    for process in processes:
        process.join()
    print("use time:", time.time() - s)
```
在多进程下，执行时间为：`use time: 5.931055545806885`，可以发现执行时间大幅度减少了。

- __Process__

    Process有着类似Thread的API，只是从线程换成了进程。

- __进程间交换对象__   
    支持进程之间的两种类型的通信信道

    - 队列。
    - 管道。

- __进程同步__  

    multiprocessing 包含来自 threading 的所有同步原语的等同物。

- __共享状态__  

    当进行并发编程时，通常最好避免使用尽可能共享的状态。在使用多个进程时尤其如此。
    然而，如果你真的需要使用一些共享数据，那么 multiprocessing 提供了这样做的几种方法
    - 共享内存。提供Array和Value类，另外 multiprocessing.sharedctypes 模块支持创建从共享内存分配的任意ctpyes对象。
    - 服务器进程。Manager()返回的管理器对象控制一个服务器进程， 返回的管理器将支持类型 list，dict，Namespace，Lock，RLock，Semaphore，BoundedSemaphore，Condition，Event，Barrier，Queue，Value 和 Array。此外，单个管理器可以由网络上不同计算机上的进程共享。但是，它们比使用共享内存慢。

- __进程池__   

    Pool 类控制可以提交作业的工作进程池。它支持具有超时和回调的异步结果，并具有并行映射实现。

## concurrent.futures


concurrent.futures是Python3增加的一个异步并发库，提供了ThreadPoolExecutor和ProcessPoolExecutor两个池的类，实现了对threading和multiprocessing的进一步封装，对于用户来讲，可以不用直接动手处理线程、进程和队列等底层基础设施。
<!-- more -->
concurrent.futures的源码只有三个文件：`base.py`，`thread.py`和`process.py`，通过Executor和Future对外暴露API。

### Executor类

Executor有两个实现：ThreadPoolExecutor和ProcessPoolExecutor，两个类的逻辑代码大致相同，只是分别对线程池(threading)和进程池(multiprocessing)进行实现，同事内部维护一个工作队列(queue.Queue)。

- __实现上下文管理协议__

    Executor实现了`__enter__`和`__exit__`两个方法，可以使用如下用法：
    ```python
    with concurrent.futures.ThreadPoolExecutor(max_workers) as executor:
        pass
    ```

- __Executor.submit()__

    ```python
    def submit(self, fn, *args, **kwargs):
        with self._shutdown_lock:
            if self._shutdown:
                raise RuntimeError('cannot schedule new futures after shutdown')

            f = _base.Future()
            w = _WorkItem(f, fn, args, kwargs)

            self._work_queue.put(w)
            self._adjust_thread_count()
            return f
    ```
    使用submit方法往池中添加一个任务`fn`，submit方法返回一个Future对象。

- __Executor.map()__
    ```python
    def map(self, fn, *iterables, timeout=None, chunksize=1):
        if timeout is not None:
            end_time = timeout + time.time()

        fs = [self.submit(fn, *args) for args in zip(*iterables)]

        def result_iterator():
            try:
                for future in fs:
                    if timeout is None:
                        yield future.result()
                    else:
                        yield future.result(end_time - time.time())
            finally:
                for future in fs:
                    future.cancel()
        return result_iterator()
    ```
    使用`map`方法返回一个`Future生成器`，对该生成器迭代将调用`result`获取结果。

### Future类

> 期物
在《流畅的Python》中，译者将`future`翻译成期物，用来表示可能已经发生或者尚未完成的延迟计算。
由于期物表示终将发成的事情，而确定某件事情会发生的唯一方式就是执行时间已经排定，所以应该把排定某件事情交个框架来做，并实例化`Future`，而不是自己来创建期物。
有几个概念具有相似的作用和语义：concurrent.futures.Future类、asyncio.Future类、Twisted中的Deffered类、Tornado中的Future类以及JavaScript中的Promise对象。

- __状态__
    并发框架在期物表示的延迟计算结束后会改变期物的状态，客户端不应该主动做修改，可以通过几个方法来获取状态：

    - `running()`
    - `canceled`
    - `done`

    这个几个方法不会阻塞，返回布尔值，表明期物所处于的状态。对于客户端来说，一般不会主动来查询这个状态，而是通过`add_done_callback`来添加回调方法(参数为期物本身)，等待通知。
    ```python
    def add_done_callback(self, fn):
        with self._condition:  # 使用threading模块的Condition条件对象。
            if self._state not in [CANCELLED, CANCELLED_AND_NOTIFIED, FINISHED]:
                self._done_callbacks.append(fn)
                return
        fn(self)
    ```

- __Future.result()__

    在期物代表的延迟计算运行结束后，`result()`方法将返回可调用对象的结果。如果期物没有运行完成，那么这个方法将会阻塞调用该方法的线程，可以接收可选的`timeout`参数。
    ```python
    def result(self, timeout=None):
        with self._condition:
            if self._state in [CANCELLED, CANCELLED_AND_NOTIFIED]:
                raise CancelledError()
            elif self._state == FINISHED:
                return self.__get_result()

            self._condition.wait(timeout)

            if self._state in [CANCELLED, CANCELLED_AND_NOTIFIED]:
                raise CancelledError()
            elif self._state == FINISHED:
                return self.__get_result()
            else:
                raise TimeoutError()
    ```

### 其他辅助函数

- __as_completed()__

- __wait()__

<!-- 1). waiter 类。

class _Waiter(object):
class _AsCompletedWaiter(_Waiter):
class _FirstCompletedWaiter(_Waiter):
class _AllCompletedWaiter(_Waiter):

_Waiter 类用来等待 Future 执行完，_Waiter 里定义了 threading.Event()，_AsCompletedWaiter 每个 Future 完成都会触发 event.set()，_FirstCompletedWaiter 每个 Future 完成也会触发，_AllCompletedWaiter 会等所有 Future 完成才触发 event.set()。

另外，_AsCompletedWaiter 和 _AllCompletedWaiter 还有把锁 threading.Lock()。

2). 辅助函数。

def _create_and_install_waiters(fs, return_when):
def as_completed(fs, timeout=None):
def wait(fs, timeout=None, return_when=ALL_COMPLETED):

_create_and_install_waiters 是对 Future 列表 fs 创建和安装 waiter，创建好响应的 waiter 之后，会对 fs 中的每一个 Future 增加此 waiter (Future 有个列表变量 _waiters，加入即可)，并且返回此 waiter；

as_completed 是一个生成器，配合 for 使用可以循环得到已经完成的 Future，as_completed 使用了 _create_and_install_waiters；

wait 用于等待 Future 列表依次完成。 -->

## 协程

在以往的Python并发编程中，大多使用多进程/多线程模型，
Python的多线程由于GIL的限制，无法发挥多核CPU的能力，并且python的线程是内核级线程，抢占锁和线程上下文切换存在大量的开销。对于IO密集性任务来说，还有一个更好的选择那就是协程。

### 协程(Coroutine)简介

> Coroutines are computer program components that generalize subroutines for non-preemptive multitasking, by allowing multiple entry points for suspending and resuming execution at certain locations.

从维基百科上的定义上看，协程可以理解为流程控制，能够在特定位置暂停和恢复执行协作式多任务编程。协程运行在单线程中，避免了线程上下文切换的开销，属于用户态线程。

对于python生成器中的`yield`来说，具有`产出和让步`的语意：yield item产出一个值，提供next()的调用方，并且作出让步。

协程的底层框架在“PEP 342”中定义，在生成器API中增加了`send()`方法，生成器的调用方可以使用`send(...)`发送数据，发送的数据将成为生成器函数yeild表达式的值，因此，生成器可以作为协程来使用。除此之外，还添加了`throw()`和`close()`方法，前者的作用是让调用方抛出异常，在生成器中处理，后者的作用是终止生成器。在“PEP 380”中对生成器函数做了两处改动以更好的支持协程：

- 生成器函数可以返回一个值。以前在生成器函数中给return语句提供值，会抛出`SyntaxError`异常。
- 引入`yeild from`语法，可以把复杂生成器重构为小型的生成器。

### 一个基本的协程演示

```python
>>> def simple_coroutine():
...     print("coroutine started...")
...     x = yield
...     print('coroutine received:', x)
... 
>>> my_coro = simple_coroutine()
>>> next(my_coro)
coroutine started...
>>> my_coro.send(42)
coroutine received: 42
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
```
可以使用`inspect.getgenratorstate()`，查看当前处于的状态：

- `GEN_CREATED`等待开始执行
- `GEN_RUNNING`解释器正在执行
- `GEN_SUSPENDED`在yield表达式处暂停
- `GEN_CLOSED`执行结束

调用方可以使用`send()`方法发送数据给生成器，参数将成为暂停yield表达式的值。只有暂停状态下的生成器才可以发送数据。
最先使用`next(my_coro)`”预激“协程，使生成器运行到yield处，作为活跃的协程使用。

### 抛出异常和停止

- 如果协程中抛出的异常，没有在协程内部处理掉，那么异常将会向上冒泡给`next()`或`send()`调用方。
- `throw`方法。致使生成器在`暂停yield表达式处`抛出指定异常。如果生成器处理了异常，代码将继续执行到下一个yield表达式处，并且产生的值作为`throw()`的返回值；若没有处理异常，那么异常将向上冒泡到调用处。
- `close`方法。致使生成器在`暂停的yield表达式`处抛出`Generator`异常。如果生成器没有处理这个异常，或者抛出了`StopInteration`异常，那么调用方不会报错；如果生成器处理了这个异常，那么一定不能返回值，不然会抛出`RuntimeError`；生成器产生的其他异常将会向上冒泡传给调用方。

### 协程返回值

```python
>>> from collections import namedtuple
>>> Result = namedtuple('Result', 'count average')
>>> def averager():
...     total = 0
...     count = 0
...     while True:
...         item = yield
...         if item == None:
...             break
...         total = item + total
...         count += 1
...     average = total / count
...     return Result(count=count, average=average)
... 
>>> avg_coro = averager()
>>> next(avg_coro)
>>> avg_coro.send(10)
>>> avg_coro.send(20)
>>> avg_coro.send(45)
>>> avg_coro.send(None)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration: Result(count=3, average=25.0)
```
Python3.3实现的”PEP 380“改动中，生成器可以使用`return`返回值。从上面可以看到，`yield`所处的循环中，`yield`产生None值(所以交互式解释器没有打印)，接受一个`None`标志位结束循环，结束协程执行。一如既往，生成器结束将抛出`StopInteration`异常，并将生成器返回值作为异常的`value`属性。

此外，添加的`yield from`结构能够内部处理`StopInteration`异常(这种处理方式和`for`循环处理`StopInteration`异常一样：循环机制使用用户易于理解的方式处理异常)，并将`value`属性的值作为`yield from`表达式的值。


### yield from

一个简单了案例，接受数据生成男生和女生的身高和体重报告：

```python
from collections import namedtuple

Result = namedtuple('Result', 'count average')

# 子生成器
def averager():
    total = 0
    count = 0
    while True:
        item = yield 'tmp'
        if item is None:
            break
        total = total + item
        count += 1
    average = total / count
    return Result(count=count, average=average)

# 委派生成器
def grouper(results, key):
    while True:
        results[key] = yield from averager()
        
# 数据报表
def report(results):
    for key, result in sorted(results.items()):
        group, unit = key.split(';')
        print('{:2} {:5} averaging {:.2f}{}'.format(result.count, group, result.average, unit))

def main(data):
    results = {}
    for key, values in data.items():
        group = grouper(results, key)
        next(group)
        for value in values:
            tmp = group.send(value)
#             print(tmp)
        group.send(None)
        print(results)
    report(results)
        
data = {
    'girls;kg': [40.9, 38.5, 44.3, 43.2, 45.2, 41.7, 44.5, 38.0, 40.6, 44.5],
    'gils;m': [1.6, 1.51, 1.4, 1.3, 1.41, 1.39, 1.33, 1.46, 1.45, 1.43],
    'boys;kg': [39.0, 40.8, 43.2, 40.8, 43.1, 38.6, 41.4, 40.6, 36.3],
    'boys;m': [1.38, 1.5, 1.32, 1.25, 1.37, 1.48, 1.25, 1.49, 1.46]
}

if __name__ == '__main__':
    main(data)
```
运行结果：
```code
{'girls;kg': Result(count=10, average=42.14)}
{'girls;kg': Result(count=10, average=42.14), 'gils;m': Result(count=10, average=1.4279999999999997)}
{'girls;kg': Result(count=10, average=42.14), 'gils;m': Result(count=10, average=1.4279999999999997), 'boys;kg': Result(count=9, average=40.422222222222224)}
{'girls;kg': Result(count=10, average=42.14), 'gils;m': Result(count=10, average=1.4279999999999997), 'boys;kg': Result(count=9, average=40.422222222222224), 'boys;m': Result(count=9, average=1.3888888888888888)}
 9 boys  averaging 40.42kg
 9 boys  averaging 1.39m
10 gils  averaging 1.43m
10 girls averaging 42.14kg
```
在这里使用了一个新的语言结构`yield from`，在说明之前，先了解”PEP 380“引进的几个新的术语：

- 委派生成器：包含`yield from <iterable>`表达式的生成器，上面的`grouper()`函数。
- 子生成器：从`yield from <iterable>`表达式中的`iterable`获取的生成器。
- 调用方：客户端调用委派生成器的代码。

![yield from结构用法](/images/coroutine.png)

使用`yield from`结构可以打开管道，把调用方和子生成器连接起来。

1. 调用方可以发送数据到委派生成器，值通过管道传递到子生成器的`yield`位置。
2. 此时，委派生成器会在`yield from`处暂停，子生成器等待接受客户端发来的值，并通过`yield`产生值，使用管道直接传给调用方。
3. 当子生成器执行完毕，返回的值将作为`yield from`表达式的值，绑定到`results[key]`上，委派生成器再次激活执行。

在上面的例子中，已经见识到了`yield from`能够在自动内部处理子生成器返回值和抛出的`StopIteration`异常。除此之外，`yield from`还需要处理，`throw()`和`close()`以及子生成器只是一个普通的迭代器的情况。

`RESULT = yield from EXPR`语句的具体理解可以参考”PEP 380“伪代码的实现：

```python
The statement

RESULT = yield from EXPR
is semantically equivalent to

_i = iter(EXPR)
try:
    _y = next(_i)
except StopIteration as _e:
    _r = _e.value
else:
    while 1:
        try:
            _s = yield _y
        except GeneratorExit as _e:
            try:
                _m = _i.close
            except AttributeError:
                pass
            else:
                _m()
            raise _e
        except BaseException as _e:
            _x = sys.exc_info()
            try:
                _m = _i.throw
            except AttributeError:
                raise _e
            else:
                try:
                    _y = _m(*_x)
                except StopIteration as _e:
                    _r = _e.value
                    break
        else:
            try:
                if _s is None:
                    _y = next(_i)
                else:
                    _y = _i.send(_s)
            except StopIteration as _e:
                _r = _e.value
                break
RESULT = _r
```

## asyncio

## gevent


## 参考链接
`>>>` [threading RD文档](https://www.rddoc.com/doc/Python/3.6.0/zh/library/threading/)

`>>>` [Python不支持杀死子线程](https://yangwenbo.com/articles/python-thread-cancel.html)

`>>>` [python 线程，GIL 和 ctypes](http://zhuoqiang.me/python-thread-gil-and-ctypes.html)

`>>>` [Python的GIL是什么鬼，多线程性能究竟如何](http://cenalulu.github.io/python/gil-in-python/)

`>>>` [multiprocessing RD文档](https://www.rddoc.com/doc/Python/3.6.0/zh/library/multiprocessing/)

`>>>` [PEP 380](https://www.python.org/dev/peps/pep-0380/)

`>>>` [Python协程从零开始到放弃](https://lightless.me/archives/python-coroutine-from-start-to-boom.html)
