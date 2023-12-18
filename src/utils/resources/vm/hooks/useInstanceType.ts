import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1VirtualMachineInstancetype,
  V1InstancetypeMatcher,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInstanceTypeModelFromMatcher } from '@kubevirt-utils/resources/instancetype/helper';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseInstanceType = (instanceTypeMatcher: V1InstancetypeMatcher) => {
  instanceType: V1beta1VirtualMachineInstancetype;
  instanceTypeLoaded: boolean;
  instanceTypeLoadError: Error;
};

const useInstanceType: UseInstanceType = (instanceTypeMatcher) => {
  const [instanceType, instanceTypeLoaded, instanceTypeLoadError] =
    useK8sWatchResource<V1beta1VirtualMachineInstancetype>(
      !isEmpty(instanceTypeMatcher) && {
        groupVersionKind: modelToGroupVersionKind(
          getInstanceTypeModelFromMatcher(instanceTypeMatcher),
        ),
        name: instanceTypeMatcher.name,
      },
    );

  return {
    instanceType,
    instanceTypeLoaded,
    instanceTypeLoadError,
  };
};

export default useInstanceType;
