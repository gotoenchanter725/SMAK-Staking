interface INotificationCenterState {
  isConfirmed: boolean
  confirming: boolean
  errorMessage: string
  showErrorMessage: boolean
}

export const notificationCenterState = {
  namespaced: true,
  state: (): INotificationCenterState => ({
    isConfirmed: false,
    confirming: false,
    errorMessage: "",
    showErrorMessage: false,
  }),
  mutations: {
    updateIsConfirmed: (state: INotificationCenterState, isConfirmed: boolean) =>
      (state.isConfirmed = isConfirmed),
    updateConfirming: (state: INotificationCenterState, confirming: boolean) =>
      (state.confirming = confirming),
    updateErrorMessage: (state: INotificationCenterState, errorMessage: string) =>
      (state.errorMessage = errorMessage),
    updateShowErrorMessage: (state: INotificationCenterState, showErrorMessage: boolean) =>
      (state.showErrorMessage = showErrorMessage),
  },
  actions: {
    confirmTransaction: ({ commit }: any) => {
      commit('updateIsConfirmed', true)
      setTimeout(() => commit('updateIsConfirmed', false), 3000)
    },
    showError: ({ commit }: any, errorMessage: string) => {
      commit('updateShowErrorMessage', true)
      commit('updateErrorMessage', errorMessage)
      setTimeout(() => commit('updateShowErrorMessage', false), 3000)
    },
  },
}
