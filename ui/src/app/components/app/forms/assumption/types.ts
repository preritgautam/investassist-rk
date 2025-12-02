import { Assumption, ReactHookFormRules } from '../../../../../types';
import { Control, FieldError, FieldErrors, IsAny, UseFormRegister, UseFormWatch, FieldPath } from 'react-hook-form';

export interface ControlFieldProps<X extends keyof Assumption = any> {
  control: Control<Assumption>;
  name: FieldPath<Assumption>;
  rules?: ReactHookFormRules;
  error: IsAny<X> extends true ? FieldError : FieldErrors<Assumption>[X];
}
export type OmitControlProps<T> = Pick<T, Exclude<keyof T, 'control' | 'name' | 'rules'>>;

export interface RegisterFieldProps {
  register: UseFormRegister<Assumption>;
  name: FieldPath<Assumption>;
  rules?: ReactHookFormRules;
  error: FieldError;
}

export interface GroupFieldProps<X extends keyof Assumption> {
  watch?: UseFormWatch<Assumption>;
  control: Control<Assumption>;
  register: UseFormRegister<Assumption>;
  error: FieldErrors<Assumption>[X];
}

export type OmitRegisterProps<T> = Pick<T, Exclude<keyof T, 'value' | 'onChange' | 'onBlur'>>
