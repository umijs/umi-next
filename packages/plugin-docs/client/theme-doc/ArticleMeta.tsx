import React from 'react';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';
import getCurrentRoute from './utils/getCurrentRoute';

export interface ArticleContributor {
  username: string;
  email: string;
  commitCount: number;
}

export interface ArticleGitMeta {
  createdTime: number;
  updatedTime: number;
  contributors: ArticleContributor[];
}

export interface ArticleMetaOptions {
  displayUpdatedTime?: boolean;
  displayContributors?: boolean;
}

const getDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

const getContributorsTitle = (contributors: ArticleContributor[]): string => {
  return contributors
    .map((contributor) => {
      const commitCount = contributor.commitCount;
      return `${contributor.username} [${commitCount} ${
        commitCount > 1 ? 'commits' : 'commit'
      }] <${contributor.email}>`;
    })
    .join(', ');
};

export default ({
  displayUpdatedTime = true,
  displayContributors = true,
}: ArticleMetaOptions = {}) => {
  const { location, appData } = useThemeContext()!;
  const lang = useLanguage();
  const route = getCurrentRoute(appData, lang, location);

  if (!route || !route.git || (!displayUpdatedTime && !displayContributors)) {
    return <></>;
  }

  const routeGit: ArticleGitMeta = route.git;
  const createdTime = routeGit.createdTime * 1000;
  const updatedTime = routeGit.updatedTime * 1000;
  const contributors = routeGit.contributors;
  return (
    <div className="text-base leading-8 text-neutral-500 dark:text-neutral-300 mt-20 mb-8 flex flex-col cursor-default md:flex-row md:justify-between">
      {displayUpdatedTime && (
        <div
          className="flex basis-1/2 mr-0 md:mr-4"
          title={`Created At: ${getDate(createdTime)}`}
        >
          <div className="text-sky-600 dark:text-fuchsia-300 font-medium mr-1">
            {lang.render('Last Updated')}:
          </div>
          <div>{getDate(updatedTime)}</div>
        </div>
      )}
      {displayContributors && (
        <div
          className="flex justify-start md:justify-end basis-1/2"
          title={getContributorsTitle(contributors)}
        >
          <div className="text-sky-600 dark:text-fuchsia-300 font-medium mr-1">
            {lang.render('Contributors')}:
          </div>
          <div>
            {contributors.map((contributor) => contributor.username).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};
