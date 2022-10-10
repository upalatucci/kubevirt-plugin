import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { Card, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import GeneralTab from './General Tab/GeneralTab';

import './settings-tab.scss';

const SettingsTab: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeTab, setActiveTab] = React.useState<number>(0);
  return (
    <Overview>
      <Card className="settings-tab__card">
        <Tabs
          activeKey={activeTab}
          onSelect={(_, activeKey) => setActiveTab(Number(activeKey))}
          isVertical
          className="settings-tab__menu"
        >
          <Tab eventKey={0} title={<TabTitleText>{t('General')}</TabTitleText>}>
            <div className="settings-tab__content">
              <GeneralTab />
            </div>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>{t('Live migration')}</TabTitleText>}>
            <div className="settings-tab__content">Live migration placeholder</div>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>{t('Templates project')}</TabTitleText>}>
            <div className="settings-tab__content">Templates project placeholder</div>
          </Tab>
        </Tabs>
      </Card>
    </Overview>
  );
};

export default SettingsTab;
