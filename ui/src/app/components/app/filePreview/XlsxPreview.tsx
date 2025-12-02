import React, { useCallback, useEffect, useRef } from 'react';
import { SpreadSheets } from '../../core/spreadjs/SpreadSheets';
import { useBool } from '../../../../bootstrap/hooks/utils/useBool';

export interface XLSheet {
  label: string,
  value: number,
}

export interface OnLoadProps {
  sheets: XLSheet[];
}

export interface XlsxPreviewProps {
  // File object or a url (object url)
  file: string | File | Blob,
  onLoad: (x: OnLoadProps) => void,
  activeSheet?: XLSheet,
}

export function XlsxPreview({ file, onLoad, activeSheet }: XlsxPreviewProps) {
  const refSpreadSheet = useRef<SpreadSheets>(null);
  const [ssReady, setSSReady] = useBool(false);

  const loadFile = useCallback(async () => {
    let blob: Blob;
    if (file instanceof File || file instanceof Blob) {
      blob = file;
    } else {
      blob = await (await fetch(file)).blob();
    }
    const fileInJson = await refSpreadSheet.current.loadExcelFileBlob(blob) as { sheets: [] };
    const sheets = Reflect.ownKeys(fileInJson.sheets).map((a, sheetIndex) => {
      refSpreadSheet.current.setSheetReadOnly(sheetIndex, true);
      return { label: a as string, value: sheetIndex + 1 };
    });
    onLoad({ sheets });
  }, [onLoad, file]);

  useEffect(() => {
    if (ssReady) {
      loadFile().catch(console.error);
    }
  }, [loadFile, ssReady]);

  useEffect(() => {
    if (ssReady && refSpreadSheet.current) {
      if (activeSheet) {
        refSpreadSheet.current.setActiveSheet(activeSheet.label);
      }
    }
  }, [ssReady, activeSheet]);

  return (
    <SpreadSheets onReady={setSSReady} showToolbar={false} ref={refSpreadSheet}/>
  );
}
