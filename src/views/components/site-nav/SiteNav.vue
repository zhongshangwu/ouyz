<template>
  <nav id="site-nav" class="site-nav" :style="{ top: fixTop + 'px'}">

      <div class="nav-grid">
          <div class="inner">
            <div class="nav-grid">
              <div class="nav-grid-col nav-grid-col-1">
                <a class="avatar" href="/">
                  <img src="@/assets/avatar.jpeg" alt="" />
                  <span class="title">Ouyz </span>
                </a>
              </div>
            </div>
          </div>
      </div>
    </nav>

</template>

<style lang="scss" src='./site.nav.scss'></style>

<script lang="ts" src="./site.nav.ts"></script>
