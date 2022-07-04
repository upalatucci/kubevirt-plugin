import * as React from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { Overview, OverviewGrid } from '@openshift-console/dynamic-plugin-sdk';

import ActivityCard from './activity-card/ActivityCard';
import DetailsCard from './details-card/DetailsCard';
import GettingStartedCard from './getting-started-card/GettingStartedCard';
import InventoryCard from './inventory-card/InventoryCard';
import PermissionsCard from './permissions-card/PermissionsCard';
import RunningVMsPerTemplateCard from './running-vms-per-template-card/RunningVMsPerTemplateCard';
import StatusCard from './status-card/StatusCard';

const leftAdminCards = [{ Card: DetailsCard }, { Card: RunningVMsPerTemplateCard }];
const leftCards = [{ Card: RunningVMsPerTemplateCard }];
const mainCards = [{ Card: StatusCard }, { Card: InventoryCard }];
const rightCards = [{ Card: ActivityCard }, { Card: PermissionsCard }];

const OverviewTab: React.FC = () => {
  const isAdmin = useIsAdmin();

  return (
    <Overview>
      <GettingStartedCard />
      <OverviewGrid
        leftCards={isAdmin ? leftAdminCards : leftCards}
        mainCards={mainCards}
        rightCards={rightCards}
      />
    </Overview>
  );
};

export default OverviewTab;
