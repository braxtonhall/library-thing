# Development

## Contributing
To contribute just make a PR into the `main` branch!

1. Click `Fork` button in the top right of the [GitHub page](https://github.com/braxtonhall/library-thing)
1. Develop your feature and push to your fork
1. Click the `Pull requests` tab and then the `New pull request` in your fork
1. Set the base repo and branch to be `braxtonhall/library-thing` and `main`
1. Click `Create pull request`

## Requirements
- [Node](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

## Scripts
- **`yarn install`**: Gathers all dependencies. This should be run at the start of development on a new clone in the root.
- **`yarn build`**: Compiles the `.ts` files to `.js` files in the `extension/js/` dir.
- **`yarn watch`**: Runs a new build any time any file changes are detected.
- **`yarn lint`**: Lints the `extension/ts/` files.
- **`yarn fix`**: Fixes all automatically fixable lint errors in the `extension/ts/` files.
- **`yarn pretty`**: Prettifies the `extension/ts/` files.
- **`yarn test`**: Runs all `*.spec.ts` files the `test/` directory.
