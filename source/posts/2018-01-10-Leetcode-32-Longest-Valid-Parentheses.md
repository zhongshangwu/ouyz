---
title: "[LeetCode]32. Longest Valid Parentheses"
abbrlink: fbe1b588
date: 2018-01-10 01:04:52
tags:
    - LeetCode
    - 算法
---
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

## 问题描述

对于一个给定的只包含“(”和“)”的字符串，找出它的最长合法括号。例如：

> "(()" => 2  # 最长合法括号为“()”，长度为2<br>
“)()())” => 4  # 最长合法括号为“()()“，长度为4

<!-- more -->

## 暴力解法

很容易想到的解法是，穷举出所有的子串，然后一一验证每个子串是否是合法的(`Valid Parentheses`)。

__复杂度分析__

- 时间复杂度：$O(n^3)$。穷举所有子串为$O(n^2)$，使用栈验证一个长度为n的子串需要$O(n)$
- 空间复杂度：$O(n)$。使用栈验证字符串需要一定的空间。

## Stack

这是一道括号题，和`Valid Parenthese`一样，可以尝试使用栈。

从左到右遍历字符串，如果是`(`，那么进行“压栈”操作；如果是`)`，若它是一个合法的括号匹配，那么必然可以和栈顶的`(`抵消。

不过在这里，我们要求的是“长度”，所以在遍历过程中，应该记录长度或者是索引的信息。

1. 使用`stack`来记录上一个`valid`串的停止位置，刚开始为`-1`；
1. 在从左到右的遍历过程中，碰到左括号`(`，把它的索引`i`压栈；
2. 碰到右括号`)`，则需要弹出栈顶元素尝试抵消：
    - 如果栈顶不是`(`(也就是弹出元素后`stack`为空)，那么当前这个`valid`串到这为止，开始查找新的`valid`串，重置哨兵为当前位置`i`；
    - 如果能够抵消，那么`valid`串就会变长

```python
class Solution:
    def longestValidParentheses(self, s):
        """
        :type s: str
        :rtype: int
        """
        n = len(s)
        stack = [-1]
        maxLen = 0
        for i in range(n):
            if s[i] == '(':
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)
                else:
                    maxLen = max(maxLen, i-stack[-1])
        return maxLen
```

__复杂度分析__

- 时间复杂度：$O(n)$，遍历一次长度为`n`的字符串。
- 空间复杂度：$O(n)$。使用栈保存索引，如果一直是左括号`(`，那么栈的大小为`n+1`。

## DP

我们发现一个最长`valid`串能够由一个子`valid`串构成，可以尝试着从动态规划的角度去理解这个问题。

从右到左，对于以`i`结尾的字符串分几种情形：

- 如果`s[i]==(`，那么显然它不是一个`valid`串，则`dp[i] = 0`。例如`()(`；
- 如果`s[i]==)`，那么：
    - 如果`s[i-1]=="("`，，那么`dp[i] = dp[i-2] + 2`。例如`()()`；
    - 如果`s[i-1]==")"`：
        - 像`()(())`这种，`dp[i]=dp[i-1] + 2 + dp[i-dp[i-1]-2]`
        - 像`)())`或`())`这种，`dp[i]=0`

设`dp[i-1]`的最长`valid`串的前一位为`j=i-dp[i-1]-1`，整理一下可以得到它的状态方程：

$$dp[i] = \begin{cases}
0, &if\ s[i]=='('\ or\ j<0\ or\ s[j]==')'\\
dp[i-1] + 2, &if\ s[j]=='('\ and\ j=0\\
dp[i-1] + 2 + dp[j-1], &if\ s[j]=='('\ and\ j>0\\
\end{cases}$$

```python
class Solution:
    def longestValidParentheses(self, s):
        """
        :type s: str
        :rtype: int
        """
        n = len(s)
        dp = [0] * n
        maxLen = 0
        for i in range(1, n):
            j = i - dp[i-1] - 1
            if j >= 0 and s[j] == '(':
                dp[i] = dp[i-1] + 2 + (dp[j-1] if j > 0 else 0)
                maxLen = max(maxLen, dp[i])
        return maxLen
```

__复杂度分析__

- 时间复杂度：$O(n)$，遍历一次长度为`n`的字符串。
- 空间复杂度：$O(n)$。
