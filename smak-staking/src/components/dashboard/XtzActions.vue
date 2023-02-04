<template>
  <div class="xtz-actions">
    <div class="xtz-actions__section">
      <div class="xtz-actions__icon">
        <img
          v-if="theme === 'dark'"
          class="xtz-actions__icon-image xtz-actions__icon-image--full"
          src="@/assets/percentage-icon.svg"
          alt=""
        />
        <img
          v-else
          class="xtz-actions__icon-image xtz-actions__icon-image--full"
          src="@/assets/percentage-icon--light.svg"
          alt=""
        />
      </div>
      <p class="xtz-actions__label">Delegate XTZ</p>
      <a class="xtz-actions__button" href="https://www.smartlink.so/baker/" target="_blank" rel="noopener noreferrer">
        Delegate 
      </a>
    </div>
    <div class="xtz-actions__section">
      <div class="xtz-actions__icon xtz-actions__icon--blue">
        <img class="xtz-actions__icon-image" src="@/assets/xtz-icon.png" alt="" />
      </div>
      <p class="xtz-actions__label">Buy XTZ</p>
      <a class="xtz-actions__button" href="https://buy.moonpay.io/?apiKey=pk_live_S3YFnejbhZXq2gVJhCUacqDYTdsD5s&defaultCurrencyCode=xtz" target="_blank" rel="noopener noreferrer">
        Buy XTZ
      </a>
    </div>
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
export default class XtzActions extends Vue {}
</script>

<style lang="scss" scoped>
.xtz-actions {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 1rem;

  padding: 0.75rem 0.75rem;
  background-color: var(--pannel-dashboard);

  width: 100%;
  height: 220px;

  border: 0.5px solid var(--pannel-border);
  border-radius: 20px;

  &__section {
    background: var(--nested-pannel-dashboard);
    border: 0.5px solid var(--pannel-border);
    border-radius: 14px;
    padding: 1rem 1rem;

    display: grid;
    grid-auto-flow: row;
    grid-auto-columns: 100%;
    gap: 1rem;
    align-items: flex-end;
    justify-items: center;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 32px;
    width: 32px;

    &--blue {
      background-color: #0f61ff;
      border-radius: 100%;
    }
  }

  &__icon-image {
    height: 18px;

    &--full {
      height: 100%;
    }
  }

  &__label {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 19px;
    font-weight: 600;
    margin: 0;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;

    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    background-color: #5e54d0;
    color: var(--active-btn-text);
    height: 48px;
    width: 100%;
    border-radius: 15px;
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
  .xtz-actions {
    height: 203px;
  }
}
</style>
