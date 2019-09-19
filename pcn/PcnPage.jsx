import React, { Component } from 'react';
import withLayout from 'js/app/models/withLayout';
import withLink from 'js/app/models/withLink';
import classnames from 'classnames';
import { withRouter, } from 'react-router-dom';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';

import {
  Dropdown, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink,
  TabContent, TabPane, Alert
} from 'reactstrap';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import Spinner from 'js/universal/spinner';
import SummaryCard from 'js/app/models/SummaryCard';

import ApprovalMatrix from "js/app/views/change/ApprovalMatrix";
import PcnAttributes from "./tabs/PcnAttributes";
import NotificationHistory from "./tabs/NotificationHistory";
import PCNCustomerDevice from "./tabs/PCNCustomerDevice";
import AttachmentTabDisplay from 'js/app/views/change/tabs/attachment';
import DiaryPage from 'js/app/views/home/tabs/DiaryPage';
import UnderConstruction from 'js/universal/UnderConstruction';
import ImplementationMatrixTab from 'js/app/views/change/tabs/implmatrix';
import { Row, Col } from "reactstrap";

import "css/nav-tabs.css";

// === URLs ===
const PCN_LIST_URL = '/pcns';
const PCN_URL_PREFIX = '/api/v1/pcn/get/';
const PCN_SUMMARY_URL = '/summary';

const TAB_PREFIX = '/pcn/';
const TAB_APPROVAL_MATRIX = 'approval-matrix';
const TAB_IMPL_MATRIX = 'impl-matrix';
const TAB_ATTRIBUTES = 'attributes';
const TAB_CUSTDEV = 'customer-devices';
const TAB_TEMPLATES = 'templates';
const TAB_LETTERS = 'letters';
const TAB_PREVIEWS = 'previews';
const TAB_APPROVAL = 'approval';
const TAB_ISSUE_NOTIF = 'issue-notification';
const TAB_NOTIF_HIST = 'notification-history';
const TAB_ATTACHMENTS = 'attachments';
const TAB_CHGDIARY = 'chgdiary';
const TAB_AUDITLOG = 'auditlog';
const DEFAULT_TAB = 'approval-matrix';

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin', 'Sample Coordinator', 'PCN Coordinator']

let RouterNavLink = withLink(NavLink);

