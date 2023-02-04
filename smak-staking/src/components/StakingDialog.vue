<template>
  <v-dialog
    persistent
    v-model="show"
    :max-width="size"
    :overlay-opacity="opacity"
    :content-class="!display ? 'hidden' : ''"
    :hide-overlay="!show || !display"
    transition="fade-transition"
  >
    <template v-slot:activator="{ on }">
      <div v-if="buttonname" v-on="on" :class="classname" @click="closeAll(true)">
        {{ buttonname }}
      </div>
    </template>
    <div class="staking-dialog theme-colors" :class="{ ...themeClass }" :content-class="theme">
      <div class="title">
        <v-btn v-on="on" class="mt-n2" icon text @click="showState(false)"> ← </v-btn>
        <span>{{ title }}</span>
        <v-btn v-on="on" icon text @click="closeAll(false)"> ✕ </v-btn>
      </div>

      <div class="text">
        <slot />
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'

Vue.config.silent = true

@Component
export default class StakingDialog extends Vue {
  @Prop({ type: String, default: 'title' }) title!: string
  @Prop({ type: String, default: 'dark' }) theme!: string
  @Prop({ type: String, default: 500 }) size!: number
  @Prop({ type: String, default: '' }) classname!: string
  @Prop({ type: String, default: '' }) buttonname!: string
  @Prop({ type: Boolean, default: false }) display!: boolean
  @Prop({ type: Number, default: 0.75 }) opacity!: number
  @Prop({ type: Boolean, default: false }) show!: boolean

  @Emit('showState')
  showState(state: boolean) {
    this.show = state
    this.display = state
    return state
  }

  @Emit('closeAll')
  closeAll(state: boolean) {
    this.showState(state)
    return state
  }

  get themeClass(): any {
    return {
      light: this.theme === 'light',
      dark: this.theme === 'dark',
    }
  }
}
</script>

<style lang="scss">
.hidden {
  display: none !important;
}
@mixin source-sans-pro-16-regular {
  font-family: 'Source Sans Pro';
  font-size: 16px !important;
  font-weight: 400;
  line-height: 25px;
}

@mixin source-code-pro-29-regular {
  font-family: 'Source Code Pro';
  font-size: 29px !important;
  font-weight: 400;
  line-height: 42px;
}

@mixin source-code-pro-30-regular {
  font-family: 'Source Code Pro';
  font-size: 29px !important;
  font-weight: 400;
  line-height: 42px;
}

@mixin source-code-pro-16-regular {
  font-family: 'Source Code Pro';
  font-size: 16px !important;
  font-weight: 400;
  line-height: 25px;
}

@mixin source-sans-pro-16-semi-bold {
  font-family: 'Source Sans Pro';
  font-size: 16px !important;
  font-weight: 600;
  line-height: 25px;
}

@mixin source-sans-pro-20-semi-bold {
  font-family: 'Source Sans Pro';
  font-size: 20px;
  font-weight: 600;
  line-height: 31px;
}

@mixin source-sans-pro-21-semi-bold {
  font-family: 'Source Sans Pro';
  font-size: 21px !important;
  font-weight: 600;
  line-height: 31px;
}

