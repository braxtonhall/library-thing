# Tag Index Requirements

The document is intended for VBL librarians.
It describes the requirements of [The Tag Index](https://docs.google.com/spreadsheets/d/1EfwBhY56M8OwgVjFTWxxxdoIxK8osw2vfgsXnCyGGuA) such that it integrates with Better LibraryThing.

## Availability
1. The Tag Index must be a [Google Sheet](https://docs.google.com/spreadsheets).
1. Anyone who will be using Better LibraryThing with this Tag Index must be able to edit the sheet.

## Authors Sheet

In order to support [author tagging](./authors.md), Better LibraryThing will store author tags in The Tag Index.

1. There _must_ be a single sheet in The Tag Index labelled **Authors**.
1. Column `A` _must_ be the ID of an author as used by LibraryThing.
1. Column `B` _must_ be the name of the author.
1. Column `C` _must_ be the author tags.
1. None of these columns can be hidden, however the sheet itself may be hidden.
1. Additionally, there must be _another_ sheet in The Tag Index labelled **LOOKUP**. This sheet should be hidden.

Example:

<img src="../img/tag-index/authors.png" alt="Example Author sheet in the Tag Index">

## Tag Sheets

In order to perform validation of tags, Better LibraryThing will read all the tags stored in The Tag Index.

Every sheet that contains tags should have its tags stored in a table with no additional labels in it.
This table is assumed to be of infinite length.

Examples:

<img src="../img/tag-index/tag-sheet.png" alt="Example tag sheet in the Tag Index">
<img src="../img/tag-index/tag-sheet-2.png" alt="Second example tag sheet in the Tag Index">


## Tag Index _Index_

The Tag Index _Index_ is used to tell Better Library Thing where all the tables of tags are.

1. There _must_ be a single sheet in The Tag Index called **Tag Index Index**
1. Column `A` _must_ be the name of a sheet where there are tags
1. Column `B` _must_ be the top left cell in that sheet where there are tags
1. Column `C` _must_ be the width of the table in that sheet that contains tags
1. Column `D` is optional, and can specify which column contains a [Content Warning](#content-warnings)
1. Column `E` is optional, and can [remap tags](#tag-remapping)

Example sheet with Tags:

<img src="../img/tag-index/geography-sheet.png" alt="Example Geography Sheet">

Example Tag Index _Index_:

<img src="../img/tag-index/tag-index-index.png" alt="Example Tag Index Index">

### Content Warnings

Some tags may require a content warning, which is a short
description of possible trigger material in a book entry's comments,
formatted as:
> CW: actual content warning

In the Tag Index, to say that a Content Warning is required,
a tag's row will have a cell flagging it as needed one.
All Content Warning flags are in the same column for each sheet.

To tell Better LibraryThing where these Content Warning flags are,
in the [Tag Index _Index_'s](#tag-index-index) Content Warning Column,
indicate the column containing Content Warning flags by its exact letter.

If the Tag Index _Index_ is formatted correctly, and a tag is flagged
as requiring a Content Warning, then catalogers will be notified
if they have included a tag that requires a Content Warning if they
forgot to include one.

### Tag Remapping

A tag remapper is a string which transforms tags as they are read by Better LibraryThing. A tag remapper _must_ contain `$TAG`.
Tag remapping allows a Librarian to quickly add many tags that are transformations of existing tags without editing the existing spreadsheet.

For example, given a `Colours` sheet containing the tags `Red`, `Green`, and `Blue`, and the tag remapper `$TAG author`,
Better LibraryThing will artificially inflate the Tag Index with the new tags `Red author`, `Green author`, and `Blue author`
when performing tag validation or tag auto-completion.

Created for VBL with the intention of Librarians remapping the `Identity` sheet with `$TAG author`.
