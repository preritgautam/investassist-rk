import React from 'react';
import { FormControl, FormLabel, HStack, Input, StackProps } from '@chakra-ui/react';

interface PdfPageSelectorProps extends StackProps {
  numPages: number,
  defaultStartPage?: number
  defaultEndPage?: number
}

interface PdfPageSelectorState {
  start: number,
  end: number,
}

export class PdfPageSelector extends React.Component<PdfPageSelectorProps, PdfPageSelectorState> {
  constructor(props: PdfPageSelectorProps) {
    super(props);
    this.state = {
      start: props.defaultStartPage || 1,
      end: props.defaultEndPage || props.numPages,
    };
  }

  get value() {
    return { start: this.state.start, end: this.state.end };
  }

  render() {
    return (
      <HStack {...this.props}>
        <FormControl>
          <FormLabel>Start Page</FormLabel>
          <Input value={this.state.start} onChange={(e) => {
            this.setState({ start: +e.target.value });
          }}/>
        </FormControl>

        <FormControl>
          <FormLabel>End Page</FormLabel>
          <Input value={this.state.end} onChange={(e) => {
            this.setState({ end: +e.target.value });
          }}/>
        </FormControl>
      </HStack>
    );
  }
}

interface PdfPagesSelectorProps extends StackProps {
  numPages: number,
  startPage: number,
  endPage: number,
  onStartChange: (s: number) => void,
  onEndChange: (e: number) => void,
}

export function PdfPagesSelector({ numPages, startPage, endPage, onStartChange, onEndChange }: PdfPagesSelectorProps) {
  return (
    <HStack {...this.props}>
      <FormControl>
        <FormLabel>Start Page</FormLabel>
        <Input value={startPage} onChange={(e) => {
          onStartChange(+e.target.value);
        }}/>
      </FormControl>

      <FormControl>
        <FormLabel>End Page</FormLabel>
        <Input value={endPage} onChange={(e) => {
          onEndChange(+e.target.value);
        }}/>
      </FormControl>
    </HStack>
  );
}

