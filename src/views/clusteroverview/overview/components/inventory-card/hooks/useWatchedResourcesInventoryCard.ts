import { useParams } from 'react-router-dom';

import {
  modelToGroupVersionKind,
  NodeModel,
  TemplateModel,
} from '@kubevirt-ui/kubevirt-api/console';
import NetworkAttachmentDefinitionModel from '@kubevirt-ui/kubevirt-api/console/models/NetworkAttachmentDefinitionModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';

export const useWatchedResourcesHook = () => {
  const { ns } = useParams<{ ns: string }>();

  const watchedResources = {
    vms: {
      groupVersionKind: modelToGroupVersionKind(VirtualMachineModel),
      namespaced: true,
      namespace: ns,
      isList: true,
    },
    vmTemplates: {
      groupVersionKind: modelToGroupVersionKind(TemplateModel),
      namespace: ns,
      isList: true,
    },
    nodes: {
      groupVersionKind: modelToGroupVersionKind(NodeModel),
      namespaced: false,
      isList: true,
      namespace: ns,
    },
    nads: {
      groupVersionKind: modelToGroupVersionKind(NetworkAttachmentDefinitionModel),
      namespaced: true,
      namespace: ns,
      isList: true,
    },
  };
  return watchedResources;
};
