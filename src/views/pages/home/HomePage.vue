<template>
  <div id="home-page">
    <!--  -->
    <section class="parallax" :style="{height: offsetheight + 'px'}">
      <div class="intro">
        <a href="/" class="avatar">
          <img src="@/assets/avatar.jpeg" alt="">
        </a>

        <h1 class="title">Ouyz&#39;s Blog</h1>
        <div class="slogan">程序员的自我修养 {{ msg }}</div>

        <hr class="divider">
        <ul class="text-center nav">
          <li class="item">
            <a href="/achives">地址1</a>
            <span>|</span>
          </li>
          <li class="item">
            <a href="/achives">地址2</a>
            <span>|</span>
          </li>
          <li class="item">
            <a href="/achives">地址3</a>
            <span>|</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="container outer">
      <div class="inner">
        <div class="posts-feed">
          <post-card
            v-for="post in posts"
            :key="post.slug"
            :post="post"
            :showPost="true">
          </post-card>
        </div>
      </div>
    </section>
    <el-pagination class="pagination"
      background
      layout="prev,pager,next"
      :page-count="pagination.pageCount"
      :page-size="pagination.pageSize"
      :current-page="page"
      @current-change="onPageChange">
    </el-pagination>
  </div>
</template>

<style lang="scss" src="./home-page.scss"></style>

<script lang="ts" src="./home.page.ts"></script>
