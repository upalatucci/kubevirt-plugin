import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import {
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY as ALL_NAMESPACES_ACTIVE_KEY,
} from './constants';

type UseActiveNamespacePathType = () => string;

export const useLastNamespacePath: UseActiveNamespacePathType = () => {
  const [lastNamespace] = useLastNamespace();
  return lastNamespace === ALL_NAMESPACES_ACTIVE_KEY ? ALL_NAMESPACES : `ns/${lastNamespace}`;
};
