<template>
  <div class="checkbox">
    <input class="checkbox__input" :id="checkboxId" type="checkbox" :value="value" @input="e => $emit('input', e.target.checked)">
    <label class="checkbox__label" :for="checkboxId"><slot/></label>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { v4 as uuidv4 } from 'uuid';

@Component({})
export default class Checkbox extends Vue {
  @Prop(Boolean) value!: boolean
  
  checkboxId = uuidv4()
}
</script>

<style lang="scss" scoped>
.checkbox {
  &__input {
    position: absolute; 
    opacity: 0;
  }

  &__input + &__label {
    position: relative;
    cursor: pointer;
    padding: 0;
  }

  &__input + &__label:before {
    content: '';
    display: inline-block;
    vertical-align: text-top;
    width: 20px;
    height: 20px;
    border: 1px solid #8398B7;
    border-radius: 6px;
  }

  &__input:hover + &__label:before {
    background: #8398B7;
  }

  &__input:checked + &__label:before {
    background: #8398B7;
  }
  
  &__input:disabled + &__label {
    color: #b8b8b8;
    cursor: auto;
  }

  &__input:disabled + &__label:before {
    box-shadow: none;
    background: #ddd;
  }

  &__input:checked + &__label:after {
    content: '';
    position: absolute;
    left: 5px;
    top: 9px;
    background: white;
    width: 2px;
    height: 2px;
    box-shadow: 
      2px 0 0 white,
      4px 0 0 white,
      4px -2px 0 white,
      4px -4px 0 white,
      4px -6px 0 white,
      4px -8px 0 white;
    transform: rotate(45deg);
  }
}
</style>
