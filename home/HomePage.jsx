import React from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import FontAwesome from 'react-fontawesome';
import { withRouter, } from 'react-router-dom';

import withLayout from 'js/app/models/withLayout';
import withLink from 'js/app/models/withLink';

// === Tabs ===
import DashboardTab from 'js/app/views/home/tabs/dashboard';
import ChangesTab from 'js/app/views/home/tabs/changes';
import ApprovalsTab from 'js/app/views/home/tabs/approvals';
import SamplesTab from 'js/app/views/home/tabs/samples';
import FeedbackTab from 'js/app/views/home/tabs/feedback';
import TasksTab from 'js/app/views/home/tabs/tasks';

import "css/nav-tabs.css";

let RouterNavLink = withLink(NavLink);

let HomePage = withRouter(class extends React.Component {

  render() {
    let tab = !!this.props.match.params.tab ? this.props.match.params.tab : 'dashboard';

    return (
      <div className={this.props.className}>

        {/* Tab */}
        <Nav tabs id="home-tabs" className="chg-horizontal-tabs">
          <NavItem className="my" disabled>
            <NavLink disabled>
              My
            </NavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'dashboard' })}
              href='/dashboard/'
            >
              <FontAwesome name='home' />&nbsp;
              Dashboard
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'changes' })}
              href='/my/changes/'
            >
              <FontAwesome name='edit' />&nbsp;
              Changes
            </RouterNavLink>
          </NavItem>
          {/* <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'tasks' })}
              href='/my/tasks/'
            >
              <FontAwesome name='tasks' />&nbsp;
              Tasks
            </RouterNavLink>
          </NavItem> */}
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'approvals' })}
              href='/my/approvals/'
            >
              <FontAwesome name='check-square' />&nbsp;
              Approvals
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'samples' })}
              href='/my/samples/'
            >
              <FontAwesome name='microchip' />&nbsp;
              Samples
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'feedback' })}
              href='/my/feedback/'
            >
              <FontAwesome name='comment' />&nbsp;
              PCN Feedback
            </RouterNavLink>
          </NavItem>
        </Nav>

        {/* TabContent */}
        <TabContent activeTab={tab}>
          <TabPane tabId="dashboard">
            {tab === 'dashboard' ? <DashboardTab /> : undefined}
          </TabPane>
          <TabPane tabId="changes">
            {tab === 'changes' ? <ChangesTab /> : undefined}
          </TabPane>
          {/* <TabPane tabId="tasks">
            {tab === 'tasks' ? <TasksTab /> : undefined}
          </TabPane> */}
          <TabPane tabId="approvals">
            {tab === 'approvals' ? <ApprovalsTab /> : undefined}
          </TabPane>
          <TabPane tabId="samples">
            {tab === 'samples' ? <SamplesTab /> : undefined}
          </TabPane>
          <TabPane tabId="feedback">
            {tab === 'feedback' ? <FeedbackTab /> : undefined}
          </TabPane>
        </TabContent>
      </div>
    )
  }
})

export default withLayout(HomePage)