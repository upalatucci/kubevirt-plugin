import * as React from 'react';

import {
  DashboardsOverviewPrometheusActivity as DynamicDashboardsOverviewPrometheusActivity,
  DashboardsOverviewResourceActivity,
  DashboardsOverviewResourceActivity as DynamicDashboardsOverviewResourceActivity,
  isDashboardsOverviewPrometheusActivity as isDynamicDashboardsOverviewPrometheusActivity,
  isDashboardsOverviewResourceActivity as isDynamicDashboardsOverviewResourceActivity,
  useK8sModels,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  LoadedExtension,
  ResolvedExtension,
} from '@openshift-console/dynamic-plugin-sdk/lib/types';

const useDashboardActivities = () => {
  const [models] = useK8sModels();

  const [dynamicResourceActivityExtensions] =
    useResolvedExtensions<DynamicDashboardsOverviewResourceActivity>(
      isDynamicDashboardsOverviewResourceActivity,
    );

  const resourceActivities: (
    | LoadedExtension<DashboardsOverviewResourceActivity>
    | ResolvedExtension<DynamicDashboardsOverviewResourceActivity>
  )[] = React.useMemo(
    () =>
      dynamicResourceActivityExtensions?.filter((e) => Boolean(models?.[e.properties.k8sResource.kind])),
    [dynamicResourceActivityExtensions, models],
  );

  const [dynamicPrometheusActivities] =
    useResolvedExtensions<DynamicDashboardsOverviewPrometheusActivity>(
      isDynamicDashboardsOverviewPrometheusActivity,
    );

  return {
    resourceActivities,
    prometheusActivities: dynamicPrometheusActivities,
  };
};

export default useDashboardActivities;
