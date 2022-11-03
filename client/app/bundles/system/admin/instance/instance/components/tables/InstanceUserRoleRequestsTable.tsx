import { FC, ReactElement, memo, useMemo } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { MenuItem, TextField, Typography } from '@mui/material';
import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { ROLE_REQUEST_ROLES } from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/translations/table';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import equal from 'fast-deep-equal';
import {
  RoleRequestMiniEntity,
  RoleRequestRowData,
} from 'types/system/instance/roleRequests';

interface Props extends WrappedComponentProps {
  title: string;
  roleRequests: RoleRequestMiniEntity[];
  pendingRoleRequests?: boolean;
  approvedRoleRequests?: boolean;
  rejectedRoleRequests?: boolean;
  renderRowActionComponent?: (roleRequest: RoleRequestRowData) => ReactElement;
}

const translations = defineMessages({
  noEnrolRequests: {
    id: 'system.admin.instance.enrolRequests.components.tables.EnrolRequestsTable.noEnrolRequests',
    defaultMessage: 'There is no {enrolRequestsType}',
  },
  approved: {
    id: 'system.admin.instance.enrolRequests.components.tables.EnrolRequestsTable.requestType.approved',
    defaultMessage: 'approved',
  },
  rejected: {
    id: 'system.admin.instance.enrolRequests.components.tables.EnrolRequestsTable.requestType.rejected',
    defaultMessage: 'rejected',
  },
  pending: {
    id: 'system.admin.instance.enrolRequests.components.tables.EnrolRequestsTable.requestType.pending',
    defaultMessage: 'pending',
  },
});

const InstanceUserRoleRequestsTable: FC<Props> = (props) => {
  const {
    title,
    roleRequests,
    pendingRoleRequests = false,
    approvedRoleRequests = false,
    rejectedRoleRequests = false,
    renderRowActionComponent = null,
    intl,
  } = props;

  const requestTypePrefix: string = useMemo((): string => {
    if (approvedRoleRequests) {
      return intl.formatMessage(translations.approved);
    }
    if (rejectedRoleRequests) {
      return intl.formatMessage(translations.rejected);
    }
    if (pendingRoleRequests) {
      return intl.formatMessage(translations.pending);
    }
    return '';
  }, [approvedRoleRequests, rejectedRoleRequests, pendingRoleRequests]);

  if (roleRequests && roleRequests.length === 0) {
    return (
      <Note
        message={intl.formatMessage(translations.noEnrolRequests, {
          enrolRequestsType: title.toLowerCase(),
        })}
      />
    );
  }

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 30,
    rowsPerPageOptions: [15, 30, 50, 100],
    search: true,
    selectableRows: 'none',
    setTableProps: (): object => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `role-request_${roleRequests[dataIndex].id}`,
        rolerequestid: `role-request_${roleRequests[dataIndex].id}`,
        className: `role_request ${requestTypePrefix}_role_request_${roleRequests[dataIndex].id}`,
      };
    },
    sortOrder: {
      name: 'createdAt',
      direction: 'desc',
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: intl.formatMessage(tableTranslations.id),
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'name',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`name-${roleRequest.id}`} variant="body2">
              {roleRequest.name}
            </Typography>
          );
        },
      },
    },
    {
      name: 'email',
      label: intl.formatMessage(tableTranslations.email),
      options: {
        alignCenter: false,
      },
    },
    {
      name: 'organization',
      label: intl.formatMessage(tableTranslations.organization),
      options: {
        alignCenter: false,
      },
    },
    {
      name: 'designation',
      label: intl.formatMessage(tableTranslations.designation),
      options: {
        alignCenter: false,
      },
    },
    {
      name: 'reason',
      label: intl.formatMessage(tableTranslations.reason),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const roleRequest = roleRequests[dataIndex];
          return (
            <Typography key={`reason-${roleRequest.id}`} variant="body2">
              {roleRequest.reason}
            </Typography>
          );
        },
      },
    },
  ];

  if (approvedRoleRequests) {
    columns.push(
      ...[
        {
          name: 'role',
          label: intl.formatMessage(tableTranslations.role),
          options: {
            alignCenter: false,
          },
        },
        {
          name: 'createdAt',
          label: intl.formatMessage(tableTranslations.requestedAt),
          options: {
            alignCenter: false,
          },
        },
        {
          name: 'confirmedBy',
          label: intl.formatMessage(tableTranslations.approver),
          options: {
            alignCenter: false,
          },
        },
        {
          name: 'confirmedAt',
          label: intl.formatMessage(tableTranslations.approvedAt),
          options: {
            alignCenter: false,
            customBodyRenderLite: (dataIndex: number): JSX.Element => {
              const roleRequest = roleRequests[dataIndex];
              return (
                <Typography
                  key={`approvedAt-${roleRequest.id}`}
                  variant="body2"
                >
                  {roleRequest.confirmedAt}
                </Typography>
              );
            },
          },
        },
      ],
    );
  } else if (pendingRoleRequests) {
    columns.push(
      ...[
        {
          name: 'role',
          label: intl.formatMessage(tableTranslations.role),
          options: {
            alignCenter: false,
            customBodyRender: (value, tableMeta, updateValue): JSX.Element => {
              const roleRequest = roleRequests[tableMeta.rowIndex];
              return (
                <TextField
                  id={`role-${roleRequest.id}`}
                  select
                  value={value || 'normal'}
                  onChange={(e): React.ChangeEvent =>
                    updateValue(e.target.value)
                  }
                  variant="standard"
                >
                  {Object.keys(ROLE_REQUEST_ROLES).map((option) => (
                    <MenuItem
                      key={`role-${roleRequest.id}-${option}`}
                      value={option}
                    >
                      {ROLE_REQUEST_ROLES[option]}
                    </MenuItem>
                  ))}
                </TextField>
              );
            },
          },
        },
        {
          name: 'createdAt',
          label: intl.formatMessage(tableTranslations.requestedAt),
          options: {
            alignCenter: false,
          },
        },
        ...(renderRowActionComponent
          ? [
              {
                name: 'actions',
                label: intl.formatMessage(tableTranslations.actions),
                options: {
                  empty: true,
                  sort: false,
                  alignCenter: true,
                  customBodyRender: (_value, tableMeta): JSX.Element => {
                    const rowData = tableMeta.rowData as RoleRequestRowData;
                    const enrolRequest = rebuildObjectFromRow(columns, rowData);
                    const actionComponent =
                      renderRowActionComponent(enrolRequest);
                    return actionComponent;
                  },
                },
              },
            ]
          : []),
      ],
    );
  } else if (rejectedRoleRequests) {
    columns.push(
      ...[
        {
          name: 'createdAt',
          label: intl.formatMessage(tableTranslations.requestedAt),
          options: {
            alignCenter: false,
          },
        },
        {
          name: 'confirmedBy',
          label: intl.formatMessage(tableTranslations.rejector),
          options: {
            alignCenter: false,
          },
        },
        {
          name: 'confirmedAt',
          label: intl.formatMessage(tableTranslations.rejectedAt),
          options: {
            alignCenter: false,
          },
        },
        {
          name: 'rejectionMessage',
          label: intl.formatMessage(tableTranslations.rejectionMessage),
          options: {
            alignCenter: false,
          },
        },
      ],
    );
  }

  return (
    <DataTable
      title={title}
      data={roleRequests}
      columns={columns}
      options={options}
      includeRowNumber
      withMargin
    />
  );
};

export default memo(
  injectIntl(InstanceUserRoleRequestsTable),
  (prevProps, nextProps) => {
    return equal(prevProps.roleRequests, nextProps.roleRequests);
  },
);
