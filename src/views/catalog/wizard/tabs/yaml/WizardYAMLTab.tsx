import * as React from 'react';
import { load } from 'js-yaml';

import { WizardTab } from '@catalog/wizard/tabs';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionCloseButton, AlertVariant, Bullseye } from '@patternfly/react-core';

import './WizardYAMLTab.scss';

const WizardYAMLTab: WizardTab = ({ vm, updateVM, setDisableVmCreate }) => {
  const { t } = useKubevirtTranslation();
  const [error, setError] = React.useState<any>();
  const [success, setSuccess] = React.useState(false);

  const onSave = (yaml: string) => {
    setError(undefined);
    updateVM(load(yaml) as V1VirtualMachine)
      .then(() => setSuccess(true))
      .catch((apiError) => {
        setError(apiError);
        setSuccess(false);
      });
  };

  React.useEffect(() => {
    setDisableVmCreate(Boolean(error));
    return () => setDisableVmCreate(false);
  }, [error, setDisableVmCreate]);

  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <ResourceYAMLEditor initialResource={vm} onSave={onSave} />
      {error && (
        <div className="wizard-yaml-alert">
          <Alert
            isInline
            variant={AlertVariant.danger}
            title={t(
              'An error occured, The VirtualMachine was not updated. Click "Reload" to go back to the last valid state',
            )}
          >
            {error.message}
          </Alert>
        </div>
      )}
      {success && (
        <div className="wizard-yaml-alert">
          <Alert
            isInline
            variant={AlertVariant.success}
            title={t('Success')}
            actionClose={<AlertActionCloseButton onClose={() => setSuccess(false)} />}
          >
            {t('VirtualMachine updated successfully')}
          </Alert>
        </div>
      )}
    </React.Suspense>
  );
};

export default WizardYAMLTab;
