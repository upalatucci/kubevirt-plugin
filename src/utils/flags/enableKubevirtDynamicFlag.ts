import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';
import { useIsFleetAvailable } from '@stolostron/multicluster-sdk';

import { FLAG_KUBEVIRT_DYNAMIC, FLAG_KUBEVIRT_DYNAMIC_ACM } from './consts';

export const enableKubevirtDynamicFlag = (setFeatureFlag: SetFeatureFlag) =>
  setFeatureFlag(FLAG_KUBEVIRT_DYNAMIC, true);

export const useKubevirtDynamicACMFlag = (setFeatureFlag: SetFeatureFlag) => {
  const hasACMFleetSupport = useIsFleetAvailable();
  setFeatureFlag(FLAG_KUBEVIRT_DYNAMIC_ACM, hasACMFleetSupport);
};
