<template>
  <div 
    class="badge"
    :class="{
      'badge--primary-600': primary600,
      'badge--primary-1600': primary1600,
      'badge--gradient-green': gradientGreen,
    }"
    @click="$emit('click', $event)"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class Card extends Vue {
  @Prop({ type: Boolean, default: false }) primary600!: boolean;
  @Prop({ type: Boolean, default: false }) primary1600!: boolean;
  @Prop({ type: Boolean, default: false }) gradientGreen!: boolean;
}
</script>

<style lang="scss" scoped>
  .badge {
    background: linear-gradient(90.57deg, var(--primary-400) 0.46%, var(--primary-500) 101.96%);
    border-radius: 7px;
    padding: 1px .5rem;
    width: max-content;

    &--primary-600 {
      background: var(--primary-600);
    }

    &--primary-1600 {
      background: var(--primary-1600);
    }

    &--gradient-green {
      background: linear-gradient(90deg, #4D9A32 17.07%, #379898 96.34%);
    }
  }
</style>
