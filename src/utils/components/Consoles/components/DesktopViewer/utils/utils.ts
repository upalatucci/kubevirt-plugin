import { saveAs } from 'file-saver';

import {
  IoK8sApiCoreV1Pod,
  IoK8sApiCoreV1Service,
  IoK8sApiCoreV1ServicePort,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { RDP_CONSOLE_TYPE, SPICE_CONSOLE_TYPE, VNC_CONSOLE_TYPE } from '../../utils/ConsoleConsts';

import {
  DEFAULT_RDP_MIMETYPE,
  DEFAULT_RDP_PORT,
  DEFAULT_VV_MIMETYPE,
  TEMPLATE_VM_NAME_LABEL,
} from './constants';
import { ConsoleDetailPropType, Network } from './types';

export const getServicePort = (
  service: IoK8sApiCoreV1Service,
  targetPort: number,
): IoK8sApiCoreV1ServicePort =>
  service?.spec?.ports?.find((servicePort) => targetPort === Number(servicePort.targetPort));

const findVMServiceWithPort = (
  vmi: V1VirtualMachineInstance,
  allServices: IoK8sApiCoreV1Service[],
  targetPort: number,
): IoK8sApiCoreV1Service =>
  allServices?.find(
    (service) =>
      vmi?.metadata?.name === service?.spec?.selector?.[TEMPLATE_VM_NAME_LABEL] &&
      Boolean(getServicePort(service, targetPort)),
  );

export const findRDPServiceAndPort = (
  vmi: V1VirtualMachineInstance,
  allServices: IoK8sApiCoreV1Service[],
): [IoK8sApiCoreV1Service, IoK8sApiCoreV1ServicePort] => {
  if (!vmi) {
    return [null, null];
  }
  const service = findVMServiceWithPort(vmi, allServices, DEFAULT_RDP_PORT);
  return [service, getServicePort(service, DEFAULT_RDP_PORT)];
};

export const getRdpAddressPort = (
  vmi: V1VirtualMachineInstance,
  services: IoK8sApiCoreV1Service[],
  launcherPod: IoK8sApiCoreV1Pod,
): ConsoleDetailPropType => {
  const [rdpService, rdpPortObj] = findRDPServiceAndPort(vmi, services);

  if (!rdpService || !rdpPortObj) {
    return null;
  }

  let { port } = rdpPortObj;
  let address: string;
  switch (rdpService?.spec?.type) {
    case 'LoadBalancer':
      address = rdpService?.spec?.externalIPs?.[0];
      if (!address) {
        console.warn('External IP is not defined for the LoadBalancer RDP Service: ', rdpService);
      }
      break;
    case 'NodePort':
      port = rdpPortObj?.nodePort;
      if (launcherPod) {
        address = launcherPod?.status?.hostIP;
      }
      if (!address) {
        console.warn(
          'Node IP (launcherpod.status.hostIP) is not yet known for NodePort RDP Service: ',
          rdpService,
        );
      }
      break;
    default:
      console.error('Unrecognized Service type: ', rdpService);
  }

  if (!address || !port) {
    return null;
  }

  console.log('RDP requested for: ', address, port);
  return {
    address,
    port,
  };
};

export const downloadFile = (fileName: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, fileName);
};

const generateVVFile = (
  console: ConsoleDetailPropType,
  type: string,
): { content: string; mimeType: string } => {
  const TYPES = {
    [VNC_CONSOLE_TYPE]: 'vnc',
    [SPICE_CONSOLE_TYPE]: 'spice',
  };

  const content =
    '[virt-viewer]\n' +
    `type=${TYPES?.[type] || type}\n` +
    `host=${console?.address}\n` +
    `port=${console?.port}\n` +
    'delete-this-file=1\n' +
    'fullscreen=0\n';

  return {
    content,
    mimeType: DEFAULT_VV_MIMETYPE,
  };
};

const generateRDPFile = (console: ConsoleDetailPropType): { content: string; mimeType: string } => {
  const port = console?.port || DEFAULT_RDP_PORT;
  const content = [
    `full address:s:${console?.address}:${port}`,
    '\nusername:s:Administrator',
    '\nscreen mode id:i:2', // set 2 for full screen
    '\nprompt for credentials:i:1',
    '\ndesktopwidth:i:0',
    '\ndesktopheight:i:0',
    '\nauthentication level:i:2',
    '\nredirectclipboard:i:1',
    '\nsession bpp:i:32',
    '\ncompression:i:1',
    '\nkeyboardhook:i:2',
    '\naudiocapturemode:i:0',
    '\nvideoplaybackmode:i:1',
    '\nconnection type:i:2',
    '\ndisplayconnectionbar:i:1',
    '\ndisable wallpaper:i:1',
    '\nallow font smoothing:i:1',
    '\nallow desktop composition:i:0',
    '\ndisable full window drag:i:1',
    '\ndisable menu anims:i:1',
    '\ndisable themes:i:0',
    '\ndisable cursor setting:i:0',
    '\nbitmapcachepersistenable:i:1',
    '\naudiomode:i:0',
    '\nredirectcomports:i:0',
    '\nredirectposdevices:i:0',
    '\nredirectdirectx:i:1',
    '\nautoreconnection enabled:i:1',
    '\nnegotiate security layer:i:1',
    '\nremoteapplicationmode:i:0',
    '\nalternate shell:s:',
    '\nshell working directory:s:',
    '\ngatewayhostname:s:',
    '\ngatewayusagemethod:i:4',
    '\ngatewaycredentialssource:i:4',
    '\ngatewayprofileusagemethod:i:0',
    '\npromptcredentialonce:i:1',
    '\nuse redirection server name:i:0',
    '\n',
  ].join('');

  return {
    content,
    mimeType: DEFAULT_RDP_MIMETYPE,
  };
};

export const generateDescriptorFile = (
  console: ConsoleDetailPropType,
  type: string,
): { content: string; mimeType: string } => {
  return type === RDP_CONSOLE_TYPE ? generateRDPFile(console) : generateVVFile(console, type);
};

export const getVmRdpNetworks = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): Network[] => {
  const networks = vm?.spec?.template?.spec?.networks?.filter((n) => n?.multus || n?.pod);
  return (vmi?.status?.interfaces || [])
    .filter((i) => networks?.some((n) => n?.name === i?.name))
    .map((i) => {
      let ip = i?.ipAddress;
      if (ip) {
        const subnetIndex = i?.ipAddress?.indexOf('/');
        if (subnetIndex > 0) {
          ip = i?.ipAddress?.slice(0, subnetIndex);
        }
      }
      const network = networks?.find((n) => n?.name === i?.name);
      return {
        name: i?.name,
        type: network?.multus ? 'MULTUS' : 'POD',
        ip,
      };
    });
};

export const getDefaultNetwork = (networks: Network[]) => {
  if (networks?.length === 1) {
    return networks?.[0];
  }
  if (networks?.length > 1) {
    return (
      networks?.find((n) => n?.type === 'POD' && n?.ip) ||
      networks?.find((n) => n?.type === 'MULTUS')
    );
  }
  return null;
};
