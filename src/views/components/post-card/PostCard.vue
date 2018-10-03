<template>
  <article v-bind:class="['post-card', { 'has-banner': hasBanner }]">

    <a
      v-if="hasBanner"
      class="post-card-banner-link"
      :href="post.link"
      target="_blank">
      <div
        class="post-card-banner"
        v-bind:style="{ backgroundImage: 'url('+post.banner+')' }"></div>
    </a>

    <div class="post-card-content">
      <a
        class="post-card-content-link"
        :href="post.link">
        <header class="post-card-header">
          <span v-if="lastCategory" class="post-card-category">{{ lastCategory.name }}</span>
          <h2 class="post-card-title">{{ post.title }}</h2>
        </header>
        <section class="post-card-excerpt">

          <!-- <plain-content :html="post.content"></plain-content> -->
          <p>{{ "Welcome, it's great to have you here. We know that first impressions are important, so we've populated your new site with some initial getting started posts that will help you get familiar with everything in no time." }}</p>
        </section>

      </a>

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
