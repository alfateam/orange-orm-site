# Orange ORM Site

Documentation site for [Orange ORM](https://github.com/alfateam/orange-orm), built with VitePress and published with GitHub Pages.

Live site: <https://orange-orm.io/>

## Development

Install dependencies:

```sh
npm ci
```

Run the local development server:

```sh
npm run dev
```

Build the site:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Deployment

Pushes to `main` are deployed by GitHub Actions using `.github/workflows/deploy.yml`.

The site is configured for the custom domain `orange-orm.io`. The `docs/assets/CNAME` file is copied into the VitePress build output so GitHub Pages keeps the domain binding.

Because the site is served from the domain root, VitePress uses:

```ts
base: '/'
```
