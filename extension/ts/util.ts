const getElementsByTag = (parent: HTMLElement) => (tag: string) => Array.from(parent?.getElementsByTagName(tag) ?? []);

const getElementsByTags = (parent: HTMLElement, tags: string[]) => tags.flatMap(getElementsByTag(parent));

export {getElementsByTag, getElementsByTags};
