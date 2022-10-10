import React from 'react';
import { Link } from 'react-router-dom';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
// import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_blue_400 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_global_FontSize_2xl from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_2xl';

import { getMultilineUtilizationQueries } from '../../utils/queries';
import { queriesToLink, tickFormat } from '../../utils/utils';
import ComponentReady from '../ComponentReady/ComponentReady';

type NetworkThresholdChartProps = {
  timespan: number;
  vmi: V1VirtualMachineInstance;
};

const NetworkThresholdChart: React.FC<NetworkThresholdChartProps> = ({ timespan, vmi }) => {
  const queries = React.useMemo(
    () =>
      getMultilineUtilizationQueries({
        vmName: vmi?.metadata?.name,
      }),
    [vmi],
  );

  const [networkInQuery, networkOutQuery] = queries?.NETWORK_USAGE;

  const [networkIn] = usePrometheusPoll({
    query: networkInQuery?.query,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    timespan,
  });

  const [networkOut] = usePrometheusPoll({
    query: networkOutQuery?.query,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    timespan,
  });

  const networkInData = networkIn?.data?.result?.[0]?.values;
  const networkOutData = networkOut?.data?.result?.[0]?.values;
  const chartDataIn = networkInData?.map(([, item], index) => {
    return { x: index, y: Number(item), name: 'Network In' };
  });

  const chartDataOut = networkOutData?.map(([, item], index) => {
    return { x: index, y: Number(item), name: 'Network Out' };
  });

  const isReady = !isEmpty(chartDataOut) || !isEmpty(chartDataIn);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart">
        <Link to={queriesToLink([networkInQuery?.query, networkOutQuery?.query])}>
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
                data={chartDataOut}
                style={{
                  data: {
                    stroke: chart_color_blue_300.value,
                  },
                }}
              />
              <ChartArea
                data={chartDataIn}
                style={{
                  data: {
                    stroke: chart_color_blue_400.value,
                  },
                }}
              />
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default NetworkThresholdChart;
