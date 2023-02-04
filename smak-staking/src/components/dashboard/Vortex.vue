<template>
  <div class="vortex">
    <img
      class="vortex__background-image"
      :style="{
        filter: theme === 'light' ? 'invert(.2)' : undefined,
      }"
      src="@/assets/vortex-bg.png"
      alt=""
    />
    <VortexLogo/>
    <div class="vortex__caption">
      <h3 class="vortex__title">Decentralized Exchange</h3>
      <p class="vortex__description">Start trading on the Smartlink AMM</p>
    </div>
    <button class="vortex__button" @click="$router.push({ name: 'Dex' })">
      Go to Vortex
      <span class="vortex__button-icon">🌀</span>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapState } from 'vuex'
import VortexLogo from '@/components/shared/VortexLogo.vue'

@Component({
  components: {
    VortexLogo
  },
  computed: {
    ...mapState(['theme']),
  },
})
export default class Vortex extends Vue {}
</script>

<style lang="scss" scoped>
.vortex {
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

  &__caption {
    display: flex;
    flex-direction: column;
    justify-content: center;
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

  &__button {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    background-color: #5e5f7a;
    color: var(--active-btn-text);
    height: 27px;
    width: max-content;
    padding: 0 1rem;
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

  &__button-icon {
    filter: brightness(0) invert(1);
  }
}

@media only screen and (max-width: 700px) {
  .vortex {
    height: 228px;

    &__background-image {
      top: unset;
      bottom: 0;
      right: -140px;
      height: 80%;
    }
  }
}
</style>
