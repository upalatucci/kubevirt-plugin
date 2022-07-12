import * as React from 'react';
import { Link } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useSSHService from '@kubevirt-utils/components/SSHAccess/useSSHService';
import useSSHCommand from '@kubevirt-utils/components/UserCredentials/useSSHCommand';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CardTitle, Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';

import { pauseVM, startVM, stopVM, unpauseVM } from '../../../../../../actions/actions';
import { printableVMStatus } from '../../../../../../utils';
import { createURL } from '../../../utils/url';

type VirtualMachinesOverviewTabDetailsTitleProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabDetailsTitle: React.FC<
  VirtualMachinesOverviewTabDetailsTitleProps
> = ({ vm }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { t } = useKubevirtTranslation();
  const [sshService] = useSSHService(vm);
  const { command } = useSSHCommand(vm, sshService);

  const isMachinePaused = vm?.status?.printableStatus === printableVMStatus.Paused;
  const isMachineStopped = vm?.status?.printableStatus === printableVMStatus.Stopped;
  const isMachineRunning = vm?.status?.printableStatus === printableVMStatus.Running;

  return (
    <CardTitle className="text-muted card-title">
      <Link to={createURL('details', location?.pathname)}>{t('Details')}</Link>
      <Dropdown
        onSelect={() => setIsDropdownOpen(false)}
        toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-disk" />}
        isOpen={isDropdownOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            onClick={() => command && navigator.clipboard.writeText(command)}
            key="copy"
            isDisabled={!isMachineRunning || !sshService}
          >
            {t('Copy SSH Command')}{' '}
            <span className="text-muted">
              <CopyIcon />
            </span>
          </DropdownItem>,
          <DropdownItem onClick={() => (isMachineStopped ? startVM(vm) : stopVM(vm))} key="stop">
            {isMachineStopped ? t('Resume VirtualMachine') : t('Stop VirtualMachine')}
          </DropdownItem>,
          <DropdownItem onClick={() => (isMachinePaused ? unpauseVM(vm) : pauseVM(vm))} key="pause">
            {isMachinePaused ? t('Unpause VirtualMachine') : t('Pause VirtualMachine')}
          </DropdownItem>,
        ]}
      />
    </CardTitle>
  );
};

export default VirtualMachinesOverviewTabDetailsTitle;
