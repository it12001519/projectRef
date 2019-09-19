import React, { Component } from 'react';
import withLayout from 'js/app/models/withLayout';
import { PageHeader } from 'js/app/models/ChangelinkUI';
import { withRouter, } from 'react-router-dom';
import 'whatwg-fetch';
import styled from 'styled-components';

import { Row, Col, Card, CardBody, CardHeader, Alert } from 'reactstrap';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import SummaryCard from 'js/app/models/SummaryCard';
import FetchUtilities from 'js/universal/FetchUtilities';
import Spinner from 'js/universal/spinner';

import "css/nav-tabs.css";
import TaskDetail from './tabs/TaskDetail';

const TASK_LIST_URL = '/tasks';
const DEFAULT_TAB = 'details';

const TASK_SUMMARY_URL = '/api/v1/task/summary/';
const TASK_ID_URL = '/api/v1/task/getId/';

let taskPage = withRouter(class extends Component {

  constructor(props) {
    super(props);
    let taskNumber = !!this.props.match.params.taskNumber ? this.props.match.params.taskNumber : 'Not Found';

    this.state = {
      taskNumber: taskNumber,
      detailData: {},
      summaryData: undefined,
      showSpinner: true,
      configPcnTrackerUrl: '',
      taskId: null,
      crumbs: [
        { text: 'Reports' },
        { text: 'Tasks', to: TASK_LIST_URL },
        { text: taskNumber, active: true }
      ]
    }

  }

  // Handler for tab toggle
  handleTabToggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  } 
  

  componentWillMount() {
    let fetchURL = TASK_SUMMARY_URL + this.state.taskNumber; // API

    // Fetch the summary data
    fetch(fetchURL, { credentials: 'include', headers: new Headers({
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }) 
      })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => { this.setState({ summaryData: json }) })
      .catch((ex) => { this.setState({ summaryData: null }); throw ex });
  }

  componentDidMount() {
    this.setState({ showSpinner: false });
  }

  render() {

    if (this.state.summaryData === undefined) {
      return (
        <div className={this.props.className}>
          <Spinner showSpinner />
        </div>
      )
    } else if (this.state.summaryData === null) {
      return (
        <div className={this.props.className}>
          <Alert color="danger">
            <h4>{`TASK Number ${this.state.taskNumber} not found`}</h4>
          </Alert>
        </div>
      )
    } else {

      let tab = !!this.props.match.params.tab ? this.props.match.params.tab : DEFAULT_TAB;
      return (
        <div className={this.props.className}>

          <Row style={{ margin: 0 }} >
            <Col mr="0" xs="0"><ChangeLinkBreadcrumb crumbs={this.state.crumbs} /> </Col>            
          </Row>

          {/* Use generic summary card with phase data */}
          <SummaryCard data={this.state.summaryData}
            canSubscribe={false}
            canDelete={false}
            canPin={false} />

          {/* Spacer */}
          <div className="clearfix" style={{ height: '1rem' }} />
          <PageHeader> Task {this.state.taskNumber} </PageHeader>
          <div className="clearfix" style={{ height: '1rem' }} />
          <Card>
            <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
              Task Details
                </CardHeader>
            <CardBody>
              <TaskDetail taskNumber={this.state.taskNumber} />
            </CardBody>
          </Card>




        </div>
      )
    }
  }
}
  /*}
  */
);

export default withLayout(styled(taskPage)`
.more-nav-link
{
  padding: .5rem .75rem;
  font-size: 14px;
  cursor: pointer;
  color: #007bff;
}
`);
