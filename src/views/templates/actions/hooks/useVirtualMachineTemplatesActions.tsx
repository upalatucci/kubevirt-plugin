import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { isCommonVMTemplate } from 'src/views/templates/utils';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespace } from '@kubevirt-utils/hooks/useLastNamespace';
import { Action, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import EditBootSourceModal from '../components/EditBootSourceModal';
import { hasEditableBootSource } from '../editBootSource';

type useVirtualMachineTemplatesActionsProps = (
  template: V1Template,
) => [actions: Action[], onLazyActions: () => void];

export const EDIT_TEMPLATE_ID = 'edit-template';
const useVirtualMachineTemplatesActions: useVirtualMachineTemplatesActionsProps = (
  template: V1Template,
) => {
  const { t } = useKubevirtTranslation();
  const isCommonTemplate = isCommonVMTemplate(template);
  const { createModal } = useModal();
  const history = useHistory();
  const [editableBootSource, setEditableBootSource] = React.useState<boolean>(null);
  const [lastNamespace] = useLastNamespace();

  const goToTemplatePage = React.useCallback(
    (clonedTemplate: V1Template) => {
      history.push(
        `/k8s/ns/${clonedTemplate.metadata.namespace}/templates/${clonedTemplate.metadata.name}`,
      );
    },
    [history],
  );

  const onLazyActions = React.useCallback(async () => {
    if (editableBootSource === null) {
      const editable = await hasEditableBootSource(template);
      setEditableBootSource(editable);
    }
  }, [editableBootSource, template]);

  const onDelete = async () => {
    await k8sDelete({
      model: TemplateModel,
      resource: template,
    });
    const lastNamespacePath =
      lastNamespace === ALL_NAMESPACES ? lastNamespace : `ns/${lastNamespace}`;
    history.push(`/k8s/${lastNamespacePath}/templates`);
  };

  const actions = [
    {
      id: EDIT_TEMPLATE_ID,
      label: t('Edit Template'),
      cta: () =>
        // lead to the template details page
        history.push(`/k8s/ns/${template.metadata.namespace}/templates/${template.metadata.name}`),
    },
    {
      id: 'clone-template',
      label: t('Clone Template'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <CloneTemplateModal
            obj={template}
            isOpen={isOpen}
            onClose={onClose}
            onTemplateCloned={goToTemplatePage}
          />
        )),
    },
    {
      id: 'edit-boot-source',
      label: (
        <>
          {t('Edit boot source')} {editableBootSource === null && <Loading />}
        </>
      ),
      description: editableBootSource
        ? t('This will change the Boot source that may be used by other templates')
        : t('Boot source cannot be edited'),
      disabled: !editableBootSource,
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <EditBootSourceModal obj={template} isOpen={isOpen} onClose={onClose} />
        )),
    },
    {
      id: 'edit-labels',
      description: isCommonTemplate && t('Labels cannot be edited for Red Hat templates'),
      disabled: isCommonTemplate,
      label: t('Edit labels'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <LabelsModal
            obj={template}
            isOpen={isOpen}
            onClose={onClose}
            onLabelsSubmit={(labels) =>
              k8sPatch({
                model: TemplateModel,
                resource: template,
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/labels',
                    value: labels,
                  },
                ],
              })
            }
          />
        )),
    },
    {
      id: 'edit-annotations',
      description: isCommonTemplate && t('Annotations cannot be edited for Red Hat templates'),
      disabled: isCommonTemplate,
      label: t('Edit annotations'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <AnnotationsModal
            obj={template}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={(updatedAnnotations) =>
              k8sPatch({
                model: TemplateModel,
                resource: template,
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/annotations',
                    value: updatedAnnotations,
                  },
                ],
              })
            }
          />
        )),
    },
    {
      id: 'delete-template',
      label: t('Delete Template'),
      description: isCommonTemplate && t('Red Hat template cannot be deleted'),
      disabled: isCommonTemplate,
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            obj={template}
            isOpen={isOpen}
            onClose={onClose}
            headerText={t('Delete VirtualMachine Template?')}
            onDeleteSubmit={onDelete}
          />
        )),
    },
  ];

  return [actions, onLazyActions];
};

export default useVirtualMachineTemplatesActions;
