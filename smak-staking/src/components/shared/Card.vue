<template>
  <div
    class="card"
    :class="{
      'card--secondary': secondary,
      'card--secondary-900': secondary900,
      'card--secondary-1300': secondary1300,
      'card--secondary-2100': secondary2100,
      'card--secondary-2800': secondary2800,
      'card--secondary-2900': secondary2900,
      'card--secondary-3000': secondary3000,
      'card--secondary-3100': secondary3100,
      'card--secondary-3300': secondary3300,
      'card--secondary-3600': secondary3600,
      'card--secondary-3900': secondary3900,
      'card--secondary-4100': secondary4100,
      'card--secondary-4300': secondary4300,
      'card--gradient': gradient,
      'card--secondary-gradient': gradientSecondary,
      'card--secondary-gradient-100': gradientSecondary100,
      'card--secondary-gradient-200': gradientSecondary200,
      'card--gradient-secondary-4300': gradientSecondary4300,
      'card--primary-gradient-300': gradientPrimary300,
      'card--primary-gradient-400': gradientPrimary400,
      'card--fountain-blue': fountainBlue,
      'card--no-border': noBorder,
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
  @Prop({ type: Boolean, default: false }) secondary!: boolean
  @Prop({ type: Boolean, default: false }) secondary900!: boolean
  @Prop({ type: Boolean, default: false }) secondary1300!: boolean
  @Prop({ type: Boolean, default: false }) secondary2100!: boolean
  @Prop({ type: Boolean, default: false }) secondary2800!: boolean
  @Prop({ type: Boolean, default: false }) secondary2900!: boolean
  @Prop({ type: Boolean, default: false }) secondary3000!: boolean
  @Prop({ type: Boolean, default: false }) secondary3100!: boolean
  @Prop({ type: Boolean, default: false }) secondary3300!: boolean
  @Prop({ type: Boolean, default: false }) secondary3600!: boolean
  @Prop({ type: Boolean, default: false }) secondary3900!: boolean
  @Prop({ type: Boolean, default: false }) secondary4100!: boolean
  @Prop({ type: Boolean, default: false }) secondary4300!: boolean
  @Prop({ type: Boolean, default: false }) gradient!: boolean
  @Prop({ type: Boolean, default: false }) gradientSecondary!: boolean
  @Prop({ type: Boolean, default: false }) gradientSecondary100!: boolean
  @Prop({ type: Boolean, default: false }) gradientSecondary200!: boolean
  @Prop({ type: Boolean, default: false }) gradientSecondary4300!: boolean
  @Prop({ type: Boolean, default: false }) gradientPrimary300!: boolean
  @Prop({ type: Boolean, default: false }) gradientPrimary400!: boolean
  @Prop({ type: Boolean, default: false }) fountainBlue!: boolean

  @Prop({ type: Boolean, default: false }) noBorder!: boolean
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixins';

.card {
  background: var(--card-background);
  border: 1px solid var(--card-border);
  box-sizing: border-box;
  border-radius: 1rem;

  &--no-border {
    border: none !important;
  }
  
  &--secondary {
    background: var(--card-nested-background);
    border: 1px solid var(--card-nested-border);
  }

  &--secondary-900 {
    background: var(--secondary-900);
    border: 1px solid var(--secondary-700);
  }

  &--secondary-1300 {
    background: var(--secondary-1300);
    border: 1px solid var(--card-nested-border);
  }
  
  &--secondary-2100 {
    background: var(--secondary-2100);
    border: 1px solid var(--secondary-2200);
  }
  
  &--secondary-2800 {
    background: var(--secondary-2800);
  }
  
  &--secondary-2900 {
    background: var(--secondary-2900);
  }
  
  &--secondary-3000 {
    background: var(--secondary-3000);
  }
  
  &--secondary-3100 {
    background: var(--secondary-3100);
    border: 1px solid var(--secondary-3200)
  }
  
  &--secondary-4100 {
    background: var(--secondary-4100);
    border: 1px solid var(--secondary-4200);
  }
  
  &--secondary-4300 {
    background: var(--secondary-4300);
    border: 1px solid var(--secondary-4400);
  }

  &--secondary-3300 {
    background: var(--secondary-3300);
    border: 1px solid var(--secondary-3200);
  }
  
  &--secondary-3500 {
    background: var(--secondary-3500);
    border: 1px solid var(--secondary-3600)
  }

  &--secondary-3900 {
    background: var(--secondary-3900);
  }

  &--secondary-gradient {
    background: var(--secondary-gradient);
  }

  &--secondary-gradient-100 {
    background: var(--secondary-gradient-100);
  }

  &--secondary-gradient-200 {
    background: var(--secondary-gradient-200);
  }

  &--gradient {
    @include gradient-border(var(--primary-gradient-100));
  }

  &--gradient-secondary-4300 {
    @include gradient-border(var(--primary-gradient-300));
    background: var(--secondary-4300);
  }

  &--gradient-primary-300 {
    @include gradient-border(var(--primary-gradient-300));
    background: var(--secondary-200);
  }

  &--primary-gradient-400 {
    background: var(--primary-gradient-400);
    border: 1px solid var(--primary-2000);
  }

  &--fountain-blue {
    background: var(--secondary-2500);
    border: 1px solid var(--fountain-blue);
  }
}
</style>
