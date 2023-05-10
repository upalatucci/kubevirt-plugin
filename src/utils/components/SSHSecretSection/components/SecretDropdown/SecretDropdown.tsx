import React, { FC, ReactElement, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import Loading from '../../../Loading/Loading';
import { decodeSecret } from '../../utils/utils';

type SecretDropdownProps = {
  secretsResourceData: WatchK8sResult<IoK8sApiCoreV1Secret[]>;
  id?: string;
};

const SecretDropdown: FC<SecretDropdownProps> = ({ secretsResourceData, id }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { instanceTypeVMState, setInstanceTypeVMState } = useInstanceTypeVMStore();
  const sshSecretName = instanceTypeVMState?.sshSecretCredentials?.sshSecretName;

  const [allSecrets = [], secretsLoaded, secretsError] = secretsResourceData;
  const sshKeySecrets = allSecrets
    ?.filter((secret) => secret?.data && validateSSHPublicKey(decodeSecret(secret)))
    ?.sort((a, b) => a?.metadata?.name.localeCompare(b?.metadata?.name));

  const onSelect = (_, newSecretName: string) => {
    setInstanceTypeVMState({
      type: instanceTypeActionType.setSSHCredentials,
      payload: { sshSecretName: newSecretName, sshSecretKey: '' },
    });
    setIsOpen(false);
  };

  const filterSecrets = (_, userInput: string): ReactElement[] =>
    sshKeySecrets
      ?.filter((secret) => getName(secret)?.includes(userInput))
      ?.map((secret) => {
        const name = getName(secret);
        return <SelectOption key={name} value={name} />;
      });

  if (!secretsLoaded) return <Loading />;

  if (secretsError)
    return (
      <Alert title={t('Error')} isInline variant={AlertVariant.danger}>
        {secretsError?.message}
      </Alert>
    );

  return (
    <Select
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onSelect={onSelect}
      variant={SelectVariant.single}
      onFilter={filterSecrets}
      hasInlineFilter
      selections={sshSecretName}
      placeholderText={t('--- Select secret ---')}
      maxHeight={400}
      id={id || 'select-secret'}
    >
      {sshKeySecrets?.map((secret) => {
        const name = getName(secret);
        return <SelectOption key={name} value={name} />;
      })}
    </Select>
  );
};

export default SecretDropdown;