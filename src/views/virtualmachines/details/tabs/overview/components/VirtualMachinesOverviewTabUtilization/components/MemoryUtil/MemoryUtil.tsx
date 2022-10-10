import React from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';

import { getUtilizationQueries, PrometheusEndpoint } from '../../utils/queries';
import ComponentReady from '../ComponentReady/ComponentReady';

type MemoryUtilProps = {
  vmi: V1VirtualMachineInstance;
};

const MemoryUtil: React.FC<MemoryUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const queries = React.useMemo(
    () => getUtilizationQueries({ vmName: vmi?.metadata?.name }),
    [vmi],
  );

  const requests = vmi?.spec?.domain?.resources?.requests as {
    [key: string]: string;
  };
  const memory = getMemorySize(requests?.memory);

  const [data] = usePrometheusPoll({
    query: queries?.MEMORY_USAGE,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace: vmi?.metadata?.namespace,
  });

  const memoryUsed = Number(data?.data?.result?.[0]?.value?.[1]);
  const memoryAvailableBytes = xbytes.parseSize(`${memory?.size} ${memory?.unit}B`);
  const percentageMemoryUsed = (memoryUsed / memoryAvailableBytes) * 100;
  const isReady = !isEmpty(memory) && !Number.isNaN(percentageMemoryUsed);

  return (
    <div className="util">
      <div className="util-upper">
        <div className="util-title">{t('Memory')}</div>
        <div className="util-summary" data-test-id="util-summary-memory">
          <div className="util-summary-value">
            {xbytes(memoryUsed || 0, { iec: true, fixed: 0 })}
          </div>
          <div className="util-summary-text text-muted">
            <div>{t('Used of ')}</div>
            <div>{`${memory?.size} ${memory?.unit}B`}</div>
          </div>
        </div>
      </div>
      <div className="util-chart">
        <ComponentReady isReady={isReady}>
          <ChartDonutUtilization
            constrainToVisibleArea
            animate
            data={{
              x: t('Memory used'),
              y: Number(percentageMemoryUsed?.toFixed(2)),
            }}
            labels={({ datum }) =>
              datum.x ? `${datum.x}: ${xbytes(memoryUsed || 0, { iec: true })}` : null
            }
            subTitle={t('Used')}
            subTitleComponent={<ChartLabel y={135} />}
            title={`${Number(percentageMemoryUsed?.toFixed(2))}%`}
          />
        </ComponentReady>
      </div>
    </div>
  );
};

export default MemoryUtil;
