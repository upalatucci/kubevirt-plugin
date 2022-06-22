import * as React from 'react';

import { Overview } from '@openshift-console/dynamic-plugin-sdk';

import TopConsumersCard from './top-consumers-card/TopConsumersCard';

const TopConsumersTab: React.FC = () => (
  <Overview>
    <TopConsumersCard />
  </Overview>
);

export default TopConsumersTab;
