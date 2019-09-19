import React from 'react'
import { Button, ButtonGroup, InputGroup, InputGroupAddon, InputGroupText, Modal, ModalBody, ModalHeader } from "reactstrap";
import FontAwesome from 'react-fontawesome';
import FetchUtilities from 'js/universal/FetchUtilities';
import { removeFromArray } from 'js/universal/commons';
import { Link, Redirect } from 'react-router-dom';

import { GridActionCell, GridBadgeCell, GridCheckboxCell, GridLinkCell, GridTextCell } from 'js/universal/GridCells';
import { InfoModal, ComponentModal } from 'js/universal/Modals';
import Spinner, { showOverlaySpinner, hideOverlaySpinner, } from 'js/universal/spinner';
import ReactiveTable, { ReactiveTableStore } from 'reactive-tables';
import ApprovalMatrixFeedbackForm from "js/app/views/change/ApprovalMatrixFeedbackForm";

// URL's used for Approval Matrix
const BASE_URL = "/api/v1/approval-matrix/";
const CHK_INIT_URL = "/api/chk/init/";
const CHK_URL = "/api/chk/toggle/";

const localStorageSelectionList = 'approvalMatrixSelectionList';

const COLUMN_ID = 'deviceId';
const COLUMN_STATUS = 'deviceShortText';
const COLUMN_SAMPLE = 'sampleNumber';
const COLUMN_SAMPLE_ACTION = 'sampleAction';
const COLUMN_CMS = 'cmsNumber';
const COLUMN_EQDB = 'qdbStatus';
const COLUMN_FEEDBACK = 'feedbackNumber';
const COLUMN_FEEDBACK_ATTACHMENT = 'feedbackAttachmentCount';
const COLUMN_SAMPLE_ATTACHMENT = 'sampleAttachmentCount';

// Set up the default headers to disable browser cache fetches
var headers = new Headers();
headers.append('pragma', 'no-cache')
headers.append('cache-control', 'no-cache')

var pcnSamplesTeam = 'pcnsamples_team@list.ti.com';

let columns = [
    {
        key: 'deviceId',
        label: ' ',
        sortable: false,
        filterable: false
    }, {
        key: 'deviceShortText',
        label: 'Approval Status'
    }, {
        key: 'feedbackNumber',
        label: 'Feedback Number'
    }, {
        key: 'sampleAction',
        label: 'Request Sample',
        sortable: false,
        filterable: false
    }, {
        key: 'deviceCustomerNumber',
        label: 'Sold-To Number'
    }, {
        key: 'deviceCustomerName',
        label: 'Sold-To Name',
    }, {
        key: 'deviceWwidName',
        label: 'WW Customer Name',
    }, {
        key: 'deviceCategory',
        label: 'Customer Category'
    }, {
        key: 'partOrderableMaterial',
        label: 'Orderable Material'
    }, {
        key: 'deviceCustomerPartNumber',
        label: 'Customer Part Number'
    }, {
        key: 'partIndustrySector',
        label: 'Industry Sector'
    }, {
        key: 'partSbe',
        label: 'SBE'
    }, {
        key: 'partSbe1',
        label: 'SBE-1'
    }, {
        key: 'sampleNumber',
        label: 'SRF#'
    }, {
        key: 'sampleLastDate',
        label: 'Last Date for Samples'
    }, {
        key: 'feedbackSubmitter',
        label: 'Feedback Submitter'
    }, {
        key: 'deviceWwidNumber',
        label: 'WW Customer Number'
    }, {
        key: 'deviceEndCustomerName',
        label: 'End Customer Name'
    }, {
        key: 'deviceEndCustomerNumber',
        label: 'End Customer Number'
    }, {
        key: 'updaterFullname',
        label: 'Approval Status Updated By'
    }, {
        key: 'deviceDateUpdated',
        label: 'Approval Status Update Date'
    }, {
        key: 'deviceApprovalStatusComment',
        label: 'Approval Status Comment'
    }, {
        key: 'feedbackResponse',
        label: 'Feedback Response'
    }, {
        key: 'feedbackState',
        label: 'Feedback Status'
    }, {
        key: 'sampleStatus',
        label: 'Sample Status'
    }, {
        key: 'sampleQuantity',
        label: 'Sample Request Quantity'
    }, {
        key: 'sampleDateRequested',
        label: 'Sample Request Date'
    }, {
        key: 'sampleShipped',
        label: 'Sample Ship'
    }, {
        key: 'sampleDateEstimatedShip',
        label: 'Estimated Sample Ship Date'
    }, {
        key: 'sampleDateShip',
        label: 'Actual Sample Ship Date'
    }, {
        key: 'sampleShipGroup',
        label: 'Sample Ship Group'
    }, {
        key: 'pcnLastUpdatedDate',
        label: 'PCN Revision Date'
        // }, {
        //     key: 'pcnExpirationDate',
        //     label: 'PCN Expiration Date'
        // }, {
        //     key: 'revisionRevision',
        //     label: 'PCN Revision Number'
    }, {
        key: 'pcnPcnOwner',
        label: 'PCN Owner'
    }, {
        key: 'pcnPcnType',
        label: 'PCN Type'
    }, {
        key: 'qdbStatus',
        label: 'Implementation Gating eQDB#'
    }, {
        key: 'deviceApprovalToImplement',
        label: 'Approval to Implement'
    }, {
        key: 'deviceRegion',
        label: 'Region'
    }, {
        key: 'changedOrderableMaterial',
        label: 'Changed Part Number'
    }, {
        key: 'partPscaDeviceIndicator',
        label: 'PSCA Device Indicator'
    }, {
        key: 'partPlanner',
        label: 'Material Planner Name'
    }, {
        key: 'partOrderFulfill',
        label: 'Part Order Fulfill'
    }, {
        key: 'cmsSource',
        label: 'Date Source'
    }, {
        key: 'partPimMatl',
        label: 'PIM Flag'
    }, {
        key: 'cmsNumber',
        label: 'Change Number'
    }, {
        key: 'cmsOwner',
        label: 'Change Owner'
    }, {
        key: 'deviceHold',
        label: 'Device Hold Reasons'
    }
    // , {
    //     key: 'notificationPeriod',
    //     label: 'Notification Period'
    // }
]
let hiddenColumns = [
    'pcnId',
    'deviceWwidNumber',
    'deviceEndCustomerName',
    'deviceEndCustomerNumber',
    'updaterFullname',
    'deviceDateUpdated',
    'deviceApprovalStatusComment',
    'sampleStatus',
    'sampleQuantity',
    'sampleDateRequested',
    'sampleShipped',
    'sampleDateEstimatedShip',
    'sampleDateShip',
    'sampleShipGroup',
    'pcnLastUpdatedDate',
    // 'pcnExpirationDate',
    'revisionRevision',
    'pcnPcnOwner',
    'pcnPcnType',
    'qdbStatus',
    'deviceApprovalToImplement',
    // 'deviceRegion',
    'changedOrderableMaterial',
    'partId',
    'partPscaDeviceIndicator',
    'partPlanner',
    'partOrderFulfill',
    'cmsSource',
    'partPimMatl',
    // 'cmsNumber',
    'cmsOwner',
    'sampleEligible',
    'maxRequestEligibility',
    'requestWindowEligibility',
    'lateSampleEligibility',
    'revisionDateNotification',
    // 'notificationPeriod',
    'overallSampleEligibility',
    'sampleLastDate'
]

