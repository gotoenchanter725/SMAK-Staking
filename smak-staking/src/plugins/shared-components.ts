import Vue from 'vue'
import SocialNetworks from '@/components/shared/SocialNetworks.vue'
import SmartContractAudited from '@/components/shared/SmartContractAudited.vue'

export default () => {
  Vue.component('SocialNetworks', SocialNetworks)
  Vue.component('SmartContractAudited', SmartContractAudited)
}
