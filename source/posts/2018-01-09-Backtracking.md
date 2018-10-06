---
title: 回溯算法(Backtracking)
tags:
  - 算法
categories: 算法
abbrlink: 1b888408
date: 2018-01-09 14:33:12
---

## 前言

在许多情况下，回溯算法相当于“穷举搜索”的巧妙实现。主要是在搜索尝试过程中寻找问题的解，当发现已不满足求解条件时，就“回溯”返回，尝试别的路径。回溯算法一个重要特性就是问题的解空间一般在搜索的过程中动态的构建。

在思考回溯算法，一般需要明确几点：

- `裁剪(pruning)`：在当前局面所有的可能的尝试，删除掉一批不可能尝试；
- `分支限定(bounding)`：使用限定条件避免掉一些不必要的尝试；
- `回溯(backtrack)`：使用深度优先的递归方式尝试每种选择，在不满足条件的情况下能够很好的回溯；
- `结束(termination)`：若是求解所有解，则需要回溯到`根`，且`根`的所有`子树`都已经搜索完毕；若是求解任一解，那么只要找到一个解就可以结束。

下面将从几个具体的例子来理解回溯算法。
<!-- more -->

## 问题实例

### Permutations

> Given a collection of `distinct` numbers, return all possible permutations.<br>
For example, [1,2,3] have the following permutations:<br>
[
  [1,2,3],
  [1,3,2],
  [2,1,3],
  [2,3,1],
  [3,1,2],
  [3,2,1]
]  

__解法一：回溯+递归__

以`{1, 2, 3}`为例，找出它的全排列。一个直接的想法是依序穷举每一个位置，针对每个位置填充不同的元素，需要注意的是同一个元素不能使用两次。

可以使用`DFS`从左到右填充元素，每次填充的时候可能的尝试是`1, 2, 3`，但是当一个位置填充的是`1`的时候，那么在这次构建序列中`1`就不能再使用了，所以下面我们引入一个限定条件检查元素不包含在当前排列中。

```python
class Solution:
    def permute(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        if not nums:
            return []
        
        res = []
        tmp = []
        self.backtrack(nums, tmp, res)
        return res
    
    def backtrack(self, nums, tmp, res):
        if len(tmp) == len(nums):
            res.append(tmp[:])
            return 
        
        for i in range(len(nums)):
            if nums[i] in tmp:
                continue
            
            tmp.append(nums[i])
            self.backtrack(nums, tmp, res)
            tmp.pop()
```

复杂度：

- 时间复杂度：$O(n!)$，第一个位置有`n`种选择，第二个位置有`n-2`个选择，则`n*(n-1)*...*2*1=n!`
- 空间复杂度：$O(n!)$，输出需要`n!`的存储空间。


__解法二：\*插入法__

这道题的另外一种思路是使用“插入法”：<br>
`P(1) = [1]`<br>
`P(1,2) = [[2, 1], [1, 2]]`<br>
`P(1,2,3) = [[3, 2, 1], [2, 3, 1], [2, 1, 3], [3, 1, 2], [1, 3, 2], [1, 2, 3]]`<br>
我们可以把`P(1, 2)`看作是把`2`插入到`P(1)`中所有可能的位置，`P(1, 2, 3)`看作是把`3`插入到`P(1, 2)`中能够插入的位置。

```python
class Solution:
    def permute(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        if not nums: return []
        perms = [[]]
        for idx, num in enumerate(nums):
            new_perms = []
            for perm in perms:
                for i in range(idx+1):
                    tmp = perm[:]
                    tmp.insert(i, num)  # 插入元素
                    new_perms.append(tmp)
            perms = new_perms
        return perms
```

复杂度分析：

- 时间复杂度：$O(n*n!)$，第一层和第三层的`for`循环为`n*n`，第二层循环为`(n-1)!`。
- 空间复杂度：$O(n!)$，输出需要`n!`的存储空间。

__\* Follow up__

一个升级版就是对于有`重复`元素的数组，例如`{1, 1, 2}`怎么计算它的所有`不同`排列。

这种重复元素问题的常见解决思路就是，先排序一次，在判断前后两个元素是否相等，再做相应的处理(跳过)。

在使用回溯算法的实现中，我们先是对数组进行一次排序，并引进了一个`used[]`数组记录元素是否访问过，在这里有两种方式都能够消除重复元素：`used[i-1]`和`!used[i-1]`。

下面使用递归树的方式描述了这个过程，可以看到在有重复元素的时候`used[i-1]`和`!used[i-1]`是怎么处理的。假设我们对三个重复元素`2`排序完后进行编号：`2(1),2(2),2(3)`：

![](/images/backtrack.jpg)

- `used[i-1]`：只有在前一个元素使用的情况下才会加入排列，那么最终只会形成`2(1),2(2),2(3)`这种顺序的排列；
- `!used[i-1]`：只有在前一个元素没有使用的情况下才会加入排列，那么只会形成`2(3),2(2),2(1)`降序排列。

当然，还有一个前提就是`if used[i]: continue`，跳过已经处理过的元素。我们可以发现`used[i-1]`和`!used[i-1]`都能消除重复元素，那它们的区别在哪呢？

