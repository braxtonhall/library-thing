# Better Library Thing

A browser extension to improve the LibraryThing cataloguing experience. Made in support of the [Vancouver Black Library](https://www.vancouverblacklibrary.org/).

<p align="center">
	<img src="extension/img/vbl.png" alt="vancouver black library" style="width: 100px; height: auto">
</p>

## Features

### Warnings

While Editing a book, leaving the page without hitting Save, Cancel, or Delete Book cause a warning if there is unsaved work.

<img src="docs/img/warning.png" alt="warning">

### Copy/Paste

While on the Edit book page, a Copy and Paste button appear to allow you to Copy and Paste entire book entries.

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

### Tag Validation

While inputting tags, if you enter a tag that is has not been added to The Tag Index, you will receive a warning from Better LibraryThing.

Additionally, tags that are cased incorrectly can be automatically fixed, and the ancestors of nested tags can be automatically inserted.

### VBL Banner

When the extension is used, the LibraryThing banner is replaced with a [Vancouver Black Library](https://www.vancouverblacklibrary.org/), so you can discern whether the extension is active at a glance.

The banner will also be grey if you are not logged in to the VanBlackLibrary LibraryThing and Google accounts.

<img src="docs/img/banner.png" alt="banner">

### Misc. Improvements
- **Resizes**: When you resize a text area in a book form, the new size saved for the next time you visit!
- **Sort Indicator**: Changing a book title's sorting will show you what the book will be sorted as directly on the form.

## Installation
See the [installation guide](./docs/librarian/installation.md).

## Documentation

- [Managing the Tag Index](./docs/librarian/tag-index.md)
- [Developing](./docs/developer/README.md)
