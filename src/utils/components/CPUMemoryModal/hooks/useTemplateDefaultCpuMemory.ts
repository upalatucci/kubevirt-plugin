import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getCPUcores, getMemorySize } from '../utils/CpuMemoryUtils';

type UseTemplateDefaultCpuMemory = (
  templateName: string,
  templateNamespace: string,
) => {
  data: {
    defaultMemory: { size: number; unit: string };
    defaultCpu: number;
  };
  loaded: boolean;
  error: any;
};

const useTemplateDefaultCpuMemory: UseTemplateDefaultCpuMemory = (
  templateName,
  templateNamespace,
) => {
  const [template, loaded, error] = useK8sWatchResource<V1Template>(
    templateName &&
      templateNamespace && {
        groupVersionKind: modelToGroupVersionKind(TemplateModel),
        name: templateName,
        namespace: templateNamespace,
      },
  );

  const defaultMemory = getMemorySize(
    template?.objects?.[0]?.spec?.template?.spec?.domain?.resources?.requests?.memory,
  );
  const defaultCpu = getCPUcores(template?.objects?.[0]);

  return {
    data: {
      defaultMemory,
      defaultCpu,
    },
    loaded,
    error,
  };
};

export default useTemplateDefaultCpuMemory;
