import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

const discussionIcon = fs.readFileSync(path.resolve(__dirname, '../assets/discussion.svg'), 'utf-8')
const siteUrl = 'https://orange-orm.io/'
const siteTitle = 'ORANGE ORM'
const siteDescription = 'Fetch rows directly in the browser. Developer friendly, concise with powerful filtering.'
const previewTitle = 'Orange ORM - The ultimate ORM for Node and TypeScript'
const previewImage = `${siteUrl}social-preview.png`

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: siteTitle,
  description: siteDescription,
  ignoreDeadLinks: false,
  head: [
    ['link', { rel: 'icon', href: '/icon.svg' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#f7931e' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:title', content: previewTitle }],
    ['meta', { property: 'og:description', content: siteDescription }],
    ['meta', { property: 'og:image', content: previewImage }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'Orange ORM logo' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: previewTitle }],
    ['meta', { name: 'twitter:description', content: siteDescription }],
    ['meta', { name: 'twitter:image', content: previewImage }],
    ['meta', { name: 'twitter:image:alt', content: 'Orange ORM logo' }],
  ],
  lang: 'en-US',
  lastUpdated: false,
  sitemap: {
    hostname: 'https://orange-orm.io/',
  },
  themeConfig: {
    logo: '/icon.svg',
    siteTitle: 'ORANGE ORM',

    footer: {
      message: 'Released under the ISC License.',
      copyright: 'Copyright 2014-present Lars-Erik Roald',
    },

    // Optional links in top navigation
    // nav: [{ text: 'Home', link: '/' }],

    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    sidebar: [
      {
        text: 'GETTING STARTED',
        collapsed: false,
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Connecting', link: '/connecting' },
          { text: 'Mapping tables', link: '/mapping-tables' },
          { text: 'Data types', link: '/data-types' },
          { text: 'Enums', link: '/enums' },
          { text: 'Example', link: '/example' },
        ],
      },
      {
        text: 'CRUD',
        collapsed: false,
        items: [
          { text: 'Inserting rows', link: '/inserting-rows' },
          { text: 'Fetching rows', link: '/fetching-rows' },
          { text: 'Updating rows', link: '/updating-rows' },
          { text: 'Upserting rows', link: '/upserting-rows' },
          { text: 'Deleting rows', link: '/deleting-rows' },
        ],
      },
      {
        text: 'FILTERS',
        collapsed: false,
        items: [
          { text: 'Basic filters', link: '/basic-filters' },
          { text: 'Relation filters', link: '/relation-filters' },
          { text: 'And, or, not, exists', link: '/logical-filters' },
          { text: 'Any, all, none', link: '/any-filters' },
          { text: 'Fetching strategies', link: '/fetching-strategies' },
        ],
      },
      {
        text: 'CONSTRAINTS',
        collapsed: false,
        items: [
          { text: 'Default values', link: '/default-values' },
          { text: 'Validation', link: '/validation' },
          { text: 'Composite keys', link: '/composite-keys' },
          { text: 'Column discriminators', link: '/column-discriminators' },
          { text: 'Formula discriminators', link: '/formula-discriminators' },
        ],
      },
      {
        text: 'ADVANCED FEATURES',
        collapsed: false,
        items: [
          { text: 'Transactions', link: '/transactions' },
          { text: 'Raw sql queries', link: '/raw-sql-queries' },
          { text: 'Aggregate functions', link: '/aggregates' },
          { text: 'Excluding sensitive data', link: '/excluding-sensitive-data' },
        ],
      },
      {
        text: 'RUNTIME',
        collapsed: false,
        items: [
          { text: 'Logging', link: '/logging' },
          { text: 'In the browser', link: '/in-the-browser' },
          { text: 'SQLite user-defined functions', link: '/sqlite-user-defined-functions' },
        ],
      },
      {
        text: 'PROJECT',
        collapsed: false,
        items: [
          { text: 'What it is not', link: '/what-it-is-not' },
          { text: 'Changelog', link: 'https://github.com/alfateam/orange-orm/blob/master/docs/changelog.md' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/alfateam/orange-orm' },
      { icon: { svg: discussionIcon }, link: 'https://github.com/alfateam/orange-orm/discussions' },
      { icon: 'discord', link: 'https://discord.com/invite/QjuEgvQXzd' },
    ],
  },
  vite: {
    publicDir: './assets',
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // suppress build warning (bun)
          if (warning.code === 'INVALID_ANNOTATION') {
            return
          }
          warn(warning)
        },
      },
    },
    plugins: [llmstxt()],
  },
})