let PcnPage = withRouter(class extends Component {

  constructor(props) {
    super(props);
    let pcnNumber = !!this.props.match.params.pcnNumber ? this.props.match.params.pcnNumber : 'Not Found';

    this.state = {
      pcnNumber: pcnNumber,
      summaryData: undefined,
      showSpinner: true,
      dropdownOpen: false,
      configPcnUrl: 'http://giant.sc.ti.com/pcn/pcnsys.nsf/PCNNumber/',
      crumbs: [
        { text: 'Home', to: "/" },
        { text: 'PCNs', to: PCN_LIST_URL },
        { text: pcnNumber, active: true }
      ],
      hasAdminRole: false
    }

    // Bind functions
    this.toggleTabDropdown = this.toggleTabDropdown.bind(this);
    this.getConfigValues = this.getConfigValues.bind(this);
  }

  // Handler for tab toggle
  handleTabToggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  toggleTabDropdown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  getConfigValues() {
    let fetchURL = '/api/v1/config/configuration/name/pcnsystem.url.pcn'; // API

    // Fetch the config value
    fetch(fetchURL, {
      method: 'GET',
      credentials: 'include',
      headers: new Headers({
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      })
    })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        this.setState({
          configPcnUrl: json.value
        })
      })
      .catch((ex) => { throw ex });
  }

  fetchSummaryData = () => {
    let fetchURL = PCN_URL_PREFIX + this.state.pcnNumber + PCN_SUMMARY_URL; // API
    // let fetchURL = '/json/pcn/summary.json'; // Mock

    // Fetch the summary data
    fetch(fetchURL,
      {
        credentials: 'include',
        headers: new Headers({
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        })
      })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => { this.setState({ summaryData: json }) })
      .catch((ex) => { this.setState({ summaryData: null }); throw ex });
  }

  componentWillMount() {
    this.fetchSummaryData();
  }

  componentDidMount() {
    let hasAdminRoles = this.props.hasRole(ADMIN_ROLES);

    // Fetch the config values
    this.getConfigValues();
    this.setState({ showSpinner: false, hasAdminRoles: hasAdminRoles });
  }

  componentWillReceiveProps(nextProps) {
    let hasAdminRoles = nextProps.hasRole(ADMIN_ROLES);
    this.setState({ hasAdminRoles });
  }

  render() {
    let canEditAttachment = this.state.hasAdminRoles ? true : false;
    const { ...other } = this.props;
    if (this.state.summaryData === undefined) {
      return (
        <div className={this.props.className}>
          <Spinner showSpinner />
        </div>
      )
    } else if (this.state.summaryData === null || this.state.summaryData.fields === null) {
      return (
        <div className={this.props.className}>
          <Alert color="danger">
            <h4>{`PCN Number ${this.state.pcnNumber} not found`}</h4>
          </Alert>
        </div>
      )
    } else {
      let tab = !!this.props.match.params.tab ? this.props.match.params.tab : DEFAULT_TAB;
      return (
        <div className={this.props.className}>
          <Spinner showSpinner={this.state.showSpinner} />

          <Row style={{ margin: 0 }} >
            <Col mr="0" xs="0"><ChangeLinkBreadcrumb crumbs={this.state.crumbs} /> </Col>
            <Col mr="0" xs="0" pt="3x">
              <a href={this.state.configPcnUrl + this.state.pcnNumber} target="_blank" rel="noopener noreferrer">
                <FontAwesome name='link' style={{ background: 'grey', color: 'white', padding: '7px' }} />
              </a>
            </Col>
          </Row>

          {/* Use generic summary card */}
          {
            !!this.state.summaryData
              ? (
                <SummaryCard data={this.state.summaryData}
                  canSubscribe={false}
                  canDelete={false}
                  canPin={false} />
              ) : undefined
          }

          {/* Spacer */}
          <div className="clearfix" style={{ height: '1rem' }} />

          {/* Info Banner */}
          {
            this.state.hasAdminRoles
              ? <Alert color="info">
                The <b>Customer Approval Matrix</b> displays customer approvals only.
                Refer to the <b>Implementation Matrix</b> for implementation readiness.
              </Alert>
              : undefined
          }

          {/* Spacer */}
          <div className="clearfix" style={{ height: '1rem' }} />

          {/* Tabs */}
          <Nav tabs className="chg-horizontal-tabs">
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === TAB_IMPL_MATRIX })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_IMPL_MATRIX}>
                Implementation Matrix
                  </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === TAB_APPROVAL_MATRIX })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_APPROVAL_MATRIX}>
                Customer Approval Matrix
            </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === TAB_ATTRIBUTES })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_ATTRIBUTES} >
                Attributes
            </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === TAB_CUSTDEV })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_CUSTDEV}>
                Customer Devices
            </RouterNavLink>
            </NavItem>
            {/* <NavItem>
              <RouterNavLink disabled
                className={classnames({ active: tab === TAB_TEMPLATES })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_TEMPLATES}>
                Select Template
            </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink disabled
                className={classnames({ active: tab === TAB_LETTERS })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_LETTERS}>
                Generate Letter
            </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink disabled
                className={classnames({ active: tab === TAB_PREVIEWS })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_PREVIEWS}>
                Send Preview
            </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink disabled
                className={classnames({ active: tab === TAB_APPROVAL })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_APPROVAL}>
                PCN Approval
            </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink disabled
                className={classnames({ active: tab === TAB_ISSUE_NOTIF })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_ISSUE_NOTIF}>
                Issue Notification
            </RouterNavLink>
            </NavItem> */}
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === TAB_NOTIF_HIST })}
                href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_NOTIF_HIST}>
                Revisions
            </RouterNavLink>
            </NavItem>
            <NavItem>
              <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleTabDropdown}>
                <DropdownToggle
                  tag="span"
                  onClick={this.toggleTabDropdown}
                  data-toggle="dropdown"
                  aria-expanded={this.state.dropdownOpen}
                  className="nav-link more-nav-link"
                >
                  More... {' '} <FontAwesome name="caret-down" />
                </DropdownToggle>
                <DropdownMenu>
                  <div onClick={this.toggleTabDropdown}>
                    <RouterNavLink
                      className={classnames('more-nav-link', { active: tab === TAB_ATTACHMENTS })}
                      href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_ATTACHMENTS} style={{ borderColor: '!important none' }}>
                      Attachments
                  </RouterNavLink>
                  </div>
                  <div onClick={this.toggleTabDropdown}>
                    <RouterNavLink
                      className={classnames('more-nav-link', { active: tab === TAB_CHGDIARY })}
                      href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_CHGDIARY} style={{ borderColor: '!important none' }}>
                      Change Diary
                  </RouterNavLink>
                  </div>
                  {/* <div onClick={this.toggleTabDropdown}>
                    <RouterNavLink disabled
                      className={classnames('more-nav-link', { active: tab === TAB_AUDITLOG })}
                      href={TAB_PREFIX + this.state.pcnNumber + '/' + TAB_AUDITLOG} style={{ borderColor: '!important none' }}>
                      Audit Log
                  </RouterNavLink>
                  </div> */}
                </DropdownMenu>
              </Dropdown>
            </NavItem>
          </Nav>

          {/* TabContent */}
          <TabContent activeTab={tab}>
            <TabPane tabId={TAB_APPROVAL_MATRIX}>
              <ApprovalMatrix {...other}
                pcnNumber={this.state.pcnNumber}
                filterByPCN hasActions
              />
            </TabPane>
            <TabPane tabId="impl-matrix">
              {
                tab === 'impl-matrix'
                  ? <ImplementationMatrixTab tableId="impl-matrix-PCN" source={"PCN"} URL={"/api/v1/implMatrixPcn/" + this.state.pcnNumber} pcnNumber={this.state.pcnNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_ATTRIBUTES}>
              {
                tab === TAB_ATTRIBUTES
                  ? <PcnAttributes pcnNumber={this.state.pcnNumber} userAccess={this.props.userAccess} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_CUSTDEV}>
              {
                tab === TAB_CUSTDEV
                  ? <PCNCustomerDevice {...this.props} pcnNumber={this.state.pcnNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_TEMPLATES}>
              {
                tab === TAB_TEMPLATES
                  ? <UnderConstruction />
                  : undefined
              }

            </TabPane>
            <TabPane tabId={TAB_LETTERS}>
              {
                tab === TAB_LETTERS
                  ? <UnderConstruction />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_PREVIEWS}>
              {
                tab === TAB_PREVIEWS
                  ? <UnderConstruction />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_APPROVAL}>
              {
                tab === TAB_APPROVAL
                  ? <UnderConstruction />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_ISSUE_NOTIF}>
              {
                tab === TAB_ISSUE_NOTIF
                  ? <UnderConstruction />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_NOTIF_HIST}>
              {
                tab === TAB_NOTIF_HIST
                  ? <NotificationHistory {...this.props} {...other} pcnNumber={this.state.pcnNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_ATTACHMENTS}>
              {
                tab === TAB_ATTACHMENTS
                  ? <AttachmentTabDisplay {...this.props} number={this.state.pcnNumber} loc='PCN' isVisible={canEditAttachment} hideEdit={canEditAttachment} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_CHGDIARY}>
              {
                tab === TAB_CHGDIARY
                  ? <DiaryPage {...this.props} pcnNumber={this.state.pcnNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId={TAB_AUDITLOG}>
              {
                tab === TAB_AUDITLOG
                  ? <UnderConstruction />
                  : undefined
              }
            </TabPane>
          </TabContent>
        </div>
      )
    }
  }
});

export default withLayout(styled(PcnPage)`
.more-nav-link
{
  padding: .5rem .75rem;
  font-size: 14px;
  cursor: pointer;
  color: #007bff;
}
`);
