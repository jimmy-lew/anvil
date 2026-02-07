export default defineAppConfig({
  ui: {
    colors: {
      primary: 'red',
      neutral: 'zinc',
    },
    prose: {
      a: {
        base: [
          'text-white font-medium decoration-[#62666d] hover:decoration-white underline underline-offset-[clamp(2px,.225em,6px)] decoration-[clamp(1px,.1em,3px)]',
          'transition-colors',
          'border-none',
        ],
      },
    },
  },
  seo: {
    titleTemplate: '',
    title: 'Anvil',
    description: '',
  },
})
