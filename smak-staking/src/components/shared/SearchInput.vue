<template>
  <div
    class="bg-secondary-1600 rounded-14px w-full w-lg-500px d-flex align-center relative"
    @click="e => $emit('click', e)"
  >
    <input class="bg-transparent px-6 py-3 w-full text-14px" :placeholder="placeholder" v-model="inputValue" />
    <SearchIcon class="text-secondary-1700 mr-6" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'


@Component({})
export default class SearchInput extends Vue {
  @Prop(String) placeholder!: string
  @Prop(String) value!: string

  get inputValue() {
    return this.value
  }

  set inputValue(value: string) {
    this.$emit('input', value)
  }
}
</script>

<style lang="scss" scoped>

</style>