import { connect } from 'react-redux';
import { Grid } from '@mui/material';
import NotificationBar, {
  notificationShape,
} from 'lib/components/core/NotificationBar';
import VideoPlayer from './VideoPlayer';
import Discussion from './Discussion';

const propTypes = {
  notification: notificationShape,
};

function Submission(props) {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <VideoPlayer />
        </Grid>
        <Grid className="sticky top-0 h-[calc(95vh-70px)]" item xs={12} lg={4}>
          <Discussion />
        </Grid>
      </Grid>
      <NotificationBar notification={props.notification} />
    </>
  );
}

Submission.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    notification: state.notification,
  };
}

export default connect(mapStateToProps)(Submission);
