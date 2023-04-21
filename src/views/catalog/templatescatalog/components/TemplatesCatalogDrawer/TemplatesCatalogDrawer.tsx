import React, { FC, useEffect } from 'react';
import { useImmer } from 'use-immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getTemplateName } from '@kubevirt-utils/resources/template/utils/selectors';
import { CatalogItemHeader } from '@patternfly/react-catalog-view-extension';
import { Modal } from '@patternfly/react-core';

import { getTemplateOSIcon } from '../../utils/os-icons';

import { TemplatesCatalogDrawerFooter } from './TemplatesCatalogDrawerFooter';
import { TemplatesCatalogDrawerPanel } from './TemplatesCatalogDrawerPanel';

import './TemplateCatalogDrawer.scss';

type TemplatesCatalogDrawerProps = {
  namespace: string;
  template: V1Template | undefined;
  isOpen: boolean;
  onClose: () => void;
};

export const TemplatesCatalogDrawer: FC<TemplatesCatalogDrawerProps> = ({
  namespace,
  template,
  isOpen,
  onClose,
}) => {
  const [editableTemplate, setEditableTemplate] = useImmer(template);

  useEffect(() => {
    setEditableTemplate(template);
  }, [template, setEditableTemplate]);

  const templateName = getTemplateName(editableTemplate);
  const osIcon = getTemplateOSIcon(editableTemplate);

  return (
    <Modal
      aria-label="Template drawer"
      className="ocs-modal co-catalog-page__overlay co-catalog-page__overlay--right template-catalog-drawer"
      isOpen={isOpen}
      onClose={onClose}
      disableFocusTrap
      header={
        <CatalogItemHeader
          className="co-catalog-page__overlay-header"
          title={templateName}
          vendor={editableTemplate?.metadata?.name}
          iconImg={osIcon}
        />
      }
      footer={
        template && (
          <TemplatesCatalogDrawerFooter
            namespace={namespace}
            template={editableTemplate}
            onCancel={onClose}
          />
        )
      }
    >
      <TemplatesCatalogDrawerPanel
        template={editableTemplate}
        setEditableTemplate={setEditableTemplate}
      />
    </Modal>
  );
};
