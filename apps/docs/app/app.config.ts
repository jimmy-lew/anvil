export default defineAppConfig({
  ui: {
    colors: {
      primary: 'red',
      neutral: 'zinc',
    },
    prose: {
      a: {
        base: [
          'text-black dark:text-white font-medium decoration-[#a6a4ad] dark:decoration-[#62666d] hover:decoration-black dark:hover:decoration-white underline underline-offset-[clamp(2px,.225em,6px)] decoration-[clamp(1px,.1em,3px)]',
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
