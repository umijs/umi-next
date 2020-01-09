import React from 'react';

const News: React.FunctionComponent<{}> = (props) => {
  const { list } = props;
  return (
    <ul>{list.map(item => <li key={item.id}>{item.title}</li>)}</ul>
  );
};

export const list = [
  { id: 1, title: 'title1', description: 'description' },
  { id: 2, title: 'title2', description: 'description2' },
]

News.getInitialProps = async () => {
  return Promise.resolve({
    list,
  })
}

export default News;
