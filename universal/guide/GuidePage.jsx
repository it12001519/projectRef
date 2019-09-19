import React, { Component, } from 'react';
import {
  Nav, NavItem, NavLink,
  TabContent, TabPane
} from 'reactstrap';
import classnames from 'classnames';
import { withRouter, } from 'react-router-dom';

import withLayout from 'js/app/models/withLayout';
import withLink from 'js/app/models/withLink';

import "css/nav-tabs.css";

// === Tabs ===
import ButtonsTab from 'js/universal/guide/tabs/buttons';
// import FormTab from 'js/universal/guide/tabs/form';
import FormWidgetTab from 'js/universal/guide/tabs/formWidget';
import GridTab from 'js/universal/guide/tabs/grid';
import IconsTab from 'js/universal/guide/tabs/icons';
import LayoutTab from 'js/universal/guide/tabs/layout';
import NavigationTab from 'js/universal/guide/tabs/nav';
import ModalsTab from 'js/universal/guide/tabs/modals';
import StatusTab from 'js/universal/guide/tabs/status';
import TextTab from 'js/universal/guide/tabs/text';

let RouterNavLink = withLink(NavLink);

let GuidePage = withRouter(class extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'buttons'
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
    let tab = !!this.props.match.params.tab ? this.props.match.params.tab : 'buttons';

    return (
      <div className={this.props.className}>

        <h4>Changelink Design Guidelines</h4>

        {/* Tabs */}
        <Nav tabs className="chg-horizontal-tabs">
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'buttons' })}
              href='/guide/buttons/'>
              Buttons
            </RouterNavLink>
          </NavItem>
          {/* <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'form' })}
              href='/guide/form/'>
              Form
            </RouterNavLink>
          </NavItem> */}
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'form-widget' })}
              href='/guide/form-widget/'>
              Form Widget
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'grid' })}
              href='/guide/grid/'>
              Grid
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'icons' })}
              href='/guide/icons/'>
              Icons
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'layout' })}
              href='/guide/layout/'>
              Layout
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'nav' })}
              href='/guide/nav/'>
              Navigation
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'modals' })}
              href='/guide/modals/'>
              Modals
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'status' })}
              href='/guide/status/'>
              Status
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              className={classnames({ active: tab === 'text' })}
              href='/guide/text/'>
              Text
            </RouterNavLink>
          </NavItem>
        </Nav>

        {/* TabContent */}
        <TabContent activeTab={tab}>
          <TabPane tabId="buttons">
            <ButtonsTab />
          </TabPane>
          {/* <TabPane tabId="form">
            <FormTab />
          </TabPane> */}
          <TabPane tabId="form-widget">
            <FormWidgetTab />
          </TabPane>
          <TabPane tabId="grid">
            <GridTab />
          </TabPane>
          <TabPane tabId="icons">
            <IconsTab />
          </TabPane>
          <TabPane tabId="layout">
            <LayoutTab />
          </TabPane>
          <TabPane tabId="nav">
            <NavigationTab />
          </TabPane>
          <TabPane tabId="modals">
            <ModalsTab />
          </TabPane>
          <TabPane tabId="status">
            <StatusTab />
          </TabPane>
          <TabPane tabId="text">
            <TextTab />
          </TabPane>
        </TabContent>

      </div>
    );
  }
});

export default withLayout(GuidePage);