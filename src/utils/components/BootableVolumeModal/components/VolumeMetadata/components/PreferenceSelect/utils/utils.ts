import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sGroupVersionKind, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getResourceDropdownOptions = (
  resources: K8sResourceCommon[],
  groupVersionKind: K8sGroupVersionKind,
  onClick: () => void,
  group?: string,
): EnhancedSelectOptionProps[] =>
  resources
    ?.map(getName)
    ?.sort((a, b) => a.localeCompare(b))
    ?.map((opt) => ({
      children: opt,
      group,
      groupVersionKind,
      onClick,
      value: opt,
    }));
