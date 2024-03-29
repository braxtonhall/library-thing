# Better LibraryThing

[link-vbl]: https://www.vancouverblacklibrary.org/ "Vancouver Black Library"

A browser extension to improve the [LibraryThing](https://www.librarything.com/) cataloguing experience. Made in support of the [Vancouver Black Library][link-vbl].

[<p align="center"><img src="src/img/vbl.png" alt="vancouver black library" style="width: 100px; height: auto"></p>][link-vbl]

## Installation

[link-chrome]: https://chrome.google.com/webstore/detail/better-librarything/hbnlneckiahefebnpdhgpohonfkkcaln "Version published on Chrome Web Store"
[link-firefox]: https://addons.mozilla.org/en-US/firefox/addon/betterlibrarything/ "Version published on Mozilla Add-ons"

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/chrome/chrome.svg" width="48" alt="Chrome" valign="middle">][link-chrome]
[<img valign="middle" src="https://img.shields.io/chrome-web-store/v/hbnlneckiahefebnpdhgpohonfkkcaln.svg?label=%20">][link-chrome]
also compatible with
[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/edge/edge.svg" width="24" alt="Edge" valign="middle">][link-chrome]
[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/opera/opera.svg" width="24" alt="Opera" valign="middle">][link-chrome]
[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/brave/brave.svg" width="24" alt="Brave" valign="middle">][link-chrome]

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/firefox/firefox.svg" width="48" alt="Firefox" valign="middle">][link-firefox]
[<img valign="middle" src="https://img.shields.io/amo/v/betterlibrarything.svg?label=%20">][link-firefox]

## Features

### Warnings

While Editing a book, leaving the page without hitting Save, Cancel, or Delete Book cause a warning if there is unsaved work.

<img src="docs/img/warning.png" alt="warning">

### Copy/Paste

On any book's page or catalog entry, click the Copy button to save a book's metadata.

You can then click the Paste button while editing a book or creating a new entry
to paste the entire book entry (except the barcode, of course).

<img src="docs/img/copy.gif" alt="warning">

### Find PDF

While Editing a book, click on the `Find PDF` to search the internet for PDFs of the book.
Results are pulled from libgen and The Internet Archive, with more websites to be added in the future.

<img src="docs/img/pdf.gif" alt="find pdf flow gif">

<sub>Please make sure to check the links! They may not be perfect!</sub>

### Find Summary

While Editing a book, click on the `Find Summary` to search the internet for summaries of the book.
Results are pulled from Goodreads and Amazon, with more websites to be added in the future.

<sub>Please make sure to review the summaries! They may not be perfect!</sub>

### Author Pages

Edit an author's tags from the Author page! For more information, see the instructions [here](./docs/librarian/authors.md).

Requires a [Tag Index](./docs/librarian/tag-index.md).

### Tag Validation

While inputting tags, if you enter a tag that is has not been added to The Tag Index, you will receive a warning from Better LibraryThing.

Additionally, tags that are cased incorrectly can be automatically fixed, and the ancestors of nested tags can be automatically inserted.

Requires a [Tag Index](./docs/librarian/tag-index.md).

### Content Warning Reminders

While inputting tags, if you enter a tag that requires a Content Warning (according to the Tag Index) and you have forgotten to input it, you will receive a warning from Better LibraryThing.

<img src="docs/img/content-warning.png" alt="forgotten content warning modal">

Requires a [Tag Index](./docs/librarian/tag-index.md).

### VBL Banner

When the extension is used, the LibraryThing banner is replaced with a [Vancouver Black Library](https://www.vancouverblacklibrary.org/) one, so you can discern whether the extension is active at a glance.

The banner will also be grey if you are not logged in to the VanBlackLibrary LibraryThing account, or if you don't have [Tag Index](./docs/librarian/tag-index.md) access.

<img src="docs/img/banner.png" alt="banner">

### Misc. Improvements

- **Resizes**: When you resize a text area in a book form, the new size saved for the next time you visit!
- **Sort Indicator**: Changing a book title's sorting will show you what the book will be sorted as directly on the form.

## Documentation

- [Author Pages](./docs/librarian/authors.md)
- [The Tag Index](./docs/librarian/tag-index.md)
- [Managing the Tag Index](./docs/librarian/tag-index-management.md)
- [Developing](./docs/developer/README.md)
- [Privacy Policy](./docs/misc/privacy-policy.md)
- [Release History](https://github.com/braxtonhall/library-thing/releases)
