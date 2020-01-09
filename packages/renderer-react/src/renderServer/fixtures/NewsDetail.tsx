import React from 'react';
import { list } from './News';


export interface NewsDetailProps {

}

const NewsDetail: React.SFC<NewsDetailProps> = (props) => {
  const { detail, match } = props;
  const { id } = match.params;
  return (
    <div>
      <p>currentId: {id}</p>
      <p>{detail.description}</p>
    </div>
  );
};

NewsDetail.getInitialProps = async ({ match }) => {
  const { id } = match.params;
  const detail = list.find(item => Number(item.id) === Number(id));
  return Promise.resolve({
    detail,
  });
}

export default NewsDetail;
