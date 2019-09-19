import React, { Component, } from 'react';
import {
  Nav, NavItem, NavLink,
  TabContent, TabPane
} from 'reactstrap';
import classnames from 'classnames';
import { withRouter, } from 'react-router-dom';

import withLayout from 'js/app/models/withLayout';
import withLink from 'js/app/models/withLink';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';

import "css/nav-tabs.css";

// === Tabs ===
import SamplesLateTab from 'js/app/views/admin/samples/SamplesLateTab';
import SamplesQuantityTab from 'js/app/views/admin/samples/SamplesQuantityTab';
import SamplesRequestTab from 'js/app/views/admin/samples/SamplesRequestTab';
import SamplesWindowTab from 'js/app/views/admin/samples/SamplesWindowTab';

let RouterNavLink = withLink(NavLink);

let SamplesAdminPage = withRouter(class extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'request'
    }
    this.handleTabToggle = this.handleTabToggle.bind(this);
  }

  handleTabToggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    const { ...other } = this.props;
    let tab = !!this.props.match.params.tab ? this.props.match.params.tab : 'request';

    return (
      <div className={this.props.className}>

         <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Admin', active: true },
                    { text: 'Samples Management', active: true }
                ]} />

        {/* Tabs */}
        <Nav tabs className="chg-horizontal-tabs">
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'request' })}
              href='/admin/samples/request/'>
              Max Number of Requests
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'late' })}
              href='/admin/samples/late/'>
              Late Samples
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'quantity' })}
              href='/admin/samples/quantity/'>
              Quantity of Samples
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'window' })}
              href='/admin/samples/window/'>
              Request Window
            </RouterNavLink>
          </NavItem>
        </Nav>

        {/* TabContent */}
        <TabContent activeTab={tab}>
          <TabPane tabId="request">
              { tab === 'request' ? <SamplesRequestTab { ...other } /> : undefined }
          </TabPane>
          <TabPane tabId="late">
              { tab === 'late' ? <SamplesLateTab { ...other } /> : undefined }
          </TabPane>
          <TabPane tabId="quantity">
              { tab === 'quantity' ? <SamplesQuantityTab { ...other } /> : undefined }
          </TabPane>
          <TabPane tabId="window">
              { tab === 'window' ? <SamplesWindowTab { ...other } /> : undefined }
          </TabPane>
        </TabContent>

      </div>
    );
  }
});

export default withLayout(SamplesAdminPage);