.theme-colors {
  --black: $black;
  --dark-gray: rgba(159, 169, 192, 1);
  --dark-slate-blue: rgba(73, 63, 133, 1);
  --dark-slate-gray: rgba(51, 100, 71, 1);
  --dim-gray: rgba(83, 81, 107, 1);
  --gainsboro: rgba(219, 220, 235, 1);
  --gainsboro-2: rgba(208, 211, 231, 1);
  --gainsboro-3: rgba(213, 215, 231, 1);
  --lavender: rgba(231, 231, 246, 1);
  --lavender-2: rgba(233, 234, 248, 1);
  --lime-green: rgba(72, 171, 38, 1);
  --medium-slate-blue: rgba(130, 86, 255, 1);
  --medium-slate-blue-2: rgba(118, 115, 255, 1);
  --orchid: rgba(211, 94, 240, 1);
  --transparent-cadet-blue: rgba(97, 187, 132, 0.73);
  --transparent-dark-slate-gray: rgba(63, 77, 94, 0.46);
  --transparent-medium-slate-blue: rgba(130, 86, 255, 0.54);
  --violet: rgba(212, 131, 232, 1);
  --white: rgba(255, 255, 255, 1);
  --transparent-white: rgba(255, 255, 255, 0.5);
  --transparent-purple: rgba(151, 161, 255, 0.32);
  --text-low-opacity: 0.75;
}
.light {
  --background: rgba(226, 227, 234, 1);
  --pannel: rgba(231, 232, 240, 1);
  --pannel-border: rgba(255, 255, 255, 1);
  --menu-background: rgba(219, 220, 235, 1);
  --menu-selected: rgba(231, 231, 246, 1);
  --nested-pannel: rgba(235, 236, 242, 1);
  --active: rgba(130, 86, 255, 1);
  --selected: rgba(130, 86, 255, 1);
  --input: rgba(231, 231, 246, 1);
  --input-border: rgba(255, 255, 255, 1);
  --text: rgba(13, 13, 20, 1);
  --active-btn-text: white;
  --border: rgba(255, 255, 255, 1);
  --minimum-value: rgba(73, 63, 133, 1);
  --error: rgba(200, 36, 88, 1);
  --warning: rgba(233, 94, 136, 1);
  --success: rgba(94, 84, 208, 1);
  --btn-disabled: rgba(133, 134, 153, 1);
  --button: rgba(63, 77, 94, 0.2);
  --signout: rgba(118, 115, 255, 1);
  --signout-font: rgba(255, 255, 255, 1);
  --signout-font-button: rgba(255, 255, 255, 1);
  --overlay: rgba(128, 128, 128, 1);
  --connect-wallet-btn: rgba(130, 86, 255, 0.54);
  --connect-wallet-btn-txt: rgba(255, 255, 255, 1);
  --wallet-connection-text: rgba(88, 88, 136, 1);
  --wallet-connection-text-background: rgba(240, 241, 248, 1);
  --wallet-connection-text-background-border: rgba(255, 255, 255, 1);
  --wallet-connection-text-highlight: rgba(104, 64, 219, 1);
  --wallet-connection-buttons-background: rgba(231, 232, 240, 1);
  --wallet-connection-buttons-background-border: rgba(255, 255, 255, 1);
  --dashboard-title: rgba(130, 86, 255, 1);
  --total-locked-amount: rgba(105, 102, 255, 1);
  --interest-period-border: rgba(105, 102, 255, 1);
  --error-msg: rgba(255, 133, 95, 1);
  --separator: rgba(255, 255, 255, 0.03);
  --menu-btn: rgba(255, 255, 255, 1);
  --mobile-menu-item: rgba(59, 60, 81, 1);
  --mobile-menu-item-border: rgba(80, 87, 112, 0.63);
  --staking-info-background-on-mobile: rgba(58, 59, 82, 1);
  --confirmation-alert: rgba(74, 76, 118, 0.46);
  --confirming-alert: rgba(138, 90, 238, 1);
  --error-alert: rgba(115, 67, 51, 1);
  --flexible-locked-tag: rgba(211, 94, 240, 1);
  --option-selected: rgba(231, 232, 240, 1);
  --option-selected-text: rgba(13, 13, 20, 1);
  --buttons-text: rgba(255, 255, 255, 1);
  --pop-up-input: rgba(214, 215, 223, 1);
  --pop-up-input-border: rgba(255, 255, 255, 0.2);
  --error-box: rgba(255, 173, 173, 0.32);
  --error-box-txt: rgba(141, 68, 92, 1);
  --amount: rgba(105, 102, 255, 1);
  --max-btn: rgba(211, 94, 240, 1);
  --staking-dialog-background: rgba(226, 227, 234, 1);
  --staking-dialog-border: rgba(80, 87, 112, 0.5);
}