class ApprovalMatrix extends React.Component {

    static defaultProps = {
        filterByChange: false,
        filterByPCN: false,
        hasActions: false,
        alertVisibility: false,
        selectedWwCustomer: undefined,
        hasSelectedAutomotive: undefined
    }

    constructor(props) {
        super(props)
        this.state = {
            selectedCount: 0,
            isLoading: true,
            hasFilter: this.props.filterByChange || this.props.filterByPCN
        }
        this.table = null;

        this.selectAll = this.selectAll.bind(this);
        this.unselectAll = this.unselectAll.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
        this.resetCount = this.resetCount.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.toggleMessage = this.toggleMessage.bind(this);
        this.showMessage = this.showMessage.bind(this);
    }

    componentDidMount() {
        if (this.props.hasActions)
            this.resetCount();
        else
            this.setState({ isLoading: false })

        FetchUtilities.fetchGet('/api/v1/sampleRequest/getFullEligibilityConditions/', 
            (httpStatus, response) => {
                this.setState({
                    fullConditions: response
                });
        })

        FetchUtilities.fetchGet('/api/v1/sampleRequest/getEligibilityConditions/', 
            (httpStatus, response) => {
                this.setState({
                    eligibilityConditions: response
                });
        })
    }

    selectAll() {
      showOverlaySpinner()
      let URL = `${BASE_URL}`
      URL = this.props.filterByChange ? `${BASE_URL}change/${this.props.changeNumber}/${this.state.transaction}` : URL
      URL = this.props.filterByPCN ? `${BASE_URL}pcn/${this.props.pcnNumber}/${this.state.transaction}` : URL
      FetchUtilities.fetchGet(`${URL}/selectall?`+this.table.generateUrlQuery(), 
        (httpStatus, response) => {
          if (response.message !== undefined) {
              this.showMessage('warning', response.message)
          } else {
              this.setState({ selectedCount: response['DEVICES'].length }) 
              this.updateSelection(response['DEVICES'], response['PARTINDUSTRYSECTOR'], response['DEVICEWWIDNAME'])
          }
          hideOverlaySpinner()
      }, _=> hideOverlaySpinner() )
    }

