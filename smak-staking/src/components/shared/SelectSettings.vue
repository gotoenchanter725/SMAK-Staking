<template>
  <div class="select-settings" v-click-outside="hideOptions">
    <div class="select-settings__button" @click="toggleOptions">
      <span class="mr-1">{{ displayedValue | display }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"
        />
      </svg>
    </div>

    <div
      class="select-settings__options"
      :class="{
        'select-settings__options--shown': isOptionsShown,
      }"
    >
      <div
        v-for="option in options"
        :key="option"
        class="select-settings__option"
        @click="onSelectOption(option)"
      >
        {{ option | display }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  filters: {
    display: (value: any) => {
      if (typeof value === 'string' || typeof value === 'number') return value
      if (typeof value === 'object') return value.display
    }
  }
})
export default class SelectSettings extends Vue {
  @Prop() value!: any
  @Prop({ type: Array }) options!: any[]

  isOptionsShown = false

  get displayedValue() {
    return this.value
  }

  toggleOptions() {
    this.isOptionsShown = !this.isOptionsShown
  }

  showOptions() {
    this.isOptionsShown = true
  }

  hideOptions() {
    this.isOptionsShown = false
  }

  onSelectOption(option: any) {
    this.$emit('input', option)
    this.hideOptions()
  }
}
</script>

<style lang="scss" scoped>
.select-settings {
  position: relative;
    color: var(--white);

  &__button {
    background: var(--secondary-200);
    width: 60px;
    height: 30px;
    border-radius: 10px;
    display: flex;
    font-weight:600;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }

  &__options {
    position: absolute;
    top: 32px;
    left: 0;
    opacity: 0;
    height: 0;
    width: 100%;
    transition: opacity 0.15s ease-in-out;
    border-radius: 8px;
    z-index: 10;

    &--shown {
      opacity: 1;
      height: max-content;
    }
  }

  &__option {
    background: var(--secondary-200);
    padding: 2px 1rem;
    cursor: pointer;
    font-weight: 600;
    text-align: center;

    &:hover {
      opacity: 0.9;
    }

    &:first-child {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    &:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }

  &__option + &__option {
    border-top: 1px solid var(--secondary);
  }
}
</style>
