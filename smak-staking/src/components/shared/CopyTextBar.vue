<template>
  <button
    class="
      relative
      outline-none
      rounded-13px
      d-flex
      flex-wrap
      px-4
      py-2
      align-center
      max-w-max
      cursor-pointer
      hover:opacity-90
      active:shadow-inner
      border
    "
    @click="copyValue"
  >
    <p
      class="mb-0 mr-4 font-ssp opacity-70 font-semibold whitespace-nowrap"
      :class="{ invisible: isCopied }"
    >
      {{ label }}:
    </p>
    <p class="text mb-0 mr-4 font-ssp opacity-70 font-semibold" :class="{ invisible: isCopied }">
      {{ value }}
    </p>
    <img
      :class="{ invisible: isCopied, 'filter-invert-80': theme === 'light' }"
      src="@/assets/copy-icon.svg"
      alt=""
    />
    <p
      class="absolute top-1/2 left-1/2 transform -translate-1/2 font-ssp opacity-70 font-semibold"
      :class="{ invisible: !isCopied }"
    >
      Copied!
    </p>
  </button>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  computed: {
    ...mapState(['theme']),
  },
})
export default class TokenDashboard extends Vue {
  @Prop({ type: String, default: 'Contract' }) label!: string
  @Prop({ type: String, required: true }) value!: string

  theme!: string
  isCopied = false

  copyValue() {
    const el = document.createElement('textarea')
    el.value = this.value as string
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    const selected =
      document!.getSelection()!.rangeCount > 0 ? document!.getSelection()!.getRangeAt(0) : false
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    if (selected) {
      document!.getSelection()!.removeAllRanges()
      document!.getSelection()!.addRange(selected)
    }

    this.isCopied = true
    setTimeout(() => {
      this.isCopied = false
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
.border {
  border: 1px solid var(--pannel);
  .text {
    max-width: 303px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
