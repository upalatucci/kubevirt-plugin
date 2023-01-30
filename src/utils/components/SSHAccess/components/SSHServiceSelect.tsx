import React, { FC } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sModels } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { SERVICE_TYPES } from '../constants';

type SSHServiceSelectProps = {
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded: boolean;
  onSSHChange: (serviceType: SERVICE_TYPES) => void;
};

const SSHServiceSelect: FC<SSHServiceSelectProps> = ({
  sshService,
  sshServiceLoaded,
  onSSHChange,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const models = useK8sModels();

  console.log(models);

  const handleChange = (event: React.ChangeEvent<Element>, newValue: string) => {
    setIsOpen(false);

    if (newValue === sshService?.spec?.type) return;
    onSSHChange(newValue as SERVICE_TYPES);
  };

  return (
    <Select
      menuAppendTo="parent"
      isOpen={isOpen}
      onToggle={setIsOpen}
      onSelect={handleChange}
      variant={SelectVariant.single}
      selections={sshService?.spec?.type ?? SERVICE_TYPES.NONE}
      isDisabled={!sshServiceLoaded}
    >
      <SelectOption value={SERVICE_TYPES.NONE}>{t('None')}</SelectOption>
      <SelectOption
        value={SERVICE_TYPES.NODE_PORT}
        description={t(
          'Opens a specific port on all Nodes in the cluster. If the Node is publicly accessible, any trtaffic that is sent to this port is forwarded to the Service',
        )}
      >
        {t('SSH over NodePort')}
      </SelectOption>
      <SelectOption
        value={SERVICE_TYPES.LOAD_BALANCER}
        description={t(
          'Assigns an external IP address to the VirtualMachine. This option requires a LoadBalancer Service backend',
        )}
      >
        {t('SSH over LoadBalancer')}
      </SelectOption>
    </Select>
  );
};

export default SSHServiceSelect;
