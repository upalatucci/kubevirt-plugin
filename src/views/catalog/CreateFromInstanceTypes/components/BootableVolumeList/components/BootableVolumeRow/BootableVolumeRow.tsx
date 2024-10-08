import React, { FC, MouseEvent } from 'react';

import { InstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { getTemplateOSIcon, getVolumeNameOSIcon } from '@catalog/templatescatalog/utils/os-icons';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { BOOTABLE_VOLUME_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDeprecated } from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  getVolumeSnapshotSize,
  getVolumeSnapshotStorageClass,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import {
  isDataSourceCloning,
  isDataSourceUploading,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { Label, Text, TextVariants } from '@patternfly/react-core';
import { TableText, Tr, WrapModifier } from '@patternfly/react-table';

import TableData from './TableData';

import './BootableVolumeRow.scss';

type BootableVolumeRowProps = {
  activeColumnIDs: string[];
  bootableVolume: BootableVolume;
  rowData: {
    bootableVolumeSelectedState: [BootableVolume, InstanceTypeVMStore['onSelectCreatedVolume']];
    favorites: [isFavorite: boolean, updaterFavorites: (val: boolean) => void];
    preference: V1beta1VirtualMachineClusterPreference;
    pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
    volumeSnapshotSource: VolumeSnapshotKind;
  };
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  activeColumnIDs,
  bootableVolume,
  rowData: {
    bootableVolumeSelectedState: [selectedBootableVolume, setSelectedBootableVolume],
    favorites,
    preference,
    pvcSource,
    volumeSnapshotSource,
  },
}) => {
  const { t } = useKubevirtTranslation();
  const bootVolumeName = getName(bootableVolume);
  const sizeData = formatBytes(
    pvcSource?.spec?.resources?.requests?.storage || getVolumeSnapshotSize(volumeSnapshotSource),
  );
  const icon = getVolumeNameOSIcon(bootVolumeName) || getTemplateOSIcon(preference);

  const [isFavorite, addOrRemoveFavorite] = favorites;

  const handleOnClick = () => {
    setSelectedBootableVolume(bootableVolume, pvcSource, volumeSnapshotSource);
    logITFlowEvent(BOOTABLE_VOLUME_SELECTED, null, {
      selectedBootableVolume: getName(bootableVolume),
    });
  };

  return (
    <Tr
      className="bootable-volume-row"
      isClickable
      isRowSelected={getName(selectedBootableVolume) === bootVolumeName}
      isSelectable
      onClick={() => handleOnClick()}
    >
      <TableData
        favorites={{
          isFavorited: isFavorite,
          onFavorite: (e: MouseEvent, isFavoring: boolean) => {
            e.stopPropagation();
            addOrRemoveFavorite(isFavoring);
          },
        }}
        activeColumnIDs={activeColumnIDs}
        id="favorites"
      />
      <TableData activeColumnIDs={activeColumnIDs} id="name" width={20}>
        <img alt="os-icon" className="vm-catalog-row-icon" src={icon} />
        <Text className="bootable-volume-row__name--text" component={TextVariants.small}>
          {bootVolumeName}
        </Text>
        {isDeprecated(bootVolumeName) && <DeprecatedBadge />}
        {isDataSourceCloning(bootableVolume as V1beta1DataSource) && (
          <Label className="vm-catalog-row-label">{t('Clone in progress')}</Label>
        )}
        {isDataSourceUploading(bootableVolume as V1beta1DataSource) && (
          <Label className="vm-catalog-row-label">{t('Upload in progress')}</Label>
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="operating-system" width={20}>
        {preference?.metadata?.annotations?.[ANNOTATIONS.displayName] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class" width={20}>
        {getVolumeSnapshotStorageClass(volumeSnapshotSource) ||
          pvcSource?.spec?.storageClassName ||
          NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size" width={10}>
        {sizeData}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={ANNOTATIONS.description} width={30}>
        <TableText wrapModifier={WrapModifier.truncate}>
          {bootableVolume?.metadata?.annotations?.[ANNOTATIONS.description] || NO_DATA_DASH}
        </TableText>
      </TableData>
    </Tr>
  );
};

export default BootableVolumeRow;
