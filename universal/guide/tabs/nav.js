import React, { Component, } from 'react';
import {
  Badge, Card, Row, Col, 
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';

import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import { HorizontalTabs, VerticalTabs } from 'js/app/models/ChangelinkUI';
import ScrollToTop from 'js/universal/ScrollToTop';

const tabs = [
  { label: 'Tab 1', active: true },
  { label: 'Tab 2' },
  { label: 'Tab 3' },
  { label: 'Tab 4' },
  { label: 'Tab 5' },
  { label: 'Tab 6' },
  { label: 'Tab 7' },
  { label: 'Tab with Icon', icon: 'cog' },
  { label: 'Tab with Badge', badge: '9' },
  { label: 'Tab with Both', icon: 'cog', badge: '10' },
  { label: 'Tab with Badge', badge: '11', active: true },
]

class NavigationTab extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h4>Navigation Elements</h4>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Breadcrumbs</h5>

        <ChangeLinkBreadcrumb crumbs={[
          { text: 'Home', to: "#" },
          { text: 'Module A', to: "#" },
          { text: 'Component B', to: "#" },
          { text: 'Active Page C', active: true }
        ]} />

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Dropdown</h5>

        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
          <DropdownToggle color="primary" caret>
            More Options...
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Header A</DropdownItem>
            <DropdownItem>Option 1</DropdownItem>
            <DropdownItem>Option 2</DropdownItem>
            <DropdownItem><FontAwesome name="cog" />{' '}Option with Icon</DropdownItem>
            <DropdownItem>Option with Badge{' '}<Badge color="dark">4</Badge></DropdownItem>
            <DropdownItem divider />
            <DropdownItem header>Header B</DropdownItem>
            <DropdownItem disabled>Disabled Option</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Horizontal Tabs</h5>

        <Card body>
          <HorizontalTabs tabs={tabs} />
        </Card>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Vertical Tabs</h5>
        
        <Row>
          <Col sm={4} md={3} lg={2}>
            <VerticalTabs tabs={tabs} />
          </Col>
          <Col style={{ height: '100%' }}>
            <Card body>
              <h5>Vertical Tab Content Here</h5>
              <p>Lorem ipsum ad nauseam...</p>
            </Card>
          </Col>
        </Row>

        {/* Defaults => placement: right, color: dark */}
        <ScrollToTop placement="right" color="dark" />

      </div>
    );
  }
}

export default styled(NavigationTab) `
`;