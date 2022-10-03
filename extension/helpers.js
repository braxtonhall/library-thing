const getElementsByTag = (parent) => (tag) =>
    parent.getElementsByTagName ? Array.from(parent.getElementsByTagName(tag)) :  [];

const getElementsByTags = (parent, tags) =>
    tags.flatMap(getElementsByTag(parent));