    unselectAll() {
      showOverlaySpinner()
      let URL = `${BASE_URL}`
      URL = this.props.filterByChange ? `${BASE_URL}change/${this.props.changeNumber}/${this.state.transaction}` : URL
      URL = this.props.filterByPCN ? `${BASE_URL}pcn/${this.props.pcnNumber}/${this.state.transaction}` : URL
      FetchUtilities.fetchGet(`${URL}/unselectall?`+this.table.generateUrlQuery(), 
        (httpStatus, response) => {
          if (response.message !== undefined) {
              this.showMessage('warning', response.message)
          } else {
              this.setState({ selectedCount: response.length }) 
              this.updateSelection(response, undefined, undefined)
          }
          hideOverlaySpinner()
      }, _=> hideOverlaySpinner() )
    }

    updateSelection(selectedDevices, isAutomotive, wwCustomer) {
        var selectionList = []
        if (selectedDevices !== undefined && selectedDevices !== null && selectedDevices !== []) {
            for (let i in selectedDevices) {
                selectionList.push(Number(selectedDevices[i]))
            }
        } else {
            selectionList = []
            isAutomotive = undefined
            wwCustomer = undefined
        }

        // Update the stored values
        sessionStorage.setItem(localStorageSelectionList, JSON.stringify(Array.from(new Set(selectionList)))); // Remove any duplicates
        this.setState({
            hasSelectedAutomotive: isAutomotive === true || isAutomotive === 'TRUE' || isAutomotive === 'true',
            selectedWwCustomer: wwCustomer,
            selectedCount: selectionList.length
        })
        
        // Refresh the table
        this.refreshTable()
    }

    updateCount(id, state, isAutomotive, wwCustomer) {
        if (state) {
            this.setState({
                hasSelectedAutomotive: isAutomotive,
                selectedWwCustomer: wwCustomer,
                selectedCount: this.state.selectedCount + 1
            })
        } else {
            if (this.state.selectedCount - 1 < 1)
                this.setState({
                    hasSelectedAutomotive: undefined,
                    selectedWwCustomer: undefined,
                    selectedCount: this.state.selectedCount - 1
                })
            else
                this.setState({
                    hasSelectedAutomotive: isAutomotive,
                    selectedCount: this.state.selectedCount - 1
                })
        }
    }

    resetCount() {
        // Clear the contents of selected items stored in session storage
        sessionStorage.setItem(localStorageSelectionList, JSON.stringify([]));
        this.setState({ selectedCount: 0, hasSelectedAutomotive: undefined, selectedWwCustomer: undefined })

        // Start a new transaction for checkboxes
        if (this.props.hasActions)
            fetch(CHK_INIT_URL, { credentials: 'include', headers: headers })
                .then((response) => { return response.json(); })
                .then((json) => { this.setState({ transaction: json, isLoading: false }); })
                .catch((ex) => { throw ex; })
    }

    refreshTable() {
        this.table.refresh();
    }

    toggleMessage() {
        this.setState({ alertVisibility: !this.state.alertVisibility })
    }

    showMessage(type, message) {
        this.setState({ alertVisibility: true, alertType: type, alertMessage: message })
    }

