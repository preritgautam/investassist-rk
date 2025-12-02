import React from 'react';
import { SketchPicker } from 'react-color';

export interface ColorPickerProps {
  onChangeComplete: Function
}

export function ColorPicker({ onChangeComplete }: ColorPickerProps) {
  const [current, setCurrent] = React.useState('#333');
  return <SketchPicker onChange={setCurrent} onChangeComplete={onChangeComplete} color={current} />;
}
