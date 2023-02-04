<template>
  <div class="confetti">
    <div class="confetti-piece" v-for="i in count" :key="i"></div>
  </div>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      default: 32,
    },
  },
}
</script>

<style lang="scss" scoped>
$yellow: #ffd300;
$blue: #17d3ff;
$pink: #ff4e91;

$duration: 1000;

@function randomNum($min, $max) {
  $rand: random();
  $randomNum: $min + floor($rand * (($max - $min) + 1));

  @return $randomNum;
}

.icon {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: 32px;
  position: relative;
}

.confetti {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 500px;
  z-index: 1000;

  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 16px;
  background: $yellow;
  top: 0;
  opacity: 0;

  @for $i from 1 through 32 {
    &:nth-child(#{$i}) {
      left: $i * 3%;
      transform: rotate(#{randomNum(-80, 80)}deg);
      animation: makeItRain $duration * 1ms infinite ease-out;
      animation-delay: #{randomNum(0, $duration * 0.5)}ms;
      animation-duration: #{randomNum($duration * 0.7, $duration * 1.2)}ms;
    }
  }

  &:nth-child(odd) {
    background: $blue;
  }

  &:nth-child(even) {
    z-index: 1;
  }

  &:nth-child(4n) {
    width: 5px;
    height: 12px;
    animation-duration: $duration * 2ms;
  }

  &:nth-child(3n) {
    width: 3px;
    height: 10px;
    animation-duration: $duration * 2.5ms;
    animation-delay: $duration * 1ms;
  }

  &:nth-child(4n-7) {
    background: $pink;
  }
}

@keyframes makeItRain {
  from {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  to {
    transform: translateY(200px);
  }
}
</style>
