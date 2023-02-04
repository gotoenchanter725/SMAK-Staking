<template>
  <div class="smartlink-faqs">
    <img v-if="theme === 'dark'" class="smartlink-faqs__background-image" src="@/assets/smartlink-faqs-bg.svg" alt="" />
    <img v-else class="smartlink-faqs__background-image" src="@/assets/smartlink-faqs-bg--light.svg" alt="" />
    <h3 class="smartlink-faqs__title">Smartlink FAQs</h3>
    <p class="smartlink-faqs__description">
      Explore our documentation to find <br />
      your answers to the most frequently <br />
      asked questions.
    </p>
    <a href="https://docs.smartlink.so/" target="_blank" rel="noopener noreferrer">
      <button class="smartlink-faqs__button">Go to FAQs</button>
      </a>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapState } from 'vuex';

@Component({
  computed: {
    ...mapState(['theme'])
  }
})
export default class SmartlinkFaqs extends Vue {}
</script>

<style lang="scss" scoped>
.smartlink-faqs {
  display: grid;
  grid-auto-flow: row;
  gap: 1rem;
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
    margin: 0;
  }

  &__description {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    color: var(--text2-dashboard);
    margin: 0 0 .25rem;
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
  .smartlink-faqs {
    height: 203px;

    &__background-image {
      top: unset;
      bottom: 0;
      right: 0;
      height: 80%;
    }

  }
}
</style>
