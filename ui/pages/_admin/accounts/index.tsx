// noinspection t

import React, { useCallback, useState } from 'react';
import { PageComponent } from '../../../src/bootstrap/types';
import { FlexCol } from '../../../src/bootstrap/chakra/components/layouts/FlexCol';
import { getAdminLayout } from '../../../src/app/components/app/layouts/SuperAdminLayout';
import {
  AccountsService,
  UpdateAccountParams,
  useAccountsService,
} from '../../../src/app/services/_admin/AccountsService';
import { Account, AccountStatusType } from '../../../src/types';
import {
  chakra, Text,
  HStack, Select, SelectProps, Spinner, useToast, Flex, IconButton, Tooltip,
} from '@chakra-ui/react';
import { NumericInput, NumericInputProps } from '../../../src/app/components/core/NumericInput';
import { LinkButton, LinkIconButton } from '../../../src/bootstrap/chakra/components/core/LinkButton';
import { useSAAccountUserService } from '../../../src/app/services/_admin/AccountUserService';
import { noopArray } from '../../../src/bootstrap/utils/noop';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef, EditableCallbackParams,
  ICellEditorParams,
  ICellRendererParams,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { DateTime } from 'luxon';
import { DealsIcon, DeleteIcon, TemplateIcon, TickIcon, UserIcon } from '../../../src/app/components/app/icons';
import { PlanMap } from '../../../src/app/constant/PlanMap';
import { PageContent } from '../../../src/bootstrap/chakra/components/layouts/PageContent';
import { HeadingL } from '../../../src/bootstrap/chakra/components/typography';
import ClikGatewayAddAccountButton from '../../../src/app/components/app/_admin/ClikGatewayAddAccountButton';
import { ConfirmPopup } from '../../../src/bootstrap/chakra/components/popups/ConfirmPopup';


interface EditAccountPlanProps extends SelectProps {
  accountId: string;
  planId: string;
  status: AccountStatusType;
  onPlanUpdate: () => void;
}

function EditAccountPlan({ accountId, status, planId, onPlanUpdate, isDisabled, ...rest }: EditAccountPlanProps) {
  const accountsService = useAccountsService();
  const updateMutation = accountsService.useUpdateAccount();

  const handleChange = useCallback(async (e) => {
    const value = e.target.value;
    const update: UpdateAccountParams = {
      id: accountId,
      status: 'Free',
      planId: null,
    };
    if (value) {
      const [status, planId] = value.split('-');
      update.planId = planId;
      update.status = status;
    }
    await updateMutation.mutateAsync(update);
    onPlanUpdate();
  }, [accountId, onPlanUpdate, updateMutation]);

  const value = status === 'Free' ? 'Free' : `${status}-${planId}`;
  const _isDisabled = updateMutation.isLoading || isDisabled;
  return (
    <Select value={value} onChange={handleChange} size="xs" isDisabled={_isDisabled} {...rest}>
      <option value="">Free</option>
      <option value="Trial-plan1">Trial - Plan1 - Syndicators</option>
      <option value="Paid-plan1">Paid - Plan1 - Syndicators</option>
      <option value="Trial-plan2">Trial - Plan2 - Enterprise</option>
      <option value="Paid-plan2">Paid - Plan2 - Enterprise</option>
    </Select>
  );
}

interface EditAccountEnabledProps extends SelectProps {
  accountId: string;
  enabled: boolean;
  onEnabledUpdate: () => void;
}

function EditAccountEnabled({ accountId, enabled, onEnabledUpdate, ...rest }: EditAccountEnabledProps) {
  const accountsService = useAccountsService();
  const updateMutation = accountsService.useUpdateAccount();
  const value = enabled ? 'yes' : 'no';

  const handleChange = useCallback(async (e) => {
    const update: UpdateAccountParams = { id: accountId, enabled: e.target.value === 'yes' };
    await updateMutation.mutateAsync(update);
    onEnabledUpdate();
  }, [accountId, onEnabledUpdate, updateMutation]);

  return (
    <Select value={value} onChange={handleChange} isDisabled={updateMutation.isLoading} size="xs" {...rest}>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </Select>
  );
}


interface EditAccountUserLimitProps extends NumericInputProps {
  accountId: string;
  userLimit: number;
  onUserLimitUpdate: () => Promise<any>;
  isDisabled: boolean;
}

