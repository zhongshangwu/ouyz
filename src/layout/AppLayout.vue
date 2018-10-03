<template>
  <div id="app">

    <div class="wrapper">
      <site-nav></site-nav>
      <router-view/>
    </div>

  </div>
</template>

<style>
  body {
    margin: 0px;
    padding: 0px;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    /* margin-top: 60px; */
  }
  .wrapper {
    position: relative;
  }
</style>

<script lang="ts" src="./app.layout.ts"></script>
