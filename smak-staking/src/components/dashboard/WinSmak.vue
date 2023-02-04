<template>
  <div class="win-smak">
    <img
      v-if="theme === 'dark'"
      class="win-smak__background-image"
      src="@/assets/win-smak-bg.png"
      alt=""
    />
    <img v-else class="win-smak__background-image" src="@/assets/win-smak-bg--light.png" alt="" />
    <img v-if="theme === 'dark'" src="@/assets/bubble-icon.svg" alt="" />
    <img v-else src="@/assets/bubble-icon--light.svg" alt="" />

      <h3 class="win-smak__title">Win Smak</h3>
      <p class="win-smak__description">Try your luck in the Smartlink lottery</p>
    <button class="win-smak__button" @click="$router.push({ name: 'Lottery' })">Go to Lottery</button>
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
export default class WinSmak extends Vue {}
</script>

<style lang="scss" scoped>
.win-smak {
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: max-content;
  gap: 0.75rem;
  align-content: flex-end;

  padding: 1.5rem;
  background-color: var(--pannel-dashboard);
  position: relative;

  width: 100%;
  height: 220px;
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
  .win-smak {
    height: 203px;
  }
}
</style>
