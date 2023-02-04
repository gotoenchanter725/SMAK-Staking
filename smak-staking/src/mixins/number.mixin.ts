const readableNumber = (value: number, maximumFractionDigits?: any, minimumFractionDigits = 2) => {
  if (!value || Number.isNaN(+value) || !isFinite(+value))
    return Number(0).toFixed(minimumFractionDigits)

  return new Intl.NumberFormat('en', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(+value)
}

const shortNumber = (value: number) => {
  if (!value || Number.isNaN(+value)) return 0

  const absValue = Math.abs(value)
  const prefix = Math.sign(value) === -1 ? '-' : ''

  if (absValue < 1000) {
    return `${prefix}${Number(absValue).toFixed(2)}`
  } else if (absValue >= 1000 && absValue < 1000000) {
    return `${prefix}${readableNumber(absValue / 1000, undefined, 0)}K`
  } else if (absValue >= 1000000 && absValue < 1000000000) {
    return `${prefix}${readableNumber(absValue / 1000000, undefined, 0)}M`
  } else if (absValue >= 1000000000) {
    return `${prefix}${readableNumber(absValue / 1000000000, undefined, 0)}B`
  }

  return value
}

const dashedNullNumber = (value: number) => {
  if (!value || Number.isNaN(+value)) return '--'
  return readableNumber(value)
}

const limitNumber = (
  value: number,
  maximumFractionDigits?: any,
  minimumFractionDigits = 2,
  limit = 9999
) => {
  if (value >= limit)
    return `+${readableNumber(limit, maximumFractionDigits, minimumFractionDigits)}`

  return readableNumber(value, maximumFractionDigits, minimumFractionDigits)
}

export const numberMixin = {
  filters: {
    readableNumber,
    shortNumber,
    dashedNullNumber,
    limitNumber,
  },
  methods: {
    isNumber($event: any) {
      const keyCode = $event.keyCode ? $event.keyCode : $event.which
      if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
        $event.preventDefault()
      }
    },
  },
}