.dark {
  --background: rgba(36, 37, 55, 1);
  --pannel: rgba(49, 50, 70, 1);
  --pannel-border: rgba(80, 87, 112, 0.43);
  --menu-background: rgba(49, 50, 70, 1);
  --menu-selected: rgba(38, 38, 56, 1);
  --nested-pannel: rgba(58, 59, 82, 1);
  --active: rgba(94, 84, 208, 1);
  --selected: rgba(47, 48, 66, 1);
  --input: rgba(38, 38, 56, 1);
  --input-border: rgba(255, 255, 255, 0.1);
  --text: white;
  --active-btn-text: white;
  --border: rgba(58, 59, 82, 1);
  --minimum-value: rgba(230, 190, 255, 1);
  --error: rgba(200, 36, 88, 1);
  --warning: rgba(233, 119, 94, 1);
  --success: rgba(70, 176, 138, 1);
  --button: rgba(63, 77, 94, 0.67);
  --signout: rgba(166, 160, 255, 0.09);
  --signout-font: rgba(151, 161, 255, 1);
  --signout-font-button: rgb(250, 250, 250);
  --overlay: rgba(17, 17, 25, 1);
  --connect-wallet-btn: rgba(77, 137, 255, 0.14);
  --connect-wallet-btn-txt: rgba(135, 159, 255, 1);
  --wallet-connection-text: rgba(255, 255, 255, 0.61);
  --wallet-connection-text-background: rgba(59, 60, 81, 0.35);
  --wallet-connection-text-background-border: rgba(80, 87, 112, 0.33);
  --wallet-connection-text-highlight: rgba(96, 128, 183, 1);
  --wallet-connection-buttons-background: rgba(59, 60, 81, 1);
  --wallet-connection-buttons-background-border: rgba(80, 87, 112, 0.33);
  --dashboard-title: rgba(207, 168, 255, 1);
  --total-locked-amount: rgba(191, 190, 255, 1);
  --interest-period-border: rgba(210, 194, 255, 1);
  --btn-disabled: rgba(52, 55, 82, 1);
  --error-msg: rgba(255, 133, 95, 1);
  --separator: rgba(255, 255, 255, 0.03);
  --menu-btn: rgba(255, 255, 255, 1);
  --mobile-menu-item: rgba(59, 60, 81, 1);
  --mobile-menu-item-border: rgba(80, 87, 112, 0.63);
  --staking-info-background-on-mobile: rgba(58, 59, 82, 1);
  --confirmation-alert: rgba(74, 76, 118, 0.46);
  --confirming-alert: rgba(138, 90, 238, 1);
  --error-alert: rgba(115, 67, 51, 1);
  --flexible-locked-tag: rgba(180, 89, 202, 1);
  --option-selected: rgba(47, 48, 66, 1);
  --option-selected-text: rgba(255, 255, 255, 1);
  --buttons-text: rgba(255, 255, 255, 1);
  --pop-up-input: rgba(38, 38, 56, 1);
  --pop-up-input-border: rgba(255, 255, 255, 0.2);
  --error-box: rgba(255, 116, 116, 0.05);
  --error-box-txt: rgba(255, 159, 191, 1);
  --amount: rgba(191, 190, 255, 1);
  --max-btn: rgba(180, 89, 202, 1);
  --staking-dialog-background: rgba(41, 43, 63, 1);
  --staking-dialog-border: rgba(80, 87, 112, 1);
}
.staking-dialog {
  background: var(--staking-dialog-background);
  border: 1px solid var(--staking-dialog-border);
  color: var(--text);

  font-family: 'Source Sans Pro';
  font-size: 15px;
  font-weight: 600;

  position: relative;

  border-radius: 12px;

  .title {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border);
    padding: 1.3em 1em;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .text {
    padding: 1.5em;
  }

  .header {
    font-size: 1.2em;
    @include source-sans-pro-20-semi-bold;
    padding-bottom: 15px;
  }
  .redeem.header {
    font-size: 1.2em;
    margin: 0px 15px;
    @include source-sans-pro-20-semi-bold;
    padding-bottom: 0px;
  }

  .redeem.details {
    margin: 1em 15px;
    @include source-sans-pro-16-regular;
  }

  .redemption-amount {
    margin: 0px 15px;
  }

  .label {
    @include source-sans-pro-21-semi-bold;
  }

  .amount {
    color: var(--amount);
    @include source-code-pro-29-regular;
  }

  .details {
    margin: 1em 0em;
    @include source-sans-pro-16-regular;
  }

  .error-box {
    background: rgba(255, 116, 116, 0.08);
    background: var(--error-box);
    padding: 1em;
    border-radius: 20px;
  }

  .text-error {
    color: rgba(200, 36, 88, 1);
    color: var(--error-box-txt);
    @include source-sans-pro-16-semi-bold;
  }

  .gray {
    opacity: 0.7;
  }

  .input-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    background: var(--pop-up-input);
    margin: 0.2em 0;
    border: 1px solid var(--pop-up-input-border);
    padding: 0.7em;
    border-radius: 17px;

    input {
      color: var(--text);
      height: 1.2em;
      font-size: 1em;
      width: 100%;
      margin-right: 5px;
      @include source-code-pro-30-regular;
    }
  }

  .v-btn {
    font-size: 1.2em !important;
    color: var(--text) !important;
  }

  .btn.large.disabled {
    cursor: not-allowed;
  }

  table {
    width: 100%;
    font-size: 0.8em;
    border-collapse: collapse;

    td {
      text-align: center;
    }
    tr {
      border-bottom: 0.5em solid transparent;
      border-right: 2px solid transparent;
    }
  }

  .input-txts {
    @include source-code-pro-16-regular;
  }
  .btn:hover {
    background: rgb(80 73 165);
  }
  .btn {
    min-width: 100px;
    padding: 0.6em;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--active);
    border-radius: 0.7em;
    color: var(--buttons-text);
    cursor: pointer;
    transition: 0.5s;

    &.large {
      font-size: 1.3em;
    }
    &.tiny {
      font-size: 1em;
      padding: 0.1em 0.5em;
      min-width: auto;
      max-width: 87px;
      border-radius: 20px;
      height: 25px;
      cursor: pointer;
    }

    &.btn-error {
      background: rgba(200, 36, 88, 1);
      background: var(--error);
      color: var(--buttons-text);
    }
    &.btn-warning {
      background: rgba(233, 119, 94, 1);
      background: var(--warning);
      color: var(--buttons-text);
      margin-left: auto;
      margin-right: auto;
    }
    &.btn-success {
      background: rgba(70, 176, 138, 1);
      background: var(--success);
      color: var(--buttons-text);
      margin-left: auto;
      margin-right: auto;
    }
    &.btn-disabled {
      background: rgba(52, 55, 82, 1);
      background: var(--btn-disabled);
      cursor: not-allowed !important;
      color: var(--buttons-text);
      margin-left: auto;
      margin-right: auto;
    }
  }
}
</style>
