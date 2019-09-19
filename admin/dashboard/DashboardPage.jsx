import React, { Component, } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import { withRouter, } from 'react-router-dom';

import withLayout from 'js/app/models/withLayout'; 
import withLink from 'js/app/models/withLink';

import "css/nav-tabs.css";

let RouterNavLink = withLink(NavLink);

let HomePage = withRouter(class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'dashboard',
    };
    
    // Bind functions
    this.handleTabToggle = this.handleTabToggle.bind(this);
  }
  
  // Handler for tab toggle
  handleTabToggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {

    let tab = !!this.props.match.params.tab ? this.props.match.params.tab : 'dashboard';

    return (
      <div className={this.props.className}>

        {/* Tab */} 
        <Nav tabs id="admin-tabs" className="chg-horizontal-tabs">
          <NavItem className="my" disabled>
            <NavLink disabled>
              Admin
            </NavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'dashboard' })}
              href='/admin/dashboard/'
            >
              <FontAwesome name='home' />&nbsp;
              Dashboard
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'announcements' })}
              href='/admin/announcements/'
            >
              <FontAwesome name='bullhorn' />&nbsp;
              Announcements
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'security' })}
              href='/admin/security/'
            >
              <FontAwesome name='user' />&nbsp;
              Security
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'sbe' })}
              href='/admin/sbe/'
            >
              <FontAwesome name='th' />&nbsp;
              SBE Maintenance
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'email' })}
              href='/admin/email/'
            >
              <FontAwesome name='envelope' />&nbsp;
              Email
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'trashcan' })}
              href='/admin/trashcan/'
            >
              <FontAwesome name='trash' />&nbsp;
              Trash Can
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink className={classnames({ active: tab === 'trashcan' })}
                href='/admin/ccb/role'
            >
              <FontAwesome name='' />&nbsp;
                CCB Role Maintenance
            </RouterNavLink>
          </NavItem>
        </Nav>

        {/* TabContent */} 
        <TabContent activeTab={tab}>
          <TabPane tabId="dashboard">
          </TabPane>
          <TabPane tabId="changes">
          </TabPane>
        </TabContent>

      </div>
    );
  }
});

export default withLayout(styled(HomePage)`
`);