    render() {  
        if (!this.state.isLoading) {
            const { ...other } = this.props;

            // Remove the actions columns
            if (!this.props.hasActions) {
                delete columns[0] //columns.indexOf[(COLUMN_ID)]
                delete columns[2] //columns.indexOf[(COLUMN_SAMPLE_ID)]
            }

            // Check if the user has override access to feedback buttons
            let hasOverride = !!this.props.userAccess && (this.props.userAccess.includes('Change Coordinator') || this.props.userAccess.includes('PCN Coordinator') || this.props.userAccess.includes('PCN Admin') || this.props.userAccess.includes('ChangeLink Admin'))

            let URL = `${BASE_URL}`
            URL = this.props.filterByChange ? `${BASE_URL}/change/${this.props.changeNumber}/${this.state.transaction}` : URL
            URL = this.props.filterByPCN ? `${BASE_URL}/pcn/${this.props.pcnNumber}/${this.state.transaction}` : URL
            let customBar = (
                this.props.hasActions
                    ? (<div className="p-2 clearfix">
                        <CheckAllWidget selectedCount={this.state.selectedCount}
                                        selectAllCallback={this.selectAll} unselectAllCallback={this.unselectAll} />
                        <ApprovalMatrixAtaGlanceBar {...other} />
                    </div>)
                    : undefined
            );

            let MyApprovalMatrixRow = (props) => {     
                return <ApprovalMatrixRow {...props}
                    transaction={this.state.transaction}
                    chkboxCallback={this.updateCount.bind(this)}
                    hasSelectedAutomotive={this.state.hasSelectedAutomotive}
                    wwCustomer={this.state.selectedWwCustomer}
                    showMessage={this.showMessage}
                    hasOverride={hasOverride}
                    fullConditions={this.state.fullConditions}
                    eligibilityConditions={this.state.eligibilityConditions} />
            }
            return (
                <div>
                    <div>
                        {
                            this.props.hasActions
                                ? (
                                    <div className="p-2 clearfix">
                                        <ApprovalMatrixButtonBar {...other} refreshTable={() => { this.resetCount(); this.refreshTable(); }} />
                                    </div>
                                ) : undefined
                        }
                    </div>
                    <ReactiveTableStore credentials={'include'} server tableId="pcn_approval_matrix">
                        <ReactiveTable
                            server striped columnFilters advancedColumns
                            credentials={'include'}
                            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                            fetchErrorHandler={FetchUtilities.handleError}
                            row={MyApprovalMatrixRow}
                            columns={columns} hiddenColumns={hiddenColumns}
                            url={URL} ref={(table) => this.table = table}
                            customTopBar={!!customBar ? customBar : undefined}
                            mirrorCustomTopBar
                        />
                    </ReactiveTableStore>
                    {
                        this.state.alertVisibility
                            ? <InfoModal
                                show={this.state.alertVisibility}
                                icon={this.state.alertType === 'warning' ? 'exclamation-circle' : 'info-circle'}
                                color={this.state.alertType}
                                title="Warning"
                                message={this.state.alertMessage}
                                handleClose={this.toggleMessage}
                            />
                            : undefined
                    }
                </div>
            )
        } else {
            return (<div></div>)
        }
    }

}

class CheckAllWidget extends React.Component {

    constructor(props) {
        super(props)
        this.state = { selectedCount: 0 }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ selectedCount: nextProps.selectedCount })
    }

    render() {
        return (
            <div className="approval-matrix-button-bar float-left">
                <ButtonGroup>
                    <Button color='secondary' size='sm' outline onClick={this.props.selectAllCallback}><FontAwesome name='check-square' />{' '}Select all</Button>
                    <Button color='secondary' size='sm' outline onClick={this.props.unselectAllCallback}><FontAwesome name='square-o' />{' '}Unselect all</Button>
                </ButtonGroup>
                {' '}
                {!this.state.selectedCount || this.state.selectedCount === 0 ? 'None' : this.state.selectedCount} selected
            </div>
        )
    }
}

class ApprovalMatrixAtaGlanceBar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            count: {
                hold: '',
                approved: '',
                na: '',
                rejected: '',
                error: '',
                total: ''
            }
        }
    }

    componentDidMount() {
        let URL = `${BASE_URL}`
        URL = !!this.props.changeNumber ? `${BASE_URL}change/glance/${this.props.changeNumber}` : URL
        URL = !!this.props.pcnNumber ? `${BASE_URL}pcn/glance/${this.props.pcnNumber}` : URL

        // Fetch the latest set of data
        fetch(URL, { credentials: 'include', headers: headers })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => { return response.json() })
            .then((json) => { this.setState({ count: json }) })
            .catch((ex) => { throw ex });
    }

    render() {

        return (
            <div className="approval-matrix-glance-bar float-right">
                <InputGroup size="sm">
                    <InputGroupAddon addonType="prepend">
                        <InputGroupText className="alert-dark"><b>Total:</b>&nbsp; {this.state.count.total}</InputGroupText>
                        <InputGroupText className="alert-warning"><b>Hold:</b>&nbsp; {this.state.count.hold}</InputGroupText> {/* TODO: In Phase 2, rename this to Open and change the color to primary */}
                        <InputGroupText className="alert-success"><b>Approved:</b>&nbsp; {this.state.count.approved}</InputGroupText>
                        <InputGroupText className="alert-danger"><b>Rejected:</b>&nbsp; {this.state.count.rejected}</InputGroupText>
                        <InputGroupText className="alert-success"><b>N/A:</b>&nbsp; {this.state.count.na}</InputGroupText>
                        <InputGroupText className="alert-secondary" style={{ borderTopRightRadius: '.2rem', borderBottomRightRadius: '.2rem' }}><b>Error:</b>&nbsp; {this.state.count.error}</InputGroupText>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        )
    }
}

class ApprovalMatrixButtonBar extends React.Component {

    state = {
        state: '',
        selection: [],
        formVisible: false,
        spinnerVisible: false,
        alertType: undefined,
        alertMessage: undefined
    }

    prepareFeedbackForm = (status) => {
        var selectionList = [];
        // Fetch values stored in session storage
        var rawList = sessionStorage.getItem(localStorageSelectionList);
        if (rawList !== undefined && rawList !== null) {
            selectionList = JSON.parse(rawList);
        }

        if (selectionList.length > 0) {
            this.setState({
                status: status,
                selection: selectionList
            });
            this.toggleSpinner();
            this.toggleForm();
        } else {
            this.setState({
                alertType: 'warning',
                alertMessage: 'Select records first before clicking an action button.'
            });
        }
    }

