<template>
  <div class="info-tooltip">
    <QuestionIcon class="info-tooltip__icon" />
    <div
      class="info-tooltip__tooltip"
      :class="{
        'info-tooltip__tooltip--left': position === 'left',
        'info-tooltip__tooltip--right': position === 'right',
        'info-tooltip__tooltip--top-left': position === 'top-left',
        'info-tooltip__tooltip--top-right': position === 'top-right',
        'info-tooltip__tooltip--top-center': position === 'top-center',
        'info-tooltip__tooltip--bottom-left': position === 'bottom-left',
        'info-tooltip__tooltip--bottom-right': position === 'bottom-right',
        'info-tooltip__tooltip--bottom-center': position === 'bottom-center',
        [popupClass]: !!popupClass,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mapState } from 'vuex'

import QuestionIcon from '@/components/svgs/QuestionIcon.vue'

@Component({
  components: {
    QuestionIcon,
  },
  computed: {
    ...mapState(['theme']),
  },
})
export default class InfoTooltip extends Vue {
  theme!: string
  @Prop({ type: String, default: 'top-right' }) position!: string
  @Prop({ type: String }) popupClass!: string
}
</script>

<style lang="scss" scoped>
.info-tooltip {
  display: flex;
  position: relative;

  &__icon {
    color: var(--text);
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }

  &__tooltip {
    display: none;
    background: var(--secondary-4000);
    border-radius: 13px;
    padding: 1rem;
    min-width: 170px;
    width: max-content;

    font-size: 13px;
    font-weight: normal;
    color: var(--text);

    position: absolute;
    z-index: 10;

    &--top-right {
      bottom: 1rem;
      left: 0;
    }

    &--top-center {
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }

    &--bottom-right {
      top: 1rem;
      left: 0;
    }

    &--right {
      top: 50%;
      transform: translateY(-50%);
      left: 1rem;
    }

    &--left {
      top: 50%;
      transform: translateY(-50%);
      right: 1rem;
    }
  }

  &__icon:hover + &__tooltip {
    display: block;
  }
}
</style>
