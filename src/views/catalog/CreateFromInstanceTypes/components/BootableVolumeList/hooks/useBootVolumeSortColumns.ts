import { useState } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  V1alpha1PersistentVolumeClaim,
  V1alpha2VirtualMachineClusterPreference,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { getBootableVolumePVCSource } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

type UseBootVolumeSortColumns = (
  unsortedData: BootableVolume[],
  preferences: {
    [resourceKeyName: string]: V1alpha2VirtualMachineClusterPreference;
  },
  pvcSources: {
    [resourceKeyName: string]: V1alpha1PersistentVolumeClaim;
  },
  pagination: PaginationState,
) => {
  sortedData: BootableVolume[];
  getSortType: (columnIndex: number) => ThSortType;
};

const useBootVolumeSortColumns: UseBootVolumeSortColumns = (
  unsortedData = [],
  preferences,
  pvcSources,
  pagination,
) => {
  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | null>(null);

  const getSortableRowValues = (bootableVolume: BootableVolume): string[] => {
    const pvcSource = getBootableVolumePVCSource(bootableVolume, pvcSources);

    return [
      getName(bootableVolume),
      getName(preferences[bootableVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL]]),
      pvcSource?.spec?.storageClassName,
      pvcSource?.spec?.resources?.requests?.storage,
      bootableVolume?.metadata?.annotations?.[DESCRIPTION_ANNOTATION],
    ];
  };

  const sortVolumes = (a: BootableVolume, b: BootableVolume): number => {
    const aValue = getSortableRowValues(a)[activeSortIndex];
    const bValue = getSortableRowValues(b)[activeSortIndex];

    if (activeSortDirection === 'asc') {
      return aValue?.localeCompare(bValue);
    }
    return bValue?.localeCompare(aValue);
  };

  const getSortType = (columnIndex: number): ThSortType => ({
    sortBy: {
      defaultDirection: 'asc',
      direction: activeSortDirection,
      index: activeSortIndex,
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const sortedData = unsortedData
    .sort(sortVolumes)
    .slice(pagination.startIndex, pagination.endIndex);
  return { sortedData, getSortType };
};

export default useBootVolumeSortColumns;