    handleApprove = () => {
        this.prepareFeedbackForm('Approved');
    }

    handleReject = () => {
        this.prepareFeedbackForm('Rejected');
    }

    handleNA = () => {
        this.prepareFeedbackForm('Not Applicable');
    }

    handleDataRequest = () => {
        this.prepareFeedbackForm('Data Request');
    }

    handleDisposition = () => {
        this.prepareFeedbackForm('Dispositioned');
    }

    handleInquiry = () => {
        this.prepareFeedbackForm('Inquiry');
    }

    handleFormSubmit = () => {
        this.setState({
            formVisible: false,
            spinnerVisible: false
        });
        this.props.refreshTable();
    }

    toggleForm = () => {
        this.setState({
            formVisible: !this.state.formVisible
        });
    }

    toggleSpinner = () => {
        this.setState({
            spinnerVisible: !this.state.spinnerVisible
        });
    }

    closeAlertModal = () => {
        this.setState({
            alertType: undefined
        });
    }

    render() {
        let { ...other } = this.props;

        let color = 'success';
        color = this.state.status === 'Rejected' ? 'danger' : color;
        color = this.state.status === 'Data Request' ? 'warning' : color;
        return (
            <div className="approval-matrix-button-bar float-left">
                <Button className="mr-1 mb-1" size="sm" color="primary" onClick={this.handleApprove}><FontAwesome name="check" /> Approve</Button>
                <Button className="mr-1 mb-1" size="sm" color="primary" onClick={this.handleNA}><FontAwesome name="check" /> N/A</Button>
                <Button className="mr-1 mb-1" size="sm" color="primary" onClick={this.handleReject}><FontAwesome name="times" /> Reject</Button>
                <Button className="mr-1 mb-1" size="sm" color="primary" onClick={this.handleDataRequest}><FontAwesome name="question" /> Data Request</Button>
                {
                    // Inquiry button only available for PCN Coordinators, and above only
                    !!this.props.userAccess && (this.props.userAccess.includes('PCN Coordinator') || this.props.userAccess.includes('PCN Admin') || this.props.userAccess.includes('ChangeLink Admin') || this.props.userAccess.includes('System Admin'))
                        ? <Button className="mr-1 mb-1" size="sm" color="primary" onClick={this.handleInquiry}><FontAwesome name="question" /> Inquiry</Button>
                        : undefined
                }
                {
                    // Hide the Disposition button for now
                    !!this.props.userAccess && (this.props.userAccess.includes('Change Coordinator') || this.props.userAccess.includes('PCN Admin') || this.props.userAccess.includes('ChangeLink Admin') || this.props.userAccess.includes('System Admin')) && false
                        ? <Button className="mr-1 mb-1" size="sm" color="primary" onClick={this.handleDisposition}><FontAwesome name="check" /> Disposition</Button>
                        : undefined
                }

                {/* Modal wrapping ApprovalMatrixFeedbackForm component */}
                {
                    this.state.formVisible ? (
                        <Modal
                            isOpen={this.state.formVisible}
                            toggle={this.toggleForm}
                            fade backdrop size="lg">
                            <ModalHeader toggle={this.toggleForm} className={`bg-${color}`}>
                                Enter Customer <strong>{this.state.status}</strong> Feedback
                            </ModalHeader>
                            <ModalBody>
                                <ApprovalMatrixFeedbackForm {...other}
                                    status={this.state.status}
                                    selection={this.state.selection}
                                    onCancel={this.toggleForm}
                                    onSubmit={this.handleFormSubmit}
                                    toggleSpinner={this.toggleSpinner} />
                            </ModalBody>
                        </Modal>
                    ) : undefined
                }

                <Spinner showSpinner={this.state.spinnerVisible} />

                <InfoModal
                    show={this.state.alertType === 'warning'}
                    icon="exclamation-circle"
                    color="warning"
                    title="Invalid Input"
                    message={this.state.alertMessage}
                    handleClose={this.closeAlertModal}
                />

            </div>
        )
    }
}