答案就是使用`!used[i-1]`的话，中间不会进行一些不必要的处理，例如`used[i-1]`会进行`2(2),2(1)`再到`2(2),2(1),2(3)`的尝试，而`!used[i-1]`就不会，所以它更高效一点，在LeetCode上可以很明显的看到时间性能的提升。

```python
class Solution:
    def permuteUnique(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        if not nums: return []
        res = []
        nums.sort()
        n = len(nums)
        used = [False] * n
        curr = []
        self.backtrack(nums, used, curr, res)
        return res
    
    
    def backtrack(self, nums, used, curr, res):
        if len(curr) == len(nums):
            res.append(curr[:])
            return 
            
        for i in range(len(nums)):
            if used[i]:
                    continue
            # 这两种方式都可以消除重复元素   
            if i > 0 and nums[i] == nums[i-1] and not used[i-1]:
                continue
            # if i > 0 and nums[i] == nums[i-1] and used[i-1]:
            #     continue
                
            used[i] = True
            curr.append(nums[i])
            self.backtrack(nums, used, curr, res)
            used[i] = False
            curr.pop()
```

下面是使用“插入法”在有重复元素时的实现：

```python
class Solution:
    def permuteUnique(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        
        if not nums:
            return []
        
        n = len(nums)
        nums.sort()
        perms = [[nums[0]]]
        
        for i in range(1, n):
            
            new_perms = []
            for perm in perms:
                for j in range(i+1):
                    tmp = perm[:]
                    tmp.insert(j, nums[i])
                    new_perms.append(tmp)
                    if j < len(perm) and perm[j] == nums[i]:  # 这里的跳过逻辑可以好好想想
                        break
            perms = new_perms
        return perms
```

### Subsets

__问题描述__

列举子集合。这里示范：列举出{0,1,2,3,4}的所有子集合。

```python
class Solution:
    def subsets(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        if not nums: return []
        n = len(nums)
        res = []
        self.backtrack(nums, res, [], 0)
        return res
    
    def backtrack(self, nums, res, tmp, start):
        res.append(tmp[:])
        for i in range(start, len(nums)):
            tmp.append(nums[i])
            self.backtrack(nums, res, tmp, i+1)
            tmp.pop()
```

### 八皇后问题

__问题描述__

在一个N×N的（国际）棋盘上，放置N个棋子（皇后），使得N个”皇后“中任意2个都不在同一行、同一列以及同一斜线。 问：放置这N个”皇后“的方法共有多少种？(或者列举解)

![](/images/八皇后问题.png)

__解决思路__

通过回溯算法，逐行暴力搜索每行能够放置“皇后”的位置，找到第i行的解的前提是前i-1行已经放置好了皇后，直到第N行时结束。

在搜索的过程中使用`pos[n]`记录棋盘第i行、第j列的“皇后”位置。

__实现__

我们来看看递归的实现：

```python
class Solution:
    def solveNQueens(self, n):
        """
        :type n: int
        :rtype: List[List[str]]
        """
        res = []
        pos = [-1] * n
        self.backtrack(pos, 0, [], res)
        return res
        
    def backtrack(self, pos, row, path, res):
        if row == len(pos):
            res.append(path)
            return  # backtracking
        
        for col in range(len(pos)):
            if self.is_valid(pos, row, col):  # pruning
                tmp = '.' * len(pos)
                pos[row] = col
                self.backtrack(pos, row+1, path + [tmp[:col] + 'Q' + tmp[col+1:]], res)
        
    def is_valid(self, pos, row, col):
        for i in range(row):
            if pos[i] == col or pos[i] - col == i - row or pos[i] - col == row - i:
                return False
        return True
```

## 总结

## 资源

`>>>` [N皇后问题](https://github.com/zhsj/nqueen/blob/master/N%E7%9A%87%E5%90%8E%E9%97%AE%E9%A2%98.md)<br>
`>>>` [51. N-Queens]()<br>
`>>>` [52. N-Queens II]()<br>
`>>>` [39. Combination Sum]()<br>
`>>>` [40. Combination Sum II]()<br>
`>>>` [216. Combination Sum III]()<br>
`>>>` [46. Permutations]()<br>
`>>>` [47. Permutations II]()<br>
`>>>` [78. Subsets]()<br>
`>>>` [90. Subsets II]()<br>
`>>>` [131. Palindrome Partitioning]()<br>


<script type="text/x-mathjax-config">
MathJax.Hub.Config({
    tex2jax: {
        inlineMath: [ ['$','$'], ["\\(","\\)"]  ],
        processEscapes: true,
        skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    }
});
console.log("======================")
MathJax.Hub.Queue(function() {
    var all = MathJax.Hub.getAllJax(), i;
    for(i=0; i < all.length; i += 1) {
        all[i].SourceElement().parentNode.className += ' has-jax';                 
    }       
});
</script>

<link href="https://cdn.bootcss.com/KaTeX/0.7.1/katex.min.css" rel="stylesheet">
<script src="//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>



