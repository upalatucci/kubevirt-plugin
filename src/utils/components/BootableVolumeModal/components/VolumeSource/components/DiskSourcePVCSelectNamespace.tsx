import React, { Dispatch, FC, SetStateAction } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type DiskSourcePVCSelectNamespaceProps = {
  isDisabled?: boolean;
  onChange: Dispatch<SetStateAction<string>>;
  projectNames: string[];
  projectsLoaded: boolean;
  selectedProject: string;
};

const DiskSourcePVCSelectNamespace: FC<DiskSourcePVCSelectNamespaceProps> = ({
  isDisabled,
  onChange,
  projectNames,
  projectsLoaded,
  selectedProject,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'pvc-project-select';

  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('Volume project')}
    >
      {projectsLoaded ? (
        <>
          <InlineFilterSelect
            options={projectNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(ProjectModel),
              value: name,
            }))}
            toggleProps={{
              isDisabled,
              isFullWidth: true,
              placeholder: t('--- Select Volume project ---'),
            }}
            selected={selectedProject}
            setSelected={onChange}
          />
          <FormGroupHelperText>{t('Location of the existing Volume')}</FormGroupHelperText>
        </>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectNamespace;
