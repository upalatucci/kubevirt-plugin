import { TFunction } from 'react-i18next';

import { TemplateParameter, V1Template } from '@kubevirt-ui/kubevirt-api/console';

import {
  extractParameterNameFromMetadataName,
  FormErrors,
  getVirtualMachineNameField,
  hasCustomizableDiskSource,
} from '../../utils';
import { DISK_SOURCE } from '../DiskSource';

import { CustomizeFormActions } from './actions';

type State = {
  template: V1Template;
  loading: boolean;
  parametersErrors: FormErrors['parameters'];
  diskSourceError: FormErrors['diskSource'];
  volumeError: FormErrors['volume'];
  diskSourceCustomization: DISK_SOURCE;
  customizableDiskSource: boolean;
  requiredFields: TemplateParameter[];
  optionalFields: TemplateParameter[];
  apiError: string;
};

export const initialState: State = {
  template: undefined,
  loading: false,
  parametersErrors: undefined,
  diskSourceError: undefined,
  volumeError: undefined,
  diskSourceCustomization: undefined,
  customizableDiskSource: undefined,
  requiredFields: [],
  optionalFields: [],
  apiError: undefined,
};

const buildFields = (
  template: V1Template,
  parametersToFilter: string[],
  t: TFunction,
): Array<TemplateParameter[]> => {
  const optionalFields = template.parameters?.filter(
    (parameter) => !parameter.required && !parametersToFilter.includes(parameter.name),
  );
  const requiredFields = template.parameters?.filter(
    (parameter) => parameter.required && !parametersToFilter.includes(parameter.name),
  );

  requiredFields?.unshift(getVirtualMachineNameField(template, t));

  return [requiredFields, optionalFields];
};

export const initializeReducer = (template: V1Template, t: TFunction): State => {
  const parameterForName = extractParameterNameFromMetadataName(template);

  const [requiredFields, optionalFields] = buildFields(template, [parameterForName], t);

  return {
    ...initialState,
    requiredFields,
    optionalFields,
    customizableDiskSource: hasCustomizableDiskSource(template),
  };
};

export type Action =
  | { type: CustomizeFormActions.FormError; payload: FormErrors }
  | { type: CustomizeFormActions.Loading }
  | { type: CustomizeFormActions.Success }
  | { type: CustomizeFormActions.ApiError; payload: string }
  | { type: CustomizeFormActions.SetParameter; payload: { value: string; parameter: string } }
  | { type: CustomizeFormActions.SetDiskSource; payload: DISK_SOURCE };

export default (state: State, action: Action): State => {
  switch (action.type) {
    case CustomizeFormActions.Loading:
      return {
        ...state,
        loading: true,
      };
    case CustomizeFormActions.FormError:
      return {
        ...state,
        parametersErrors: action.payload?.parameters,
        diskSourceError: action.payload?.diskSource,
        volumeError: action.payload?.volume,
        loading: false,
      };
    case CustomizeFormActions.Success:
      return {
        ...state,
        loading: false,
      };
    case CustomizeFormActions.ApiError:
      return {
        ...state,
        apiError: action.payload,
        loading: false,
      };
    case CustomizeFormActions.SetDiskSource:
      return {
        ...state,
        diskSourceCustomization: action.payload,
        parametersErrors: undefined,
        diskSourceError: undefined,
        volumeError: undefined,
      };
    default:
      return state;
  }
};