class ApprovalMatrixRow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            pcnIneligibleModal: false,
            sampleEligibleModal: false,
            fullConditions: this.props.fullConditions,
            eligibilityConditions: this.props.eligibilityConditions
        }
        // Bind methods
        this.updateSelection = this.updateSelection.bind(this);
        this.togglePcnForm = this.togglePcnForm.bind(this);
        this.toggleSampleForm = this.toggleSampleForm.bind(this);
    }

    togglePcnForm(row) {
        this.setState({
            pcnIneligibleModal: !this.state.pcnIneligibleModal
        })
    }

    toggleSampleForm(row) {
        this.setState({
            sampleEligibleModal: !this.state.sampleEligibleModal
        })
    }

    updateSelection(state, id) {
        let isAutomotive = this.props.data['partIndustrySector'] === 'AUTOMOTIVE'
        let wwCustomer = this.props.data['deviceWwidName']

        if ((this.props.hasSelectedAutomotive === undefined || this.props.hasSelectedAutomotive === isAutomotive)
            && (this.props.wwCustomer === undefined || this.props.wwCustomer === wwCustomer)) {
            // Fetch the current list in session storage
            var selectionList = [];
            var rawList = sessionStorage.getItem(localStorageSelectionList);
            if (rawList !== undefined && rawList !== null) {
                selectionList = JSON.parse(rawList);
            }

            if (state)
                selectionList.push(id);
            else
                removeFromArray(selectionList, id);
            // Update the value in session storage
            sessionStorage.setItem(localStorageSelectionList, JSON.stringify(selectionList));

            // Update the selection list stored in the backend
            fetch(`${CHK_URL}?ctx=CHG_APPMTX&tid=${this.props.transaction}&eid=${id}&chk=${state}`,
                { method: 'POST', credentials: 'include', headers: headers })
                .then((response) => {
                    this.props.chkboxCallback(id, state, isAutomotive, wwCustomer)
                })
                .catch((ex) => { throw ex });
        } else if (this.props.hasSelectedAutomotive !== isAutomotive) {
            this.props.showMessage('warning', 'Cannot create feedback with both automotive and none-automotive devices.')
        } else if (this.props.wwCustomer !== wwCustomer) {
            this.props.showMessage('warning', 'Cannot create feedback for devices under different WW Customers. Please continue to only select devices under ' + this.props.wwCustomer + '.')
        }
    }

    checkLateSample() {
        fetch('/api/v1/sampleRequest/checkLateSample' +  
        "?cmsNumber=" + this.props.data.cmsNumber +  
        "&pcnNumber=" + this.props.data.pcnNumber + 
        "&deviceCustomerName=" + encodeURIComponent(this.props.data.deviceCustomerName) +  
        "&deviceCustomerNumber=" + this.props.data.deviceCustomerNumber +
        "&orderableMaterial=" + this.props.data.partOrderableMaterial, {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({ lateSampleDate: json}))
            .catch(error => FetchUtilities.handleError(error))  
    }

    checkMaxNumRequest() {
        fetch('/api/v1/sampleRequest/checkMaxNumRequest/' + 
        "?pcnId=" + this.props.data.pcnId +
        "&deviceId=" + this.props.data.deviceId + 
        "&deviceCustomerName=" + encodeURIComponent(this.props.data.deviceCustomerName) +  
        "&deviceCustomerNumber=" + this.props.data.deviceCustomerNumber + 
        "&partId=" + this.props.data.partId, {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({ maxReq: json}))
            .catch(error => FetchUtilities.handleError(error))  
    }

    checkRequestWindow() {
        fetch('/api/v1/sampleRequest/checkRequestWindow/' + 
        "?deviceCustomerName=" + encodeURIComponent(this.props.data.deviceCustomerName) +  
        "&deviceCustomerNumber=" + this.props.data.deviceCustomerNumber + 
        "&partIndustrySector=" + this.props.data.partIndustrySector, {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({ reqWindow: json}))
            .catch(error => FetchUtilities.handleError(error)) 
    }

    capitalize(str){
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    toggleSubmitSample = (deviceId) => {
        this.setState({
            sampleForm: `/sample/submit/${deviceId}`
        })
    }
    

    render() {
        const { sampleForm } = this.state;
        if(sampleForm) return <Redirect to={{ pathname: `/sample/submit/${this.props.data.deviceId}`}} />

        const statusColors = {
            'NOT APPLICABLE': 'success',
            'APPROVED': 'success',
            'NOT APPROVED': 'danger',
            'REJECTED': 'danger',
            'HOLD': 'warning',
            'DATA REQUEST': 'primary',
            'ERROR': 'secondary'
        }

        const notifPeriodIneligible = 'Informational';
        let changeTypeIneligible = this.state.fullConditions.includes(this.props.data.pcnChangeType);
        let revisionTypeIneligible = this.state.fullConditions.includes(this.props.data.revisionType);
        const conditions = this.state.eligibilityConditions.map((condition) => {
            return <li>{condition}</li>
        });

        // Fetch the current list in session storage
        var selectionList = [];
        var rawList = sessionStorage.getItem(localStorageSelectionList);
        if (rawList !== undefined && rawList !== null) {
            selectionList = JSON.parse(rawList);
        }

        const record = this.props.data
        const pcnIneligible = [
            {'icon' : 'minus-circle', 'title': 'Cannot create a sample', 'callback': () => this.togglePcnForm(record)}
        ]
        const sampleIneligible = [
            {'icon' : 'minus-circle', 'title': 'Cannot create a sample', 'callback': () => { (() => {this.toggleSampleForm(record)})(); (() => {this.checkLateSample()})(); (() => {this.checkMaxNumRequest()})(); (() => {this.checkRequestWindow()})()}}
        ]

        const submitSampleRequest = [
            {'icon' : 'plus', 'title': 'Cannot create a sample', 'callback': () => this.toggleSubmitSample(record.deviceId)}
        ]

        const cells = this.props.columns.map((column, row) => {
            const key = `appmtx-column-${column.key}-${row}`;
            const sample_uri = "/sample/";
            const feedback_uri = "/feedback/";
            const eqdb_uri = `/change/${record[COLUMN_CMS]}/quals/`;

            let isChecked = selectionList.includes(record[COLUMN_ID])  // Check if the checkbox is already marked as checked
            // Do not allow updating records that are already Complete, unless the user has Change Coordinator role
            let isDisabled = record[COLUMN_STATUS] === 'APPROVED' || record[COLUMN_STATUS] === 'NOT APPLICABLE' || record[COLUMN_STATUS] === 'REJECTED'

            if (column.key === COLUMN_ID) {
                return <GridCheckboxCell key={key} id={record[COLUMN_ID]} callback={this.updateSelection} checked={isChecked} disabled={isDisabled && !this.props.hasOverride} />
            } else if (column.key === COLUMN_STATUS) {
                return <GridBadgeCell key={key} data={record[column.key]} colorMapping={statusColors} />
            } else if (column.key === COLUMN_SAMPLE) {
                if (record[COLUMN_SAMPLE] !== null) {
                    let sampleArray = record[COLUMN_SAMPLE].split(', ')
                    let sampleAttachCountArray = record[COLUMN_SAMPLE_ATTACHMENT].split(',')
                    return (
                        <td key={key}>
                            {
                                sampleArray.map((sample, i) => {
                                    let elems = [] 
                                    let newTo = { pathname:sample_uri + sample,
                                                    search:'?ref=PCN'}
                                    if(sampleAttachCountArray[i] > 0){
                                        elems.push(<span style={{ whiteSpace: 'nowrap' }}><Link to={newTo}>{sample}</Link><FontAwesome name='paperclip' /></span>)
                                    }else{
                                        elems.push(<Link to={newTo}>{sample}</Link>)                                    
                                    }
                                    elems.push(i < sampleArray.length - 1 ? <span>{', '}</span> : undefined)
                                    return (elems)
                                })
                            }
                        </td>
                    )
                } else {
                    return <GridTextCell key={key}></GridTextCell>
                }
            } else if (column.key === COLUMN_FEEDBACK) {
                if (record[COLUMN_FEEDBACK] !== null) {
                    let feedbackArray = record[COLUMN_FEEDBACK].split(', ')
                    let feedbackAttachmentArray = record[COLUMN_FEEDBACK_ATTACHMENT].split(', ')
                    return (
                        <td key={key}>
                            {
                                feedbackArray.map((feedback, i) => {
                                    let elems = []
                                    if (feedbackAttachmentArray[i] > 0) {
                                        elems.push(<span style={{ whiteSpace: 'nowrap' }}><Link to={`${feedback_uri}${feedback}`}>{feedback}</Link><FontAwesome name='paperclip' /></span>)
                                    } else {
                                        elems.push(<Link to={`${feedback_uri}${feedback}`}>{feedback}</Link>)
                                    }
                                    elems.push(i < feedbackArray.length - 1 ? <span>{', '}</span> : undefined)
                                    return elems
                                })
                            }
                        </td>
                    )
                } else {
                    return <GridTextCell key={key}></GridTextCell>
                }
            } else if (column.key === COLUMN_EQDB) {
                if (!!record[column.key] && record[column.key] !== '') {
                    return <GridLinkCell key={key} url={eqdb_uri} button>{record[column.key]}</GridLinkCell>
                } else {
                    return <GridTextCell key={key}></GridTextCell>
                }
            } else if (column.key === COLUMN_SAMPLE_ACTION) {
                if(this.props.data.sampleEligible === 'NO') {
                    return <GridActionCell key={key} buttons={pcnIneligible} />                 
                } else if(this.props.data.overallSampleEligibility === 'NO') {
                        return <GridActionCell key={key} buttons={sampleIneligible}/> 
                } else {
                    return <GridActionCell className="buttons-nowrap" key={key} buttons={submitSampleRequest}/>
                }
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })

        return (
            <tr>{cells}
            <td style={{ display: 'none' }}>
            {this.state.pcnIneligibleModal ? (
                <ComponentModal 
                    show={this.state.pcnIneligibleModal}
                    handleClose={() => this.togglePcnForm(undefined)}
                    color="danger"
                    title="Cannot Create a Sample Request"
                    buttons={[{ color: 'secondary', outline: true, label: 'Close', onClick: this.togglePcnForm }]}>
                    <p>The device is not eligible for a sample request due to the following conditions: </p>
                    <ul>
                        {this.props.data.notificationPeriod === notifPeriodIneligible ? (
                            <li> Notification Period: {this.props.data.notificationPeriod}</li>
                        ) : undefined}
                        {changeTypeIneligible === true ? (
                                <li> Change Type: {this.capitalize(this.props.data.pcnChangeType)} </li>
                            ): undefined
                        }
                        {revisionTypeIneligible === true ? (
                                <li> Revision Type: {this.capitalize(this.props.data.revisionType)} </li>
                            ) : undefined
                        }
                    </ul> 
                    <p> A device is considered ineligible if one of the following conditions are true:
                    Notification Period = {notifPeriodIneligible} and/or <br/>
                    Change Type or Revision Type is one of the following: 
                    <ul>{conditions}</ul>
                    </p>
                    <p> If you believe this to be in error, please contact {pcnSamplesTeam}. </p>
                </ComponentModal>                           
            ) : undefined}
            {this.state.sampleEligibleModal ? (
                <ComponentModal 
                    show={this.state.sampleEligibleModal}
                    handleClose={() => this.toggleSampleForm(undefined)}
                    color="danger"
                    title="Cannot Create a Sample Request"
                    buttons={[{ color: 'secondary', outline: true, label: 'Close', onClick: this.toggleSampleForm }]}>
                    {this.props.data.requestWindowEligibility === 'NO' && this.props.data.maxRequestEligibility === 'NO' && this.props.data.lateSampleEligibility === 'NO' ? (
                        <p> This device is not eligible for a sample request due to the following reasons: 
                            <ul>
                                <li> It has exceeded the number of maximum requests. The maximum number of request for this device is {this.state.maxReq}.</li>
                                <li> It is no longer in the period of time (request window) that sample requests are allowed to be submitted. The request window of this device is {this.state.reqWindow} day/s from the last notification date ({this.props.data.revisionDateNotification}).</li>
                                <li> Late samples cannot be submitted for this device. </li>
                            </ul>
                        </p>
                    ) : (
                        undefined
                    )}
                    {this.props.data.maxRequestEligibility === 'YES' && this.props.data.lateSampleEligibility === 'NO' && this.props.data.requestWindowEligibility === 'NO' ? (
                        <p> This device is not eligible for a sample request due to the following reasons:
                            <ul> 
                                <li> Late samples cannot be submitted for this device. </li>
                                <li> It is no longer in the period of time (request window) that sample requests are allowed to be submitted. The request window of this device is {this.state.reqWindow} day/s from the last notification date ({this.props.data.revisionDateNotification}).</li>
                            </ul>
                        </p>
                    ): (
                        undefined
                    )}
                    {this.props.data.maxRequestEligibility === 'NO' && this.props.data.lateSampleEligibility === 'NO' && this.props.data.requestWindowEligibility === 'YES' ? (
                        <p> This device is not eligible for a sample request due to the following reasons:
                            <ul> 
                                <li> It has exceeded the number of maximum requests. The maximum number of request for this device is {this.state.maxReq}.</li>
                                <li> Late samples cannot be submitted for this device. </li>
                            </ul> 
                        </p>
                    ) : (
                        undefined
                    )}
                    {this.props.data.maxRequestEligibility === 'NO' && this.props.data.lateSampleEligibility === 'YES' && this.props.data.requestWindowEligibility === 'YES' ? (
                        <p> This device is not eligible for a sample request since it has exceeded the number of maximum requests. The maximum number of request for this device is {this.state.maxReq}. </p>
                    ) : (
                        undefined
                    )}
                    {this.props.data.maxRequestEligibility === 'NO' && this.props.data.lateSampleEligibility === 'YES' && this.props.data.requestWindowEligibility === 'NO' ? (
                        <p> This device is not eligible for a sample request due to the following reasons:
                            <ul> 
                                <li> It has exceeded the number of maximum requests. The maximum number of request for this device is {this.state.maxReq}.</li> 
                                <li> It is no longer in the period of time (request window) that sample requests are allowed to be submitted. The request window of this device is {this.state.reqWindow} day/s from the last notification date ({this.props.data.revisionDateNotification}).</li>
                            </ul>
                        </p>
                    ) : (
                        undefined 
                    )}

                   <p> If you believe this to be in error, please contact {pcnSamplesTeam}. </p>
                </ComponentModal>                           
            ) : undefined}
            
            
            </td></tr>
            
        )
    }
}

export default ApprovalMatrix;
