<template>
  <img v-bind="{...$props, ...$attrs}" @error="replaceOnError" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class TokenImage extends Vue {
  @Prop({ type: String, default: () => require('@/assets/token-placeholder.svg') }) src!: string;
  @Prop({ type: String, default: 'token logo' }) alt!: string;

  replaceOnError(e: any) {
    e.target.src = require('@/assets/token-placeholder.svg')
  }
}
</script>
