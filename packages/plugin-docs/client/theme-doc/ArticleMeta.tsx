export interface ArticleMetaOptions {
  createdTime?: boolean;
  updatedTime?: boolean;
  contributors?: boolean;
}

const ArticleMeta = ({
  createdTime,
  updatedTime,
  contributors,
}: ArticleMetaOptions = {}) => {};

export default ArticleMeta;
