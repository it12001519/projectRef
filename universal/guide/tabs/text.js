import React, { Component, } from 'react';
import {
  Alert, Button, Card, CardTitle, CardText
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';

class TextTab extends Component {
  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Text (a.k.a. Microcopy)</h5>

        <div className="clearfix" style={{ height: '1em' }} />
        <Card body>
          <CardTitle>Buttons</CardTitle>
          <CardText>
            <p>
              Buttons are all over Changelink and hard to miss. Below guide will help us craft button micropy that has a consistent voice.
            </p>
            <Button color="primary" className="mr-1"><FontAwesome name="plus" />{' '}Add Record</Button>
            <Button color="secondary" className="mr-1">View Attachment</Button>
            <Button color="primary" className="mr-1"><FontAwesome name="save" />{' '}Save Changes</Button>
            <Button color="danger" className="mr-1"><FontAwesome name="trash" />{' '}Delete Change</Button>

            <div className="clearfix" style={{ height: '1em' }} />
            <p>
              Verbs should also be consistent across the system. Here are some of the suggested verbs to be used:<br />
              <i>View, Show, Hide, Add, Edit, Delete, Save, Dismiss, Reset, Close, Restore, Download, Upload</i>
            </p>

            <Alert color="info">
              <FontAwesome name="wrench" />{' '}<b>Rule:</b>{' '}
              Construct action buttons using the verb + noun pattern. It is concise and easy to understand. Examples:<br />
              View Report, Edit Announcement, Delete Record
            </Alert>
            <Alert color="info">
              <FontAwesome name="wrench" />{' '}<b>Pro Tip!</b>{' '}
              If the page only applies to a single noun or if the noun the verb is pertaining to is obvious, the noun may be omitted. Examples:<br />
              (inside attachment page) Preview, Edit, Download, Delete; (in a form) Reset, Close
            </Alert>
          </CardText>
        </Card>

        <div className="clearfix" style={{ height: '1em' }} />
        <Card body>
          <CardTitle>Form Validation</CardTitle>
          <CardText>
            <p>
              Validation messages will be displayed on an invalid form field. Examples for common validation messages:<br />
              <ul>
                <li>Required field</li>
                <li>Max 30 characters</li>
                <li>Invalid email address</li>
                <li>Invalid Material</li>
                <li>Invalid date format (must be YYYY-MM-DD)</li>
                <li>Must be a number from 0 to 100</li>
              </ul>
            </p>
          </CardText>
        </Card>

        <div className="clearfix" style={{ height: '1em' }} />
        <Card body>
          <CardTitle>System Messages</CardTitle>
          <CardText>
            <p>
              Convey the message simply and concisely. Examples for common messages:<br />
              <ul>
                <li>Email sent.</li>
                <li>Record updated.</li>
                <li>Record deleted.</li>
                <li>Record moved to Trash Bin.</li>
                <li>No records.</li>
                <li>Access denied.</li>
                <li>System encountered an error. Application support are notified of this issue.</li>
              </ul>
            </p>
          </CardText>
        </Card>

        <div className="clearfix" style={{ height: '1em' }} />

      </div>
    );
  }
}

export default TextTab;