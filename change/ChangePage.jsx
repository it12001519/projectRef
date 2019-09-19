import React, { Component, } from 'react';
import {
  Dropdown, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, TabContent, TabPane, Alert
  , Row, Col
} from 'reactstrap';
import classnames from 'classnames';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import { withRouter, } from 'react-router-dom';
import 'whatwg-fetch';
import { fetchGet, fetchPost, fetchDelete, } from 'js/universal/FetchUtilities'

import withLayout from 'js/app/models/withLayout';
import withLink from 'js/app/models/withLink';

import "css/nav-tabs.css";

import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import Spinner from 'js/universal/spinner';
import SummaryCard from 'js/app/models/SummaryCard';
import DiaryPage from 'js/app/views/home/tabs/DiaryPage'

// === Tabs ===
import AttributesTab from './tabs/AttributesTab';
import PhasesTab from './tabs/phases';
import CustomerTab from './tabs/customer';
import DeviceTab from './tabs/device';
import UnderConstruction from 'js/universal/UnderConstruction';
import QualTab from 'js/app/views/change/tabs/quals';
import ImplementationMatrixTab from 'js/app/views/change/tabs/implmatrix';
import ApprovalTab from './tabs/approval';
import ChangeCustomerDevice from 'js/app/views/change/tabs/pcn';
import AttachmentTabDisplay from './tabs/attachment';

// === URLs ===
const CHANGES_URL = "/changes";

//const SUMMARY_URL = "/json/change/summary.json"; // Mock CHG data
//const SUMMARY_URL = "/json/pcn/summary.json"; // Mock PCN data
const SUMMARY_URL = "/api/v1/summary/";
const URL_AUTHORIZATION_CHECK = "/api/v1/change/{1}/authorized";
const URL_CAN_PUSH_TO_PCN = "/api/v1/change/{1}/countCanUpdate";
const URL_CAN_DELETE_ATT = "/api/v1/change/{1}/minChangeState"

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin', 'Change Coordinator']

let RouterNavLink = withLink(NavLink);

