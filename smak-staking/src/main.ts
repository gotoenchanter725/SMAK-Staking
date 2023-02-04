import Vue from 'vue'
import App from './App.vue'
import VueGtag from "vue-gtag";
import router from './router'
import vuetify from './plugins/vuetify'
import sharedComponents from './plugins/shared-components'
import store from '@/store/index'
import '@/assets/scss/index.scss'
import Vuelidate from 'vuelidate';

Vue.config.productionTip = false

Vue.use(Vuelidate);

Vue.use(VueGtag, {
  config: { id: "G-SNSGXLJZV3" }
});

sharedComponents()

new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app')
