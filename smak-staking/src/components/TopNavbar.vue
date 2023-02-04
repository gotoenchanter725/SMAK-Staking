<template>
  <div class="d-flex align-center">
    <Card class="py-1 d-flex w-max mr-4" secondary2900 noBorder>
      <router-link
        v-for="menu in menus"
        :key="menu.displayText"
        :to="{ name: menu.routeName, query: menu.query }"
        v-slot="{ navigate, href, isActive }"
      >
        <a
          class="
            relative
            group
            mx-1
            px-6
            d-flex
            align-center
            justify-center
            text-15px
            font-semibold
            h-38px
            rounded-13px
            cursor-pointer
          "
          :class="{
            'bg-secondary-2600': isActive && (menu.isRoot ? menu.routeName === $route.name : true),
          }"
          :href="href"
          @click="onNavigate($event, navigate)"
        >
          {{ menu.displayText }}

          <div v-if="menu.subMenu && !resetTicker" class="d-none group-hover:d-block absolute top-2.4rem left-0">
            <Card class="mt-2 w-141px px-1">
              <router-link
                v-for="subMenu in menu.subMenu || []"
                :key="subMenu.displayText"
                :to="{ name: subMenu.routeName, query: subMenu.query }"
                v-slot="{ navigate, href }"
              >
                <a
                  class="
                    my-1
                    pl-17px
                    pr-2
                    py-2
                    rounded-13px
                    text-15px
                    font-semibold
                    cursor-pointer
                    d-block
                  "
                  :href="href"
                  @click="onNavigate($event, navigate)"
                >
                  {{ subMenu.displayText }}
                </a>
              </router-link>
            </Card>
          </div>
        </a>
      </router-link>
    </Card>

    <div class="relative d-flex align-center">
      <MoreIcon class="cursor-pointer hover:opacity-90" @click.native="onClickShowMore" />
      <Card
        v-if="isMoreShown"
        v-click-outside="closeShowMore"
        class="absolute top-2.4rem left-0 w-141px px-1"
        @click="closeShowMore"
      >
        <template v-for="menu in moreMenu">
          <router-link
            v-if="!menu.externalLink"
            :key="menu.displayText"
            :to="{ name: menu.routeName, query: menu.query }"
            v-slot="{ navigate, href }"
          >
            <a
              class="my-1 pl-17px pr-2 py-2 rounded-13px text-15px font-semibold cursor-pointer"
              :href="href"
              @click="onNavigate($event, navigate)"
            >
              {{ menu.displayText }}
            </a>
          </router-link>
          <a
            v-else
            :key="menu.displayText"
            :href="menu.externalLink"
            target="_blank"
            rel="noopener noreferrer"
            class="
              my-1
              pl-17px
              pr-2
              py-2
              rounded-13px
              text-15px
              font-semibold
              cursor-pointer
              d-block
            "
          >
            {{ menu.displayText }}
          </a>
        </template>
      </Card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Card from '@/components/shared/Card.vue'
import MoreIcon from '@/components/svgs/MoreIcon.vue'

interface IMenu {
  displayText: string
  routeName?: string
  externalLink?: string
  isRoot?: boolean
  query?: { [key: string]: string }
  subMenu?: IMenu[]
}

@Component({
  components: {
    Card,
    MoreIcon,
  },
})
export default class TopNavbar extends Vue {
  menus: IMenu[] = [
    {
      displayText: 'Dashboard',
      routeName: 'Dashboard',
      isRoot: true,
    },
    {
      displayText: 'Trade',
      routeName: 'Trade',
      subMenu: [
        { displayText: 'Swap', routeName: 'Dex' },
        { displayText: 'Liquidity', routeName: 'Dex', query: { tab: 'liquidity' } },
        { displayText: 'Send', routeName: 'Dex', query: { tab: 'send' } },
      ],
    },
    {
      displayText: 'Track',
      routeName: 'Track',
    },
    {
      displayText: 'Earn',
      routeName: 'Earn',
      subMenu: [
        { displayText: 'Staking', routeName: 'Staking' },
        { displayText: 'Farms', routeName: 'Farms' },
      ],
    },
    {
      displayText: 'Play',
      routeName: 'Play',
      subMenu: [{ displayText: 'Lottery', routeName: 'Lottery' }],
    },
    {
      displayText: 'Charts',
      routeName: 'Charts',
    },
  ]
  moreMenu: IMenu[] = [
    {
      displayText: 'Docs',
      externalLink: 'https://docs.smartlink.so/',
    },
    {
      displayText: 'Security',
      externalLink: 'https://www.smartlink.so/security/',
    },
    {
      displayText: 'Github',
      externalLink: 'https://github.com/Smartlinkhub',
    },
  ]
  isMoreShown = false
  resetTicker = false

  onClickShowMore() {
    this.isMoreShown = !this.isMoreShown
  }

  closeShowMore() {
    this.isMoreShown = false
  }

  onNavigate($event: Event, navigate: (event: Event) => void) {
    navigate($event)

  }
}
</script>

<style lang="scss" scoped></style>
