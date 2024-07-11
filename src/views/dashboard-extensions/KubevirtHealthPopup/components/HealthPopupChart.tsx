import React, { FC, useMemo } from 'react';

import { AlertsByHealthImpact } from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts';

import { alertTypeToColorMap } from '../utils/utils';

import EmptyStateNoAlerts from './EmptyStateNoAlerts';

type HealthPopupChartProps = {
  alerts: AlertsByHealthImpact;
  numberOfAlerts?: number;
};

const HealthPopupChart: FC<HealthPopupChartProps> = ({ alerts, numberOfAlerts }) => {
  const totalNumberAlerts = useMemo(
    () => Object.values(alerts)?.reduce((acc, alertType) => acc + (alertType?.length || 0), 0),
    [alerts],
  );

  const chartData = useMemo(
    () =>
      Object.keys(alerts)?.reduce((acc, alertType) => {
        const numAlertsForType: number = alerts[alertType]?.length;
        const percentage: number = Math.round((numAlertsForType / totalNumberAlerts) * 100);
        acc.push({
          fill: alertTypeToColorMap[alertType],
          x: alertType,
          y: percentage,
        });
        return acc;
      }, []),
    [alerts, totalNumberAlerts],
  );

  if (numberOfAlerts === 0)
    return <EmptyStateNoAlerts classname="kv-health-popup__empty-state--no-alerts" />;

  return (
    <div>
      <ChartDonut
        padding={{
          bottom: 0,
          left: 20,
          right: 20,
          top: -20,
        }}
        style={{
          data: {
            fill: ({ datum }) => datum?.fill,
          },
        }}
        ariaDesc={t('Virtualization Alerts')}
        ariaTitle={t('Virtualization Alerts donut chart')}
        data={chartData}
        height={200}
        labels={({ datum }) => `${datum?.x}: ${datum?.y}%`}
        subTitle={t('Alerts')}
        title={totalNumberAlerts?.toString()}
        width={200}
      />
    </div>
  );
};

export default HealthPopupChart;
