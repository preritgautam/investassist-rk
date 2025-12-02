import React, { useState } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { getAdminLayout } from '../../../src/app/components/app/layouts/SuperAdminLayout';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { useQueryParam } from '../../../src/bootstrap/hooks/utils/useQueryParam';
import {
  Button, chakra, FormControl, FormLabel, Input, Textarea, InputRightAddon,
} from '@chakra-ui/react';
import { RequiredLabel } from '../../../src/bootstrap/chakra/components/core/form/RequiredLabel';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { useApiForm } from '../../../src/bootstrap/hooks/utils/useApiForm';
import { useAccountsService } from '../../../src/app/services/_admin/AccountsService';
import { AccountTemplate } from '../../../src/types';
import { InputGroup } from '@chakra-ui/input';
import { saveAs } from 'file-saver';
import { getAccountTemplateFileApi } from '../../../src/app/api/_admin';
import { noopFunc } from '../../../src/bootstrap/utils/noop';
import { ConfirmPopup } from '../../../src/bootstrap/chakra/components/popups/ConfirmPopup';

export interface AccountTemplateFormValues {
  name: string;
  chartOfAccount: string;
  modelFile: FileList;
}

interface AccountTemplateFormProps {
  accountId: string;
  defaultValues?: AccountTemplate;
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

function AccountTemplateForm(
  {
    accountId,
    isReadOnly = false,
    defaultValues,
    onSuccess = noopFunc,
  }: AccountTemplateFormProps,
) {
  const accountService = useAccountsService();
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const deleteTemplateMutation = accountService.useDeleteAccountTemplate();

  const { handleSubmit, register } = useApiForm<AccountTemplateFormValues>({
    async onSubmit(values: AccountTemplateFormValues) {
      setSaving(true);
      await accountService.addAccountTemplate(accountId, values);
      onSuccess();
      setSaving(false);
    },
    defaultValues: {
      name: defaultValues?.name,
      chartOfAccount: defaultValues ?
        JSON.stringify(defaultValues.chartOfAccount, null, 2) : '',
    },
  });

  const downloadModelFile = async () => {
    setDownloading(true);
    const response = await getAccountTemplateFileApi({ urlParams: accountId });
    setDownloading(false);
    return saveAs(response.data, defaultValues.originalFileName);
  };

  const deleteTemplate = async () => {
    await deleteTemplateMutation.mutateAsync(accountId);
  };

  return (
    <chakra.form onSubmit={handleSubmit}>
      <FlexCol gap={3}>
        <FormControl>
          <FormLabel><>Name<RequiredLabel/></></FormLabel>
          <Input isReadOnly={isReadOnly} {...register('name')}/>
        </FormControl>
        <FormControl>
          <FormLabel><>COA<RequiredLabel/></></FormLabel>
          <Textarea noOfLines={10} isReadOnly={isReadOnly} {...register('chartOfAccount')}/>
        </FormControl>
        <FormControl>
          <FormLabel><>Model File<RequiredLabel/></></FormLabel>
          {defaultValues && (
            <InputGroup>
              <Input isReadOnly={isReadOnly} value={defaultValues.originalFileName}/>
              <InputRightAddon>
                <Button variant="unstyled" onClick={downloadModelFile} isLoading={downloading}>
                  Download
                </Button>
              </InputRightAddon>
            </InputGroup>
          )}
          {!defaultValues && (
            <Input type="file" multiple={false} {...register('modelFile')}/>
          )}
        </FormControl>
        {defaultValues && (
          <ConfirmPopup
            title="Delete Template?"
            message="Delete Account Template?"
            onConfirm={deleteTemplate}
            colorScheme="danger"
          >
            <Button
              type="button" alignSelf="flex-start" colorScheme="red"
              isLoading={deleteTemplateMutation.isLoading}
            >Delete</Button>
          </ConfirmPopup>
        )}
        {!defaultValues && (
          <Button type="submit" alignSelf="flex-start" isLoading={saving}>Save</Button>
        )}
      </FlexCol>
    </chakra.form>
  );
}

interface AccountTemplateDetailsProps {
  accountId: string;
  template: AccountTemplate;
}

function AccountTemplateDetails({ accountId, template }: AccountTemplateDetailsProps) {
  return (
    <AccountTemplateForm accountId={accountId} defaultValues={template} isReadOnly={true}/>
  );
}

const AccountTemplatePage: PageComponent = () => {
  const accountId = useQueryParam('accountId');
  const accountName = useQueryParam('accountName');
  const accountsService = useAccountsService();
  const templateQuery = accountsService.useAccountTemplateQuery(accountId);

  return (
    <PageContent pageTitle={`Account Templates - ${accountName}`}>
      {templateQuery.data && (
        <AccountTemplateDetails accountId={accountId} template={templateQuery.data}/>
      )}
      {!templateQuery.data && !templateQuery.isLoading && (
        <AccountTemplateForm accountId={accountId} onSuccess={() => templateQuery.refetch()}/>
      )}
    </PageContent>
  );
};

AccountTemplatePage.getLayout = getAdminLayout;
export default AccountTemplatePage;