let ChangePage = withRouter(class extends Component {

  constructor(props) {
    super(props);
    let changeNumber = this.props.match.params.changeNumber;

    this.state = {
      changeNumber: changeNumber,
      summaryData: undefined,
      showSpinner: true,
      dropdownOpen: false,
      configCMSUrl: '',
      crumbs: [
        { text: 'Home', to: "/" },
        { text: 'Changes', to: CHANGES_URL },
        { text: changeNumber, active: true }
      ],
      validChangeNumber: true,
      hasAdminRole: false,
      canEdit: false,
      canCopy: false,
      canDelete: false,
      canPushToPCN: 0,
      canDeleteAttachment: true
    }
  }

  redirect = (url) => {
    this.props.history.push(url) // Register the page in browser history
    window.location = `${url}` // Force browser reload
  }

  refresh = () => {
    this.fetchSummaryData()
    this.fetchAuthorizationForChange()
  }

  toggleTabDropdown = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    })
  }

  getConfigValues = () => {
    let fetchURL = '/api/v1/config/configuration/name/cms.url.cms'; // API

    // Fetch the config value
    fetchGet(fetchURL,
      (httpStatus, response) => {
        this.setState({ configCMSUrl: response.value })
      })
  }

  fetchSummaryData = () => {
    // Fetch the summary data
    fetchGet(SUMMARY_URL + this.state.changeNumber,
      (httpStatus, response) => { 
        // Check if the status is HTTP 40X, aka not found
        if (httpStatus >= 400 && httpStatus < 500) {
          this.setState({ summaryData: {}, validChangeNumber: false })
        } else {
          // Else, check if response has a value
          if (response.fields.length === 0) {
            this.setState({ summaryData: {}, validChangeNumber: false })
          } else {
            this.setState({ summaryData: response })
          }
        }
      }, _=> this.setState({ summaryData: {} }))
  }

  fetchCanPushToPCN = () => {
    fetchGet(URL_CAN_PUSH_TO_PCN.replace('{1}', this.state.changeNumber),
    (httpStatus, response) => {
      this.setState({ canPushToPCN: response})      
    })
  }

  fetchCanDeleteAtt = () => {
    fetchGet(URL_CAN_DELETE_ATT.replace('{1}', this.state.changeNumber),
    (httpStatus, response) => {
      let minChangeState = response === undefined ? 99 : response;
      this.setState({ canDeleteAttachment: minChangeState > 1 ? false : true})      
    })
  }

  fetchAuthorizationForChange = () => {
    const changeNumber = this.state.changeNumber
    this.setState({ canCopy: true }) // defauklt to true
    fetchPost(URL_AUTHORIZATION_CHECK.replace('{1}', changeNumber), undefined,
    (httpStatus, response) => { 
      this.setState({ canEdit: response.authorized })
    })
    fetchDelete(URL_AUTHORIZATION_CHECK.replace('{1}', changeNumber), 
    (httpStatus, response) => { 
      this.setState({ canDelete: response.authorized })
    })
  }

  componentWillMount() {
    this.fetchSummaryData()
  }

  componentDidMount() {
    let hasAdminRoles = this.props.hasRole(ADMIN_ROLES)
    this.getConfigValues()
    this.fetchAuthorizationForChange()
    this.fetchCanPushToPCN()
    this.fetchCanDeleteAtt()
    this.setState({ showSpinner: false, hasAdminRoles: hasAdminRoles })
  }

  componentWillReceiveProps(nextProps) {
    let hasAdminRoles = nextProps.hasRole(ADMIN_ROLES)
    this.setState({ hasAdminRoles })
  }

  render() {
     
    let tab = !!this.props.match.params.tab ? this.props.match.params.tab : 'attributes';
    let canPushToPCN = this.state.canPushToPCN === undefined ? false : (this.state.canPushToPCN > 0 ? true : false)

    if (this.state.summaryData === undefined) {
      // Show a spinner while the page loads
      return <div><Spinner showSpinner /></div>
    } else if (!this.state.validChangeNumber) {
      // If the change number is invalid, show an alert
      return <div>
        <Alert color="danger">
          <h4>{`Change Number ${this.state.changeNumber} not found`}</h4>
        </Alert>
      </div>
    } else {
      return (
        <div className={this.props.className}>
          <Spinner showSpinner={this.state.showSpinner} />

          <Row style={{ margin: 0 }} >
            <Col mr="0" xs="0"><ChangeLinkBreadcrumb crumbs={this.state.crumbs} /> </Col>
            <Col mr="0" xs="0" pt="3x">
              <a href={this.state.configCMSUrl + this.state.changeNumber} target="_blank" rel="noopener noreferrer">
                <FontAwesome name='link' style={{ background: 'grey', color: 'white', padding: '7px' }} />
              </a>
            </Col>
          </Row>

          {/* Use generic summary card with phase data */}
          <SummaryCard data={this.state.summaryData}
            canSubscribe={false}
            canDelete={false}
            canPin={false} />

          {/* Spacer */}
          <div className="clearfix" style={{ height: '1rem' }} />

          {/* Tabs */}
          <Nav tabs className="chg-horizontal-tabs">
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === 'attributes' })}
                href={'/change/' + this.state.changeNumber + '/attributes/'}>
                Attributes
                        </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === 'devices' })}
                href={'/change/' + this.state.changeNumber + '/devices/'}>
                Devices
                        </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === 'customers' })}
                href={'/change/' + this.state.changeNumber + '/customers/'}>
                Customers
                        </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === 'quals' })}
                href={'/change/' + this.state.changeNumber + '/quals/'}>
                Quals
                        </RouterNavLink>
            </NavItem>            
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === 'implmatrix' })}
                href={'/change/' + this.state.changeNumber + '/implmatrix/'}>
                Implementation Matrix
                            </RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === 'approval' })}
                href={'/change/' + this.state.changeNumber + '/approval/'}>
                Approval
                                </RouterNavLink>
            </NavItem>
            <NavItem>               
              <RouterNavLink disabled={!(canPushToPCN)}
                className={classnames({ active: tab === 'pcn' })}
                href={'/change/' + this.state.changeNumber + '/pcn/'}>
                PCN
              </RouterNavLink>              
            </NavItem>
            <NavItem>
              <RouterNavLink
                className={classnames({ active: tab === 'phases' })}
                href={'/change/' + this.state.changeNumber + '/phases/'}>
                Phases
                        </RouterNavLink>
            </NavItem>
            {/* <NavItem>
                                <RouterNavLink disabled
                                    className={classnames({ active: tab === 'actions' })}
                                    href={'/change/' + this.state.changeNumber + '/actions/'}>
                                    Actions
                        </RouterNavLink>
                            </NavItem> */}
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
                                                    className={classnames('more-nav-link', { active: tab === 'attachments' })}
                                                    href={'/change/' + this.state.changeNumber + '/attachments/'} style={{ borderColor: '!important none' }}>
                                                    Attachments
                                        </RouterNavLink>
                                            </div>
                                            <div onClick={this.toggleTabDropdown}>
                                                <RouterNavLink
                                                    className={classnames('more-nav-link', { active: tab === 'chgdiary' })}
                                                    href={'/change/' + this.state.changeNumber + '/chgdiary/'} style={{ borderColor: '!important none' }}>
                                                    Change Diary
                                        </RouterNavLink>
                                            </div>
                                            {/* <div onClick={this.toggleTabDropdown}>
                                                <RouterNavLink disabled
                                                    className={classnames('more-nav-link', { active: tab === 'auditlog' })}
                                                    href={'/change/' + this.state.changeNumber + '/auditlog/'} style={{ borderColor: '!important none' }}>
                                                    Audit Log
                                        </RouterNavLink>
                                            </div> */}
                                        </DropdownMenu>
                                    </Dropdown>
                                </NavItem>
                            </Nav>

          {/* TabContent */}
          <TabContent activeTab={tab}>
            <TabPane tabId="actions">
              {/* Hiding the Actions Tab. Version 1.1 feature. */}
              {/* <ActionsTab /> */}
              <UnderConstruction />
            </TabPane>
            <TabPane tabId="attributes">
              {
                tab === 'attributes'
                  ? <AttributesTab changeNumber={this.state.changeNumber} redirect={this.redirect} refresh={this.refresh}
                                   canEdit={this.state.canEdit} canCopy={this.state.canCopy} canDelete={this.state.canDelete} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="phases">
              {
                tab === 'phases'
                  ? <PhasesTab changeNumber={this.state.changeNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="devices">
              {
                tab === 'devices'
                  ? <DeviceTab {...this.props} changeNumber={this.state.changeNumber} summaryData={this.state.summaryData} 
                            refresh={this.refresh} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="customers">
              {
                tab === 'customers'
                  ? <CustomerTab changeNumber={this.state.changeNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="quals">
              {
                tab === 'quals'
                  ? <QualTab changeNumber={this.state.changeNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="pcn">
              {
                tab === 'pcn'
                  ? <ChangeCustomerDevice {...this.props} changeNumber={this.state.changeNumber} canPushToPCN={canPushToPCN}
                      refresh={this.refresh} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="implmatrix">
              {
                tab === 'implmatrix'
                  ? <ImplementationMatrixTab tableId="impl-matrix-change" source={"Change"} changeNumber={this.state.changeNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="approval">
              {
                tab === 'approval'
                  ? <ApprovalTab changeNumber={this.state.changeNumber} {...this.props} refresh={this.refresh} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="attachments">
              {
                tab === 'attachments'
                  ? <AttachmentTabDisplay {...this.props} fields={this.state.summaryData.fields} canDelete={this.state.canDeleteAttachment} isVisible={this.state.canEdit} number={this.state.changeNumber} loc='CMS' />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="chgdiary">
              {
                tab === 'chgdiary'
                  ? <DiaryPage {...this.props} changeNumber={this.state.changeNumber} pcnNumber={this.state.pcnNumber} />
                  : undefined
              }
            </TabPane>
            <TabPane tabId="auditlog">
              {
                tab === 'auditlog'
                  ? <UnderConstruction />
                  : undefined
              }
            </TabPane>
          </TabContent>
        </div>
      )
    }
  }
})

export default withLayout(styled(ChangePage) `
  .more-nav-link
  {
    padding: .5rem .75rem;
    font-size: 14px;
    cursor: pointer;
    color: #007bff;
  }
`)
