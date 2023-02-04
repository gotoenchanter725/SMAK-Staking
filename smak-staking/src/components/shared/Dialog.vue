<template>
  <v-dialog
    v-model="isDialogShown"
    @click:outside="closeDialog"
    :max-width="maxWidth"
    transition="fade-transition"
  >
    <div class="dialog__container">
      <slot></slot>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class Dialog extends Vue {
  @Prop(Boolean) value!: boolean;
  @Prop({ type: Number, default: 447 }) maxWidth!: number;

  get isDialogShown() {
    return this.value
  }

  set isDialogShown(value) {
    this.$emit('input', value)
  }

  closeDialog() {
    this.isDialogShown = false;
    this.$emit('close')
  }

}
</script>

<style lang="scss" scoped>
.dialog {
  &__container {
    overflow: hidden;
    background-color: var(--pannel);
    border: 1px solid #484d5f;
    color: var(--text);
    border-radius: 20px;
  }
}
</style>