import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    rules: {
      'react/no-unescaped-entities': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'warn',
    },
  },
]

