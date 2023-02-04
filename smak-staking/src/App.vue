<template>
  <v-app id="smartlink-app" class="theme-colors" :class="{ ...themeClass }">
    <v-main fill-height fluid>
      <app-header />

      <OverlayDialog :show="confirming">
        <div class="alert confirming">
          <moon-loader class="mr-3" color="white" :size="20"></moon-loader>
          <div class="text">Confirming...</div>
        </div>
      </OverlayDialog>
      <OverlayDialog :show="showErrorMessage">
        <div class="alert notsuccessful">
          ⚠️
          <div class="text ml-3">{{ errorMessage }}</div>
        </div>
      </OverlayDialog>
      <OverlayDialog :show="walletError">
        <div class="alert notsuccessful">
          ⚠️
          <div class="text ml-3">{{ errormsg }}</div>
        </div>
      </OverlayDialog>

      <OverlayDialog :show="isConfirmed">
        <div class="alert confirmation">
          <v-icon dark right> mdi-check-circle-outline </v-icon>
          <div class="text ml-3">Success</div>
        </div>
      </OverlayDialog>

      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" src="./App.ts"></script>
