<template>
  <div class="graph-tabs">
    <button 
      v-for="time in ['24H', '1W', '1M']"
      :key="time"
      class="graph-tabs__tab" 
      :class="{
        'graph-tabs__tab--active': time === value
      }"
      @click="$emit('input', time)"
    >
      {{ time }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '24H'
    }
  }
}
</script>

<style lang="scss" scoped>
.graph-tabs {
  display: grid;
  grid-auto-flow: column;
  gap: .5rem;

  &__tab {
    width: 40px;
    height: 25px;

    font-size: 14px;
    font-weight: 600;

    border-radius: 9px;

    display: flex;
    align-items: center;
    justify-content: center;

    &--active {
      background-color: var(--primary-badge-background);
      color: var(--badge-text);
    }
  }
}
</style>
