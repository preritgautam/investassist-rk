import React, { BaseSyntheticEvent, FormEventHandler } from 'react';
import { FieldValues, useForm, UseFormProps, UseFormReturn, FieldPath } from 'react-hook-form';
import FormApiError from '../../api/FormApiError';
import { noopFunc } from '../../utils/noop';

interface _UseApiFormReturn<T> extends Omit<UseFormReturn<T>, 'handleSubmit'> {
  isSubmitting: boolean,
  formErrors: string[],
  setFormErrors: (errors: string[]) => void,
  clearFormErrors: () => void,
  handleSubmit: (onSubmit: Function, onError: Function, onSuccess: Function) => any
}

export type OnSubmit<T> = (data: T, event: BaseSyntheticEvent | undefined) => void;
export type OnError = (error: Error | undefined) => void;

const _useApiForm = function <T extends FieldValues>(obj: UseFormProps<T>): _UseApiFormReturn<T> {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState([]);
  const { handleSubmit: oldHandleSubmit, setError, ...rest } = useForm<T>(obj);

  const clearFormErrors = React.useCallback(() => {
    setFormErrors([]);
  }, []);

  const handleSubmit = React.useCallback(
    (onSubmit: OnSubmit<T>, onError: OnError = noopFunc, onSuccess: () => void = noopFunc) => {
      return oldHandleSubmit(async (data, event) => {
        setIsSubmitting(true);
        try {
          await onSubmit(data, event);
          onSuccess();
        } catch (e) {
          if (e instanceof FormApiError) {
            for (const f of Reflect.ownKeys(e.errors.fields || {})) {
              const error = e.errors.fields[f as string];
              setError(f as FieldPath<T>, {
                type: 'manual',
                message: Array.isArray(error) ? error.join('\n') : error,
              });
            }
            setFormErrors(e.errors.form);
          } else {
            console.error(e);
          }
          onError(e);
        }
        setIsSubmitting(false);
      });
    }, [oldHandleSubmit, setError],
  );

  return { ...rest, handleSubmit, isSubmitting, setError, formErrors, setFormErrors, clearFormErrors };
};

export interface UseApiFormProps<T> extends UseFormProps<T> {
  onSubmit: Function,
  onError?: Function,
  onSuccess?: Function,
}

export interface UseApiFormReturn<T> extends Omit<_UseApiFormReturn<T>, 'handleSubmit'> {
  registerInput: Function,
  registerElement: Function,
  handleSubmit: FormEventHandler<HTMLFormElement>,
}

export function useApiForm<T extends FieldValues>(
  { onSubmit, onError = noopFunc, onSuccess = noopFunc, ...restInputs }: UseApiFormProps<T>,
): UseApiFormReturn<T> {
  const { handleSubmit, register, ...restOutput } = _useApiForm<T>(restInputs);

  const registerInput = React.useCallback((name, opts = {}) => {
    const { ref, ...rest } = register(name, opts);
    return { inputRef: ref, ...rest };
  }, [register]);

  const registerElement = React.useCallback((name, opts = {}) => {
    const { ref, ...rest } = register(name, opts);
    return { elementRef: ref, ...rest };
  }, [register]);

  const handleFormSubmit = React.useMemo(
    () => handleSubmit(onSubmit, onError, onSuccess),
    [handleSubmit, onSubmit, onError, onSuccess],
  );
  return { handleSubmit: handleFormSubmit, registerInput, registerElement, register, ...restOutput };
}
