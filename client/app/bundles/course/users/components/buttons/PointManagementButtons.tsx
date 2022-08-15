import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import SaveButton from 'lib/components/buttons/SaveButton';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import {
  ExperiencePointsRecordPermissions,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';
import {
  deleteExperiencePointsRecord,
  updateExperiencePointsRecord,
} from '../../operations';

interface Props extends WrappedComponentProps {
  permissions: ExperiencePointsRecordPermissions;
  data: ExperiencePointsRowData;
  isDirty: boolean;
  isManuallyAwarded: boolean;
  handleSave: (newData: ExperiencePointsRowData) => void;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.users.components.buttons.PointManagementButtons.delete.success',
    defaultMessage: 'Experience points record was deleted.',
  },
  deletionFailure: {
    id: 'course.users.components.buttons.PointManagementButtons.delete.fail',
    defaultMessage: 'Failed to delete record - {error}',
  },
  deletionConfirm: {
    id: 'course.users.components.buttons.PointManagementButtons.delete.confirm',
    defaultMessage:
      'Are you sure you wish to delete this record with {pointsAwarded} point(s) awarded?',
  },
  updateSuccess: {
    id: 'course.users.components.buttons.PointManagementButtons.update.success',
    defaultMessage: 'Experience points record was updated.',
  },
  updateFailure: {
    id: 'course.users.components.buttons.PointManagementButtons.update.fail',
    defaultMessage: 'Failed to update record - {error}',
  },
});

const PointManagementButtons: FC<Props> = (props) => {
  const { intl, permissions, data, isDirty, isManuallyAwarded, handleSave } =
    props;
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onSave = (): void => {
    setIsSaving(true);
    dispatch(updateExperiencePointsRecord(data))
      .then((response) => {
        const experiencePointsRowData = {
          id: response.data.id,
          reason: response.data.reason.text,
          pointsAwarded: response.data.pointsAwarded,
        };
        handleSave(experiencePointsRowData);
        toast.success(intl.formatMessage(translations.updateSuccess));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsSaving(false));
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteExperiencePointsRecord(data.id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }} key={`buttons-${data.id}`}>
      {permissions.canUpdate && (
        <SaveButton
          tooltip="Save Changes"
          className={`record-save-${data.id}`}
          disabled={isSaving || isDeleting || !isDirty}
          onClick={onSave}
        />
      )}
      {permissions.canDestroy && isManuallyAwarded && (
        <DeleteButton
          tooltip="Delete Experience Point"
          className={`record-delete-${data.id}`}
          disabled={isSaving || isDeleting}
          loading={isDeleting}
          onClick={onDelete}
          confirmMessage={intl.formatMessage(translations.deletionConfirm, {
            pointsAwarded: data.pointsAwarded.toString(),
          })}
        />
      )}
    </div>
  );

  return managementButtons;
};

export default injectIntl(PointManagementButtons);
