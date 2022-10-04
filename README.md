# Better Library Thing

A browser extension to improve the LibraryThing cataloguing experience

## Features

### Warnings

While Editing a book, leaving the page without hitting Save, Cancel, or Delete Book cause a warning if there is unsaved work.

_TODO walk through this entire user story with pictures._

### Copy/Paste

While on the Edit book page, a Copy and Paste button appear to allow you to Copy and Paste entire book entries.

_TODO walk through this entire user story with pictures._

## Installation

_TODO get the extension on the releases page._

### Chrome
1. Download and unzip the extension from the [releases page](https://github.com/braxtonhall/library-thing/releases)
1. Navigate to [`chrome://extensions`](chrome://extensions)
1. Toggle `Developer mode`
1. Click `Load unpacked`
1. Select the unzipped extension directory

### Firefox
Not yet supported

### Safari
Not yet supported

### Edge
Not yet supported

### Opera
1. Download and unzip the extension from the [releases page](https://github.com/braxtonhall/library-thing/releases)
1. Navigate to [`opera://extensions`](opera://extensions)
1. Toggle `Developer mode`
1. Click `Load unpacked`
1. Select the unzipped extension directory

### Brave
Not yet supported

## Development

### Contributing
To contribute just make a PR into the `main` branch!

1. Click `Fork` button in the top right of the [GitHub page](https://github.com/braxtonhall/library-thing)
2. Develop your feature and push to your fork
3. Click the `Pull requests` tab and then the `New pull request` in your fork
4. Set the base repo and branch to be `braxtonhall/library-thing` and `main`
5. Click `Create pull request`

### Requirements
- [Node](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Scripts
- **`yarn install`**: Gathers all dependencies. This should be run at the start of development on a new clone in the root.
- **`yarn build`**: Compiles the `.ts` files to `.js` files in the `extension/js/` dir.
- **`yarn watch`**: Runs a new build any time any file changes are detected.
<!-- - **`yarn lint`**: Lints the `src/` files. -->
