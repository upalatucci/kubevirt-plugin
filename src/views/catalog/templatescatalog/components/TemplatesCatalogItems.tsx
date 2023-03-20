import React, { useMemo, VFC } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Gallery, StackItem } from '@patternfly/react-core';

import useTemplatesCatalogColumns from '../hooks/useTemplatesCatalogColumns';
import { TemplateFilters } from '../hooks/useVmTemplatesFilters';
import { findDuplicateDisplayNames } from '../utils/helpers';

import { TemplatesCatalogRow } from './TemplatesCatalogRow';
import { TemplateTile } from './TemplatesCatalogTile';

type TemplatesCatalogItemsProps = {
  templates: V1Template[];
  availableTemplatesUID: Set<string>;
  availableDatasources: Record<string, V1beta1DataSource>;
  bootSourcesLoaded: boolean;
  filters: TemplateFilters;
  onTemplateClick: (template: V1Template) => void;
  loaded: boolean;
};

export const TemplatesCatalogItems: VFC<TemplatesCatalogItemsProps> = ({
  templates,
  availableTemplatesUID,
  availableDatasources,
  bootSourcesLoaded,
  filters,
  onTemplateClick,
  loaded,
}) => {
  const columns = useTemplatesCatalogColumns();

  const sortedTemplates = useMemo(
    () =>
      templates.sort((a: V1Template, b: V1Template) =>
        a?.metadata?.name?.localeCompare(b?.metadata?.name),
      ),
    [templates],
  );

  const duplicateDisplayNames = useMemo(() => findDuplicateDisplayNames(templates), [templates]);

  return filters?.isList ? (
    <div className="vm-catalog-table-container">
      <VirtualizedTable
        data={templates}
        unfilteredData={templates}
        loaded={loaded && bootSourcesLoaded}
        loadError={null}
        columns={columns}
        Row={TemplatesCatalogRow}
        rowData={{
          onTemplateClick,
          availableTemplatesUID,
          availableDatasources,
          duplicateDisplayNames,
        }}
      />
    </div>
  ) : (
    <StackItem className="co-catalog-page__grid vm-catalog-grid-container">
      <Gallery hasGutter className="vm-catalog-grid" id="vm-catalog-grid">
        {sortedTemplates.map((template) => (
          <TemplateTile
            key={template?.metadata?.uid}
            template={template}
            onClick={onTemplateClick}
            availableTemplatesUID={availableTemplatesUID}
            availableDatasources={availableDatasources}
            bootSourcesLoaded={bootSourcesLoaded}
          />
        ))}
      </Gallery>
    </StackItem>
  );
};
