import React, { ElementType, useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page as PdfPage, pdfjs } from 'react-pdf';
import { noopFunc } from '../../../../bootstrap/utils/noop';
import { useToggle } from '../../../../bootstrap/hooks/utils/useToggle';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { useMeasure } from 'react-use';
import { Button, Icon, Input, Tooltip, Text, Heading, Flex, HStack, ButtonProps, Box } from '@chakra-ui/react';
import { FlexCol } from '../../../../bootstrap/chakra/components/layouts/FlexCol';
import {
  NextPageIcon,
  PageViewIcon,
  PrevPageIcon,
  RotateLeftIcon,
  RotateRightIcon,
  ScrollViewIcon, ZoomInIcon, ZoomOutIcon,
  ZoomResetIcon,
} from '../icons';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export interface OnLoadProps {
  numPages: number,
}

export interface PdfPreviewProps {
  // File object or a url (object url)
  file: string | File | Blob,
  onLoad: (x: OnLoadProps) => void,
}

interface ToolbarButtonProps extends ButtonProps {
  icon: ElementType,
  tooltip: string,
  disabled?: boolean,
}

function ToolbarButton({ icon, tooltip, disabled, ...rest }: ToolbarButtonProps) {
  return (
    <Tooltip label={tooltip} isDisabled={disabled}>
      <Button variant="ghost" colorScheme="secondary" disabled={disabled} {...rest}>
        <Icon as={icon} fontSize="lg"/>
      </Button>
    </Tooltip>
  );
}

const CDocument = Document;

export function PdfPreview({ file, onLoad = noopFunc }: PdfPreviewProps) {
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [scale, setScale] = React.useState(1.0);
  const [scrollView, toggleScrollView] = useToggle(true);
  const [angle, setAngle] = useState(0);

  const zoomIn = React.useCallback(() => setScale(scale * 1.1), [scale]);
  const zoomOut = React.useCallback(() => setScale(scale / 1.1), [scale]);
  const zoomReset = React.useCallback(() => setScale(1), []);
  const [initialScaleSet, setInitialScaleSet] = useState(false);

  const canvasRef = useRef<HTMLDivElement>();
  const [previewWrapperRef, { width }] = useMeasure();

  const handleRenderSuccess = useCallback(() => {
    if (!initialScaleSet && width > 0 && canvasRef.current.clientWidth > 0) {
      const scale = (width * 0.8) / canvasRef.current.clientWidth;
      // const scale = (height - 8) / canvasRef.current.clientHeight;
      setScale(scale);
      setInitialScaleSet(true);
    }
  }, [width, initialScaleSet]);

  const handleDocumentLoadSuccess = React.useCallback(({ numPages }) => {
    setPageCount(numPages);
    onLoad({ numPages });
  }, [onLoad]);

  const handlePageChange = React.useCallback((page) => {
    if (Number(page) <= pageCount) {
      setPageNumber(+page);
    } else {
      setPageNumber(pageCount);
    }
  }, [pageCount]);

  const nextDisabled = pageNumber >= pageCount;
  const prevDisabled = pageNumber <= 1;

  const minPages = Math.min(pageCount, 3);

  const [pagesToRender, setPagesToRender] = useState(minPages);

  const handleRenderSuccess2 = useCallback(() => {
    if (pagesToRender < pageCount) {
      setTimeout(() => setPagesToRender(pagesToRender + 1), 200);
    }
  }, [pageCount, pagesToRender]);

  useEffect(() => {
    if (!scrollView) {
      setPagesToRender(minPages);
    }
  }, [scrollView, minPages]);

  return (
    <FlexCol align="center" bg="primary.700" w="100%" h="100%">
      <Flex
        flexShrink={0} h={12} bg="primary.100" justify="space-between" align="center" boxShadow="md" alignSelf="stretch"
      >
        <Flex align="center">
          <ToolbarButton
            tooltip={scrollView ? 'Page View' : 'Scroll View'}
            onClick={toggleScrollView}
            icon={scrollView ? PageViewIcon : ScrollViewIcon}
            mx={2}
          />

          {!scrollView && (
            <HStack align="center">
              <Text fontSize="sm" textAlign="center">Page</Text>
              <Input
                size="sm"
                value={`${pageNumber}`} min={1} max={pageCount}
                w={pageNumber < 10 ? '2.5rem' : '3rem'}
                onChange={(e) => handlePageChange(e.target.value)}
              />
              <Text fontSize="sm">Of {pageCount}</Text>
              <Flex>
                <ToolbarButton
                  icon={PrevPageIcon} tooltip="Previous Page" disabled={prevDisabled}
                  onClick={() => handlePageChange(pageNumber - 1)}
                />
                <ToolbarButton
                  icon={NextPageIcon} tooltip="Next Page" disabled={nextDisabled}
                  onClick={() => handlePageChange(pageNumber + 1)}
                />
              </Flex>
            </HStack>
          )}
        </Flex>

        <HStack align="center">
          <ToolbarButton
            icon={RotateLeftIcon} tooltip="Rotate Anti-Clockwise" onClick={() => setAngle((angle + 270) % 360)}
          />
          <ToolbarButton
            icon={RotateRightIcon} tooltip="Rotate Clockwise" onClick={() => setAngle((angle + 90) % 360)}
          />
          <ToolbarButton icon={ZoomInIcon} tooltip="Zoom in" onClick={zoomIn}/>
          <ToolbarButton icon={ZoomResetIcon} tooltip="reset Zoom" onClick={zoomReset}/>
          <ToolbarButton icon={ZoomOutIcon} tooltip="Zoom out" onClick={zoomOut}/>
        </HStack>
      </Flex>

      <FlexCol flexGrow={1} alignSelf="stretch" py={2}>
        <FlexCol flexGrow={1} ref={previewWrapperRef} overflow="visible">
          <CDocument file={file} onLoadSuccess={handleDocumentLoadSuccess} rotate={angle}>
            {!scrollView && pageNumber > 0 && (
              <Box display='flex' justifyContent='center'>
                <PdfPage
                  pageNumber={pageNumber} renderAnnotationLayer={false} scale={scale}
                  inputRef={canvasRef} onRenderSuccess={handleRenderSuccess}
                />
              </Box>
            )}
            {scrollView && (
              (new Array(pagesToRender).fill(0).map((_, i) => (
                <React.Fragment key={`Page${i}`}>
                  <Heading color="gray.100" mb={1}>Page {i + 1}</Heading>
                  <Box mb={4} display='flex' justifyContent='center'>
                    <PdfPage
                      key={`page-${i}`} pageNumber={i + 1} renderAnnotationLayer={false} scale={scale}
                      onRenderSuccess={i === pagesToRender - 1 ? handleRenderSuccess2 : null}
                    />
                  </Box>
                </React.Fragment>
              )))
            )}
          </CDocument>
        </FlexCol>
      </FlexCol>
    </FlexCol>
  );
}
