import React from 'react';
import { Link } from 'react-router-dom';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartThreshold,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_global_FontSize_2xl from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_2xl';

import { getUtilizationQueries } from '../../utils/queries';
import { queriesToLink, tickFormat } from '../../utils/utils';
import ComponentReady from '../ComponentReady/ComponentReady';

type MemoryThresholdChartProps = {
  timespan: number;
  vmi: V1VirtualMachineInstance;
};

const MemoryThresholdChart: React.FC<MemoryThresholdChartProps> = ({ timespan, vmi }) => {
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
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    timespan,
  });

  const prometheusMemoryData = data?.data?.result?.[0]?.values;
  const memoryAvailableBytes = xbytes.parseSize(`${memory?.size} ${memory?.unit}B`);

  const chartData = prometheusMemoryData?.map(([, item], index) => {
    return { x: index, y: Number(item), name: 'Memory used' };
  });

  const thresholdLine = new Array(chartData?.length || 0)
    .fill(0)
    .map((_, index) => ({ x: index, y: memoryAvailableBytes, name: 'Memory available' }));

  const isReady = !isEmpty(chartData) || !isEmpty(thresholdLine);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart">
        <Link to={queriesToLink(queries?.MEMORY_USAGE)}>
          <Chart
            height={200}
            scale={{ x: 'time', y: 'linear' }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  return `${datum?.name}: ${xbytes(datum?.y, { iec: true, fixed: 2 })}`;
                }}
                labelComponent={
                  <ChartTooltip style={{ fontSize: chart_global_FontSize_2xl.value }} />
                }
                constrainToVisibleArea
              />
            }
          >
            <ChartAxis
              dependentAxis
              tickCount={2}
              tickValues={[thresholdLine?.[0]?.y]}
              tickFormat={(tick: number) => xbytes(tick, { iec: true, fixed: 0 })}
              style={{
                ticks: {
                  stroke: 'transparent',
                },
                tickLabels: {
                  fontSize: 24,
                },
              }}
              axisComponent={<></>}
            />
            <ChartAxis
              tickFormat={tickFormat(timespan)}
              style={{
                ticks: { stroke: 'transparent' },
                tickLabels: {
                  fontSize: 24,
                },
              }}
              axisComponent={<></>}
            />
            <ChartGroup>
              <ChartArea
                data={chartData}
                style={{
                  data: {
                    stroke: chart_color_blue_300.value,
                  },
                }}
              />
            </ChartGroup>
            <ChartThreshold
              data={thresholdLine}
              style={{
                data: {
                  stroke: chart_color_orange_300.value,
                  strokeDasharray: 10,
                  strokeWidth: 7,
                },
              }}
            />
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default MemoryThresholdChart;
