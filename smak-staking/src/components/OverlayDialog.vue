<template>
  <div v-if="show" class="dialog-overlay">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

const OverlayDialogProps = Vue.extend({
  props: {
    show: Boolean,
  },
})

@Component
export default class OverlayDialog extends OverlayDialogProps {
  mounted() {
    console.log('mounted dialog')
  }
}
</script>

<style lang="scss"></style>
