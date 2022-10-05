# Better Library Thing

A browser extension to improve the LibraryThing cataloguing experience. Made in support of the [Vancouver Black Library](https://www.vancouverblacklibrary.org/).

<p style="text-align:center;">
	<img src="img/vbl.png" alt="vancouver black library" style="width: 100px; height: auto">
</p>

## Features

### Warnings

While Editing a book, leaving the page without hitting Save, Cancel, or Delete Book cause a warning if there is unsaved work.

<img src="img/warning.png" alt="warning">

### Copy/Paste

While on the Edit book page, a Copy and Paste button appear to allow you to Copy and Paste entire book entries.

_TODO walk through this entire user story with pictures._


### Find PDF

While Editing a book, click on the `Find PDF` to search the internet for PDFs of the book.
Results are pulled from z-lib and libgen, with more websites to be added in the future.

<img src="img/find-pdf-before.png" alt="before clicking find pdf">
<img src="img/find-pdf-after.png" alt="after clicking find pdf">

<sub>Please make sure to check the links! They may not be perfect!</sub>

### VBL Banner

When the extension is used, the LibraryThing banner is replaced with a [Vancouver Black Library](https://www.vancouverblacklibrary.org/), so you can discern whether the extension is active at a glance.

<img src="img/banner.png" alt="banner">

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
1. Download and unzip the extension from the [releases page](https://github.com/braxtonhall/library-thing/releases)
1. Navigate to [`brave://extensions`](brave://extensions)
1. Toggle `Developer mode`
1. Click `Load unpacked`
1. Select the unzipped extension directory

## Development

### Contributing
To contribute just make a PR into the `main` branch!

1. Click `Fork` button in the top right of the [GitHub page](https://github.com/braxtonhall/library-thing)
1. Develop your feature and push to your fork
1. Click the `Pull requests` tab and then the `New pull request` in your fork
1. Set the base repo and branch to be `braxtonhall/library-thing` and `main`
1. Click `Create pull request`

### Requirements
- [Node](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Scripts
- **`yarn install`**: Gathers all dependencies. This should be run at the start of development on a new clone in the root.
- **`yarn build`**: Compiles the `.ts` files to `.js` files in the `extension/js/` dir.
- **`yarn watch`**: Runs a new build any time any file changes are detected.
- **`yarn lint`**: Lints the `extension/ts/` files.
- **`yarn fix`**: Fixes all automatically fixable lint errors in the `extension/ts/` files.
- **`yarn pretty`**: Prettifies the `extension/ts/` files.
