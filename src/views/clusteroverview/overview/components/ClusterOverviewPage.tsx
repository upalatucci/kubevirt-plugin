import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, NavPage } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_QUICK_START_USER_SETTINGS_KEY } from './utils/constants';
import PageHeader from './utils/PageHeader';
import RestoreGettingStartedButton from './utils/RestoreGettingStartedButton';
import OverviewTab from './OverviewTab';
import TopConsumersTab from './TopConsumersTab';

const overviewTabs: NavPage[] = [
  {
    href: '',
    name: 'Overview',
    component: OverviewTab,
  },
  {
    href: 'performance',
    name: 'Performance',
    component: TopConsumersTab,
  },
];

const ClusterOverviewPage: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const title = t('Virtualization');
  const badge = (
    <RestoreGettingStartedButton userSettingsKey={KUBEVIRT_QUICK_START_USER_SETTINGS_KEY} />
  );

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <PageHeader title={title} badge={badge} />
      <HorizontalNav pages={overviewTabs} />
    </>
  );
};

export default ClusterOverviewPage;
