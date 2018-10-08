<template>
  <article v-bind:class="['post-card', { 'has-banner': hasBanner }]">

    <router-link
        v-if="hasBanner"
        class="post-card-banner-link"
        :to="{ name: 'post-page', params: { abbrlink: post.abbrlink }}">
        <div
          class="post-card-banner"
          v-bind:style="{ backgroundImage: 'url('+post.banner+')' }"></div>
    </router-link>

    <div class="post-card-content">
      <router-link
        class="post-card-content-link"
        :to="{ name: 'post-page', params: { abbrlink: post.abbrlink }}">
        <header class="post-card-header">
          <span v-if="lastCategory" class="post-card-category">{{ lastCategory }}</span>
          <h2 class="post-card-title">{{ post.title }}</h2>
        </header>
        <section class="post-card-excerpt">

          <plain-content :html="post.excerpt"></plain-content>
          <!-- <p>{{ "Welcome, it's great to have you here. We know that first impressions are important, so we've populated your new site with some initial getting started posts that will help you get familiar with everything in no time." }}</p> -->
        </section>

      </router-link>

      <footer class="post-card-meta">
        <ul class="author-list">

        </ul>
        <span class="post-card-comments">{{ commentCount }} min Read</span>

      </footer>

    </div>

  </article>
</template>

<style lang="scss" src="./post.card.scss"></style>

<script lang="ts" src="./post.card.ts"></script>
