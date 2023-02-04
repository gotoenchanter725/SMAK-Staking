export const tokenMixin = {
  filters: {
    imgUrlByAddress: (address: string) => {
      return `https://services.tzkt.io/v1/avatars/${address}`
    },
    imgUrlByIpfs: (url: string) => {
      return url.slice(0, 7) === 'ipfs://' ? `https://ipfs.io/ipfs/${url.slice(7)}` : url
    },
  },
}
