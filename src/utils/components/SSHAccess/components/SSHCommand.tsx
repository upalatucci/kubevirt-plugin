import React, { useEffect, useState } from 'react';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  ClipboardCopy,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { SERVICE_TYPES } from '../constants';
import useSSHCommand from '../useSSHCommand';
import { createSSHService, deleteSSHService } from '../utils';

import SSHServiceSelect from './SSHServiceSelect';

type SSHCommandProps = {
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
  sshService: IoK8sApiCoreV1Service;
  sshServiceLoaded?: boolean;
};

const SSHCommand: React.FC<SSHCommandProps> = ({
  vmi,
  vm,
  sshService: initialSSHService,
  sshServiceLoaded,
}) => {
  const { t } = useKubevirtTranslation();
  const [sshService, setSSHService] = useState<IoK8sApiCoreV1Service>();
  const { command, sshServiceRunning } = useSSHCommand(vm, sshService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const onSSHChange = async (newServiceType: SERVICE_TYPES | undefined) => {
    setLoading(true);
    const servicesPromises = [];

    try {
      servicesPromises.push(
        sshService ? deleteSSHService(sshService) : new Promise<void>((resolve) => resolve()),
      );
      servicesPromises.push(
        !newServiceType || newServiceType === SERVICE_TYPES.NONE
          ? new Promise<void>((resolve) => resolve())
          : createSSHService(vm, vmi, newServiceType),
      );

      await Promise.allSettled(servicesPromises).then(([deleteResult, createResult]) => {
        if (deleteResult.status === 'rejected') throw deleteResult.reason;
        if (createResult.status === 'rejected') throw createResult.reason;
        setSSHService(createResult.value);
      });
    } catch (apiError) {
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSSHService(initialSSHService);
    setError(undefined);
  }, [initialSSHService]);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm className="pf-u-font-size-xs">
        {t('SSH service type')}{' '}
        <Popover
          aria-label={'Help'}
          position="right"
          bodyContent={
            <span>
              {t(
                'A Service of type NodePort opens a specific port on all Nodes in the cluster.\nIf the Node is publicly accessible, any traffic that is sent to this port is forwarded to the Service.',
              )}{' '}
              <a
                target="_blank"
                href="https://access.redhat.com/documentation/en-us/openshift_container_platform/4.11/html-single/networking/index#configuring-ingress-cluster-traffic-nodeport"
                rel="noreferrer"
              >
                {t('Learn more about configuring ingress cluster traffic using a NodePort.')}
              </a>
            </span>
          }
        >
          <HelpIcon />
        </Popover>
      </DescriptionListTerm>

      <DescriptionListDescription>
        <Stack hasGutter>
          {sshServiceLoaded && !loading ? (
            <>
              <StackItem>
                <SSHServiceSelect
                  sshService={sshService}
                  sshServiceLoaded={sshServiceLoaded}
                  onSSHChange={onSSHChange}
                />
              </StackItem>

              {sshServiceRunning && (
                <StackItem>
                  <ClipboardCopy
                    isReadOnly
                    data-test="ssh-command-copy"
                    clickTip={t('Copied')}
                    hoverTip={t('Copy to clipboard')}
                  >
                    {command}
                  </ClipboardCopy>
                </StackItem>
              )}
            </>
          ) : (
            <Loading />
          )}
          {error && (
            <StackItem>
              <Alert variant={AlertVariant.danger} title={t('Error')} isInline>
                {error?.message}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default SSHCommand;
