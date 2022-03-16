import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Bullseye } from '@patternfly/react-core';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

import YAMLEditor from './components/YAMLEditor';
import { convertObjectToYaml } from './components/YAMLEditor/utils';

const WizardYAMLTab: React.FC<WizardVMContextType> = ({ vm }) => {
  const yaml = convertObjectToYaml({ obj: vm });

  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <div className="yaml-editor">
        <YAMLEditor yaml={yaml} onChange={(s) => console.log(s)} />
      </div>
    </React.Suspense>
  );
};

export default WizardYAMLTab;
