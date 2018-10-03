<template>
  <div id="plain-content" class="plain-content" v-html="html"></div>
</template>

<style lang="scss">
  @import '../../../styles/vars.scss';

  .plain-content {
    padding: 0 1rem;

    @media (max-width: $--small-screen-width) {
      padding: 0;
    }
  }
</style>

<style lang="scss" src="./figure-code-style.scss"></style>
<style lang="scss" src="./base.scss"></style>

<script lang="ts" src="./plain-content.ts"></script>
