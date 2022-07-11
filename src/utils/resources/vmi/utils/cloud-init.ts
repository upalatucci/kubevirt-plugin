import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCredentialsFromUserData } from '@kubevirt-utils/utils/user-data';

export const getCloudInitCredentials = (
  vmi: V1VirtualMachineInstance,
): { user: string; password: string } => {
  const cloudInitVolume = vmi?.spec?.volumes?.find(
    (volume) => volume?.cloudInitNoCloud || volume?.cloudInitConfigDrive,
  );

  const cloudInit = cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

  return getCredentialsFromUserData(cloudInit?.userData);
};
