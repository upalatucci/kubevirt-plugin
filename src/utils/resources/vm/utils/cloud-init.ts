import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCredentialsFromUserData } from '@kubevirt-utils/utils/user-data';

import { getVolumes } from './selectors';

export const getCloudInitCredentials = (
  vm: V1VirtualMachine,
): { user: string; password: string } => {
  const cloudInitVolume = getVolumes(vm)?.find(
    (volume) => volume?.cloudInitNoCloud || volume?.cloudInitConfigDrive,
  );

  const cloudInit = cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

  return getCredentialsFromUserData(cloudInit?.userData);
};
