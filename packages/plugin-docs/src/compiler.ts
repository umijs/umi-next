import { logger } from '@umijs/utils';
// @ts-ignore
import { createProcessor } from '../compiled/@mdx-js/mdx';
// @ts-ignore
import rehypeSlug from '../compiled/rehype-slug';
// @ts-ignore
import remarkGfm from '../compiled/remark-gfm';

export async function compile(opts: { content: string; fileName: string }) {
  const compiler = createProcessor({
    jsx: true,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  });
  try {
    let result = String(await compiler.process(opts.content));
    result = result.replace(
      'function MDXContent(props = {}) {',
      `
import { useEffect } from 'react';

function MDXContent(props = {}) {

  useEffect(() => {
    if (window.location.hash.length !== 0) {
      const hash = window.location.hash;
      window.location.hash = '';
      window.location.hash = hash;
    }
  }, []);

`,
    );
    return { result };
  } catch (e: any) {
    logger.error(e.reason);
    logger.error(`Above error occurred in ${opts.fileName} at line ${e.line}`);
    logger.error(
      opts.content
        .split('\n')
        .filter((_, i) => i == e.line - 1)
        .join('\n'),
    );
    logger.error(' '.repeat(e.column - 1) + '^');
    return { result: '' };
  }
}