function EditAccountUserLimit(
  { accountId, userLimit, onUserLimitUpdate, isDisabled, ...rest }: EditAccountUserLimitProps,
) {
  const accountsService = useAccountsService();
  const updateMutation = accountsService.useUpdateAccount();
  const value = userLimit as number;
  const [currentValue, setCurrentValue] = useState(value);

  const usersQuery = useSAAccountUserService().useAccountUsers(
    accountId,
    { enabled: value !== currentValue },
  );
  const users = usersQuery.data ?? noopArray;
  const toast = useToast();

  const handleUpdate = useCallback(async () => {
    const newUserLimit = currentValue;
    if (newUserLimit < users?.length) {
      toast({
        title: 'User Limit Error',
        description: 'Existing user count for this account is exceeding new user limit. ' +
          'Please delete  account user(s) before making this change.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } else {
      const update: UpdateAccountParams = { id: accountId, userLimit: newUserLimit };
      await updateMutation.mutateAsync(update);
    }
    await onUserLimitUpdate();
  }, [currentValue, users?.length, onUserLimitUpdate, toast, accountId, updateMutation]);

  const handleChange = useCallback(async (e) => {
    setCurrentValue(Number(e));
  }, []);

  return (
    <Flex alignItems="flex-center">
      <NumericInput
        value={currentValue} defaultValue={value} isDisabled={updateMutation.isLoading || isDisabled}
        min={users?.length || 0} onChange={handleChange} size="xs" {...rest}
      />
      <IconButton
        aria-label="ok" size="xs" icon={<TickIcon/>} isDisabled={currentValue === value}
        onClick={handleUpdate}
      />
    </Flex>
  );
}

function DeleteAccountButton({ accountId }: { accountId: string }) {
  const accountService = useAccountsService();
  const deleteMutation = accountService.useDeleteAccountMutation();
  const handleDelete = async () => {
    await deleteMutation.mutateAsync(accountId);
  };

  return (
    <ConfirmPopup
      title="Delete Account?"
      message="Are you sure you want to delete the account?"
      onConfirm={handleDelete}
      colorScheme="danger"
    >
      <IconButton
        aria-label="delete account" icon={<DeleteIcon/>} size="sm" variant="ghost"
        colorScheme="danger"
      />
    </ConfirmPopup>
  );
}


interface AccountsTableProps {
  accounts?: Account[];
  isFetching: boolean;
  refetch: () => Promise<any>;
}

function AccountsTable({ accounts, isFetching, refetch }: AccountsTableProps) {
  const [colDefs] = useState<ColDef[]>([
    {
      field: 'name', filter: true, sortable: true, floatingFilter: true, pinned: true,
      valueGetter: (params: ValueGetterParams) => {
        const { name } = params.data;
        if (!name) {
          return '[Some Other CG Account]';
        }
        return name;
      },
      cellRenderer: (props: ICellRendererParams) => {
        const { data, value } = props;

        if (value.startsWith('[')) {
          return (
            <Text>{value}</Text>
          );
        }

        return (
          <LinkButton
            href={`/_admin/accountUsers?accountId=${data.id}&accountName=${data.name}`}
            size="xs"
          >
            {value}
          </LinkButton>
        );
      },
    },
    {
      field: 'createdAt', filter: true, sortable: true, headerName: 'Created On', sort: 'desc',
      initialWidth: 135,
      valueFormatter: (params: ValueFormatterParams) => {
        const createdAt = params.value;
        return DateTime.fromISO(createdAt).toLocaleString(DateTime.DATETIME_SHORT);
      },
    },
    {
      field: 'userLimit', filter: true, sortable: true, initialWidth: 110,
      editable: (params: EditableCallbackParams) => !!params.data.name,
      singleClickEdit: true,
      cellEditor: (props: ICellEditorParams) => {
        const { data: account } = props;
        return (
          <EditAccountUserLimit
            accountId={account.id} userLimit={account.userLimit}
            onUserLimitUpdate={refetch} isDisabled={account.name === ''}
          />
        );
      },
    },
    {
      field: 'planId', filter: true, sortable: true, headerName: 'Plan', initialWidth: 170,
      editable: (params: EditableCallbackParams) => !!params.data.name,
      singleClickEdit: true,
      valueFormatter: (params: ValueFormatterParams) => {
        const { status, planId } = params.data;
        return planId ? `${status} - ${PlanMap[planId]}` : status;
      },
      cellEditor: (props: ICellEditorParams) => {
        const { data: account } = props;
        return (
          <EditAccountPlan
            status={account.status}
            isDisabled={!account.name || !!account.currentSubscriptionStartedOn}
            planId={account.planId} accountId={account.id} onPlanUpdate={refetch}
          />
        );
      },
    },
    {
      field: 'enabled', filter: true, sortable: true, initialWidth: 90,
      editable: (params: EditableCallbackParams) => !!params.data.name,
      singleClickEdit: true,
      cellRenderer: (props: ICellRendererParams) => <Text>{props.value ? 'Yes' : 'No'}</Text>,
      cellEditor: (props: ICellEditorParams) => {
        const { data: account } = props;
        return (
          <EditAccountEnabled
            isDisabled={!account.name}
            accountId={account.id} enabled={account.enabled} onEnabledUpdate={refetch}
          />
        );
      },
    },
    {
      field: 'isCGEnabled', filter: true, sortable: true, headerName: 'CG Enabled', initialWidth: 110,
      valueGetter: (params: ValueGetterParams) => {
        const { isCGEnabled } = params.data;
        return isCGEnabled ? 'Yes' : 'No';
      },
    },
    {
      field: null, filter: false, sortable: false, headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams) => {
        const { data: account } = params;
        return (
          <Flex h="full">
            <Tooltip label="Manage Users" shouldWrapChildren={true}>
              <LinkIconButton
                aria-label="manage users" icon={<UserIcon/>} size="sm" variant="ghost"
                href={`/_admin/accountUsers?accountId=${account.id}&accountName=${account.name}`}
              />
            </Tooltip>
            <Tooltip label="Manage Deals" shouldWrapChildren={true}>
              <LinkIconButton
                aria-label="manage deals" icon={<DealsIcon/>} size="sm" variant="ghost"
                href={`/_admin/accountDeals?accountId=${account.id}&accountName=${account.name}`}
              />
            </Tooltip>
            <Tooltip label="Manage Templates" shouldWrapChildren={true}>
              <LinkIconButton
                aria-label="manage templates" icon={<TemplateIcon/>} size="sm" variant="ghost"
                href={`/_admin/accountTemplates?accountId=${account.id}&accountName=${account.name}`}
              />
            </Tooltip>
            <Tooltip label="Delete Account" shouldWrapChildren={true}>
              <DeleteAccountButton accountId={account.id}/>
            </Tooltip>
          </Flex>
        );
      },
    },
    { field: 'slug', filter: true, sortable: true },
    { field: 'clikGatewayId', filter: true, sortable: true, resizable: true },
    { field: 'isRegisteredWithStripe', filter: true, sortable: true, headerName: 'Stripe' },
    { field: 'isPaymentConfirmed', filter: true, sortable: true, headerName: 'Payment Confirmed' },
    {
      field: 'trialStartedOn', filter: true, sortable: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return DateTime.fromISO(params.value).toLocaleString(DateTime.DATETIME_SHORT);
        }
      },
    },
    {
      field: 'markedForCancellationOn', filter: true, sortable: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return DateTime.fromISO(params.value).toLocaleString(DateTime.DATETIME_SHORT);
        }
      },
    },
    { field: 'lastInvoiceFailed', filter: true, sortable: true },
    { field: 'lastInvoiceUrl', filter: true, sortable: true },
    {
      field: 'currentSubscriptionStartedOn', filter: true, sortable: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return DateTime.fromISO(params.value).toLocaleString(DateTime.DATETIME_SHORT);
        }
      },
    },
  ]);

  if (!accounts && isFetching) {
    return null;
  }

  return (
    <chakra.div className="ag-theme-balham" w="full" h="full">
      <AgGridReact
        rowData={accounts} columnDefs={colDefs} enableCellTextSelection
      />
    </chakra.div>
  );
}


const AdminAccountsPage: PageComponent = () => {
  const accountsService: AccountsService = useAccountsService();
  const accountsQuery = accountsService.useAccounts();

  return (
    <PageContent
      pageTitle={(
        <HStack>
          <HeadingL>Accounts</HeadingL>
          {accountsQuery.isFetching && <Spinner/>}
        </HStack>
      )}
      mainActionButton={(
        <ClikGatewayAddAccountButton variant="solid">Add Account</ClikGatewayAddAccountButton>
      )}
    >
      <FlexCol flexGrow={1}>
        <AccountsTable
          isFetching={accountsQuery.isFetching} accounts={accountsQuery.data}
          refetch={accountsQuery.refetch}
        />
      </FlexCol>
    </PageContent>
  );
};

AdminAccountsPage.getLayout = getAdminLayout;

export default AdminAccountsPage;
