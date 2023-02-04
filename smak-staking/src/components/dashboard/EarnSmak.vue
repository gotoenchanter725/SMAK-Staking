<template>
  <div class="earn-smak">
    <img
      class="earn-smak__background-image"
      :style="{
        opacity: theme === 'dark' ? 0.2 : 1,
      }"
      src="@/assets/earn-smak-bg.png"
      alt=""
    />
    <img v-if="theme === 'dark'" src="@/assets/doughnut-icon.svg" alt="" />
    <img v-else src="@/assets/doughnut-icon--light.svg" alt="" />

    <div class="earn-smak__details">
      <div class="earn-smak__caption">
        <h3 class="earn-smak__title">Earn SMAK</h3>
        <p class="earn-smak__description">Put your SMAK to work and get rewards!</p>
      </div>
      <div class="earn-smak__rates">
        <router-link
          :to="{ name: 'Farms' }"
          class="earn-smak__rate earn-smak__rate--purple-to-indigo"
        >
          <p class="earn-smak__rate-value">Farms</p>
          <p class="earn-smak__rate-label">Stake LP tokens</p>
        </router-link>
        <router-link
          :to="{ name: 'Staking' }"
          class="earn-smak__rate earn-smak__rate--orange-to-violet"
        >
          <p class="earn-smak__rate-value">Staking</p>
          <p class="earn-smak__rate-label">Stake SMAK</p>
        </router-link>
      </div>
    </div>
    <router-link class="earn-smak__button" to="/earn/farms">Go to App</router-link>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapState } from 'vuex'

@Component({
  computed: {
    ...mapState(['theme']),
  },
})
export default class EarnSmak extends Vue {}
</script>

<style lang="scss" scoped>
.earn-smak {
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: 50px 85px auto;
  gap: 0.5rem;
  align-content: center;

  padding: 1.5rem;
  background-color: var(--pannel-dashboard);
  position: relative;

  width: 100%;
  height: 250px;
  overflow: hidden;

  border: 0.5px solid var(--pannel-border);
  border-radius: 20px;

  &__background-image {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  &__title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 0.75rem;
  }

  &__description {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: var(--text2-dashboard);
    margin: 0 0 0.25rem;
  }

  &__details {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__rates {
    flex: 1;
    display: grid;
    grid-auto-flow: column;
    gap: 1rem;
    justify-content: center;
  }

  &__rate {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1rem;

    width: 141px;
    height: 83px;
    background: var(--nested-pannel-dashboard);
    border-radius: 14px;
    position: relative;
    z-index: 2;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &:active {
      box-shadow: inset 1px 1px 10px #4b43a3;
    }

    &--purple-to-indigo {
      border: none;
      position: relative;
      z-index: 0;

      &:before {
        content: '';
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 1px;
        border-radius: 14px;
        background: linear-gradient(to bottom, #854bb1e3, #506ebbe3);
        mask: linear-gradient(rgb(128, 122, 122) 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
      }
    }

    &--orange-to-violet {
      border: none;
      position: relative;
      z-index: 0;

      &:before {
        content: '';
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 1px;
        border-radius: 14px;
        background: linear-gradient(to bottom, #bb7750e3, #a34bb1e3);
        mask: linear-gradient(rgb(128, 122, 122) 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
      }
    }
  }

  &__rate-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 0.25rem;
  }

  &__rate-label {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text2-dashboard);
    margin: 0;
  }

  &__button {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    background-color: #5e5f7a;
    color: var(--active-btn-text);
    height: 27px;
    width: 117px;
    border-radius: 9px;
    text-align: center;
    transition: all 0.1s ease;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      box-shadow: inset 1px 1px 10px #4b43a3;
    }
  }
}

@media only screen and (max-width: 700px) {
  .earn-smak {
    height: 228px;

    &__background-image {
      top: unset;
      bottom: 0;
      right: -130px;
    }

    &__rates {
      grid-auto-flow: row;
      justify-content: flex-end;
    }

    &__rate {
      width: 120px;
      height: 71px;
    }

    &__caption {
      width: 160px;
    }
  }
}
</style>
