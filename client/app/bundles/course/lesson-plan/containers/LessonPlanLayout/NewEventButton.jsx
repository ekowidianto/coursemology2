import { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { createEvent } from '../../operations';
import { actions } from '../../store';

const translations = defineMessages({
  newEvent: {
    id: 'course.lessonPlan.LessonPlanLayout.NewEventButton.newEvent',
    defaultMessage: 'Event',
  },
  success: {
    id: 'course.lessonPlan.LessonPlanLayout.NewEventButton.success',
    defaultMessage: 'Event created.',
  },
  failure: {
    id: 'course.lessonPlan.LessonPlanLayout.NewEventButton.failure',
    defaultMessage: 'Failed to create event.',
  },
});

class NewEventButton extends Component {
  createEventHandler = (data) => {
    const { dispatch } = this.props;
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(createEvent(data, successMessage, failureMessage));
  };

  showForm = () => {
    const { dispatch, intl } = this.props;
    return dispatch(
      actions.showEventForm({
        onSubmit: this.createEventHandler,
        formTitle: intl.formatMessage(translations.newEvent),
        initialValues: {
          title: '',
          event_type: '',
          location: '',
          description: '',
          start_at: null,
          end_at: null,
          published: false,
        },
      }),
    );
  };

  render() {
    if (!this.props.canManageLessonPlan) return null;

    return (
      <Button onClick={this.showForm} startIcon={<Add />} variant="contained">
        <FormattedMessage {...translations.newEvent} />
      </Button>
    );
  }
}

NewEventButton.propTypes = {
  canManageLessonPlan: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect(({ lessonPlan }) => ({
  canManageLessonPlan: lessonPlan.flags.canManageLessonPlan,
}))(injectIntl(NewEventButton));
