import React, { Component, } from 'react';
import {
  Card, CardBody, CardFooter, ListGroup, ListGroupItem,
  Nav, NavItem, NavLink,
} from 'reactstrap';
import classnames from 'classnames';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import { fetchGet, } from 'js/universal/FetchUtilities';
import Spinner from 'js/universal/spinner/';

import withLink from 'js/app/models/withLink';

let RouterNavLink = withLink(NavLink);

function DashboardCard(props) {
  return (
    <Card className="mb-4">
      <CardBody>
        <div>
          <i className={`fa fa-5x pull-left ${props.icon}`}></i>
          <div className="pull-right">
            <div className="pull-right" style={{fontSize:"40px"}}>{props.textNumber}</div>
            <div className="clearfix"/>
            <div className="pull-right">{props.textValue}</div>
          </div>
        </div>
      </CardBody>
      <CardFooter>
      <RouterNavLink href={props.linkPath}>
        <div>
            <span className="pull-left">{props.linkValue}</span>
            <span className="pull-left"><i className="ml-1 fa fa-arrow-circle-right"></i></span>
        </div>
      </RouterNavLink>
      </CardFooter>
    </Card>
  );
}

let DashboardItems = styled(class extends Component {

  constructor() {
    super();
    this.state = {
      tab: null,
    };
  }

  render() {

    let tab = !!this.state.tab ? this.state.tab : 'recent';

    return (
      <div className={`items ${this.props.className} clearfix`}>
        <Card className="mb-4">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: tab === 'recent' })}
                onClick={() => this.setState({tab: 'recent'})}
              >
                <FontAwesome name="clock-o" />
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: tab === 'starred' })}
                onClick={() => this.setState({tab: 'starred'})}
              >
                <FontAwesome name="bookmark" />
              </NavLink>
            </NavItem>
          </Nav>
          <ListGroup>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
            <ListGroupItem>
              Change
            </ListGroupItem>
          </ListGroup>
        </Card>
      </div>
    );

  }

})`

.nav.nav-tabs
{
  padding-top: .5rem;
  padding-right: .5rem;
  padding-left: .5rem;

  // .nav-item .nav-link
  // {
  //   padding: .25rem .5rem;
  // }
}

.list-group
{
  overflow: auto;
  max-height: 60vh;

  li.list-group-item
  {
    border-left: 0;
    border-right: 0;
    padding: .25rem;
    :first-child
    {
      border-top: 0;
    }
    :last-child
    {
      border-bottom: 0;
    }
  }
}

`;

class DashboardTab extends React.PureComponent {

  static defaultProps = {
  };

  constructor(props) {
    super(props);
    this.state = {
      data_count: null,
      showSpinner: true
    };
  }


  componentDidMount(){
    fetchGet(`/api/v1/dashboard_count`,
    (httpStatus, response) => { 
      this.setState({ 
        data_count: response, 
        showSpinner: !this.state.showSpinner 
      })
    }, _=> this.setState({ showSpinner: !this.state.showSpinner }))
  }
  
  render() {
    let changeCount = 0;
    let approvalCount = 0;
    let sampleCount = 0;
    let feedbackCount = 0;
    let taskCount = 0;
    if(this.state.data_count !== null){
      changeCount = this.state.data_count.content.changes;
      approvalCount = this.state.data_count.content.approvals;
      sampleCount = this.state.data_count.content.samples;
      feedbackCount = this.state.data_count.content.feedback;
      taskCount = this.state.data_count.content.actions;
    }
    return (
      <div className={`${this.props.className}`}>
        <Spinner showSpinner={this.state.showSpinner} />
        {/* Commenting out DashboardItems for now until we have decided to put back that feature */}
        {/*
        <div className="left">
          <DashboardItems />
        </div>
        */}
        <div className="right" style={{ width: '100%' }}>
          <div>
            <DashboardCard 
              icon="fa-edit" 
              textNumber={changeCount}
              textValue="Changes"
              linkPath="/my/changes"
              linkValue="View My Changes" />
          </div>
          {/* <div>
            <DashboardCard 
              icon="fa-tasks" 
              textNumber={taskCount}
              textValue="Tasks"
              linkPath="/my/tasks"
              linkValue="View My Tasks" />
          </div> */}
          <div>
            <DashboardCard 
              icon="fa-check-square" 
              textNumber={approvalCount}
              textValue="Approvals"
              linkPath="/my/approvals"
              linkValue="View My Approvals" />
          </div>
          <div>
            <DashboardCard 
              icon="fa-microchip" 
              textNumber={sampleCount}
              textValue="Samples"
              linkPath="/my/samples"
              linkValue="View My Samples" />
          </div>
          <div>
            <DashboardCard 
              icon="fa-comment" 
              textNumber={feedbackCount}
              textValue="PCN Feedback"
              linkPath="/my/feedback"
              linkValue="View My PCN Feedback" />
          </div>
          {/*<div>
            <DashboardCard 
              icon="fa-file" 
              textNumber="48"
              textValue="Reports"
              linkPath="/my/reports"
              linkValue="View Reports" />
          </div>
          <div>
            <DashboardCard
              icon="fa-envelope"
              textNumber="8"
              textValue="Email Subscriptions"
              linkPath="/my/subscriptions"
              linkValue="View Email Subscriptions" />
          </div>*/}
        </div>
      </div>
    );
  }

}

export default styled(DashboardTab)`

// margin-right: -15px;
// margin-left: -15px;

display: flex;
flex-wrap: wrap;

.left, .right
{
  padding-left: 15px;
  
  > div
  {
    padding-right: 15px;
    padding-bottom: 15px;

    .card.mb-4
    {
      margin-bottom: 0 !important;
      .card-footer
      {
        padding: 0;
      }
      a::after {
        content: "";
        clear: both;
        display: table;
      }
    }
  }
}

.left { width: 100%; }
.right {
  display:flex;
  align-items:flex-start;
  align-content:flex-start;
  flex-wrap: wrap;
  width: 100%;
  > div {
    min-width: 100%;
  }
}

@media only screen and (min-width: 768px) {
  .left { width: 33%; }
  .right {
    padding-left: 0;
    width: 66.66%;
  }
}

@media only screen and (min-width: 992px) {
  .left { width: 33%; }
  .right {
    width: 66.66%;
    > div {
      min-width: 300px;
    }
  }
}

@media only screen and (min-width: 1140px) {
  .left { width: 25%; }
  .right {
    width: 75%;
  }
}

.react-grid-layout
{
  position: relative;
  > div
  {
    overflow: hidden;
    background: #ccc;
  }
}

> .tiles
{

  margin-left: -15px;
  margin-right: -15px;
  padding-left: 15px;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, auto));
  
  > div
  {
    padding-right: 15px;
    padding-bottom: 15px;

    > .mb-4.card
    {
      margin-bottom: 0 !important;

    }
  }

}

`;
