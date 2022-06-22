import * as React from 'react';

type PageHeaderProps = {
  badge?: React.ReactNode;
  title?: string | JSX.Element;
};

const PageHeader: React.FC<PageHeaderProps> = ({ badge, title }) => (
  <div className="co-m-nav-title">
    <h1 className="co-m-pane__heading">
      <div className="co-m-pane__name co-resource-item">
        <span data-test-id="resource-title" className="co-resource-item__resource-name">
          {title}
        </span>
      </div>
      <span className="co-m-pane__heading-badge">{badge}</span>
    </h1>
  </div>
);

export default PageHeader;
