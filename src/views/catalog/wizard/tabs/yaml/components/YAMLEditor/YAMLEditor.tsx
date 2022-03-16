import * as React from 'react';

import { CodeEditor, Language } from '@patternfly/react-code-editor';

type YAMLEditorProps = {
  yaml: string;
  onChange: (yaml: string) => void;
  isReadOnly?: boolean;
  onEditorDidMount?: (editor: any) => void;
};

const YAMLEditor: React.FC<YAMLEditorProps> = ({
  yaml,
  isReadOnly,
  onChange,
  onEditorDidMount,
}) => {
  return (
    <CodeEditor
      isDarkTheme
      isLineNumbersVisible
      code={yaml}
      onChange={onChange}
      language={Language.yaml}
      onEditorDidMount={onEditorDidMount}
      isReadOnly={isReadOnly}
      options={{
        scrollBeyondLastLine: false,
      }}
      isMinimapVisible
      isUploadEnabled
      isDownloadEnabled
      isCopyEnabled
      height="100%"
    />
  );
};

export default YAMLEditor;
