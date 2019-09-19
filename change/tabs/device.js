import React, {Component} from 'react'
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables'
import "css/approval-matrix-button-bar.css";
import FetchUtilities from 'js/universal/FetchUtilities';
import { GridTextCell, GridCheckboxCell } from 'js/universal/GridCells';
import { Form, FormGroup, Label, Row, Col, Input, Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip, FormFeedback} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import { BigBadge } from 'js/app/models/ChangelinkUI'
import { removeFromArray } from 'js/universal/commons';
import Spinner, { showOverlaySpinner, hideOverlaySpinner, } from 'js/universal/spinner'
import {FormWidgetTextArea, FormWidgetSelect} from 'js/universal/FormFieldWidgets';
import AddDevice from 'js/app/views/change/cms-device/AddDevice'
import DeviceHistory from 'js/app/views/change/cms-device/DeviceHistory'
import DeleteDevice from 'js/app/views/change/cms-device/DeleteDevice'
import AddDeviceByChipName from 'js/app/views/change/cms-device/AddDeviceByChipName'
import UploadDeviceEdits from 'js/app/views/change/cms-device/UploadDeviceEdits'
import Validator from 'validatorjs';

const URL = "/api/v1/devices/";
const HOLD_URL = "/api/v1/hold-devices";
const CHK_INIT_URL = "/api/chk/init/";
const CHK_URL = "/api/chk/toggle/";
const localStorageSelectionList = 'checkedDeviceData';
const ADMIN_ROLES = ['Change Coordinator','Safety Coordinator','ChangeLink Admin'];


// Set up the default headers to disable browser cache fetches
var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

class DeviceTab extends React.Component {
    constructor(props){
        super(props);
        this.state={
            columns: [
                {
                    key: 'action',
                    label: ''
                },
                {
                    key: 'holdStatus',
                    label: 'Safety Hold Status'
                },
                {
                    key: 'material',
                    label: 'Orderable Material'
                }, {
                    key: "oldMaterial",
                    label: "Old Material"
                }, {
                    key: "longPartNumber",
                    label: "Long Part Number"
                }, {
                    key: "chipName",
                    label: "Chipname"
                }, {
                    key: "niche",
                    label: "Niche"
                },{
                    key: "notificationPeriod",
                    label: "Notification Period"
                }, {
                    key: "deviceStatus",
                    label: "Status"
                }, {
                    key: "characteristics",
                    label: "Characteristics"
                }, {
                    key: "sbe",
                    label: "SBE"
                }, {
                    key: "sbe1",
                    label: "SBE-1"
                }, {
                    key: "sbe2",
                    label: "SBE-2"
                }, {
                    key: "ctech",
                    label: "CTECH"
                }, {
                    key: "prtech",
                    label: "PRTECH"
                }, {
                    key: "pin",
                    label: "Pin"
                }, {
                    key: "pkg",
                    label: "Pkg"
                }, {
                    key: "packVariant",
                    label: "Pack Variant"
                }, {
                    key: "xChain",
                    label: "X-Chain"
                }, {
                    key: "introductionDate",
                    label: "Introduction Date"
                }, {
                    key: "apnFlag",
                    label: "APN Flag"
                }, {
                    key: "industrySector",
                    label: "Industry Sector"
                }, {
                    key: "relClass",
                    label: "Rel Class"
                }, {
                    key: "mcmFlag",
                    label: "MCM"
                }, {
                    key: "ytgParent",
                    label: "YTG Parent"
                }, {
                    key: "autoPricingIndicator",
                    label: "Auto Pricing Indicator"
                }, {
                    key: "safetyCritical",
                    label: "Safety Critical"
                }, {
                    key: "location",
                    label: "Location"
                }, {
                    key: "locationType",
                    label: "Location Type"
                }, {
                    key: "oprType",
                    label: "OPR Type"
                }, {
                    key: "profitCtrName",
                    label: "Profit Center Name"
                }, {
                    key: "enteredBy",
                    label: "Entered By"
                }, {
                    key: "asOfDate",
                    label: "As of Date"
                }
            ],
            data: [],
            modalVisible: undefined,
            type: 'No',
            changeNumber: this.props.changeNumber,
            selectedCount: 0,
            isLoading: true,
            transaction: 0,
            showSpinner: false,
            canUpdate: props.hasRole(ADMIN_ROLES),
            deviceNotif: false
        }

        this.table = null;
        this.toggleModal = this.toggleModal.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.tableRefresh = this.tableRefresh.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.unselectAll = this.unselectAll.bind(this);
        this.resetCount = this.resetCount.bind(this);
        this.updateCount = this.updateCount.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
    }
    
    componentDidMount(){
        sessionStorage.setItem(localStorageSelectionList, JSON.stringify([]));
        this.setState({ selectedCount: 0});
        if(this.state.canUpdate){
        // Start a new transaction for checkboxes
            fetch(CHK_INIT_URL, { credentials: 'include', headers: headers })
                .then((response) => { return response.json(); })
                .then((json) => { this.setState({ transaction: json, isLoading: false }); })
                .catch((ex) => { throw ex; });
        }
    }

    componentWillMount(){
        let columns = this.state.columns;
        let arr = [];
        let ownerId = "";
        let maxChangeState = 0;
        if(this.props.summaryData !== undefined && this.props.summaryData !== null){
            arr = this.props.summaryData.phase.list.map((o) => {
                return o.status
            })
            this.props.summaryData.fields.map((o) => {
                if(o.label === "Change Owner"){
                    if(o.value.includes('('))
                        ownerId = o.value.match(/[aAxX]{1}\d{7}/g)
                        if(ownerId){
                            ownerId = ownerId[0]
                        }
                    else
                        ownerId = o.value
                }else if(o.label === "Max Change State"){
                    maxChangeState = o.value
                }
            });
        }
        
        let defCount = arr.filter(function(x){ return x.toUpperCase() === "DEFINITION"; }).length;
        this.setState({deviceNotif : defCount !== arr.length});
        if(!this.props.hasRole(ADMIN_ROLES)){
            let index = columns.map((item) => {return item.key}).indexOf('holdStatus');
            columns.splice(index, 1);
            //check if the userDetails.id is the owner and the maximum change state <= 3 (REVIEWED)
            this.setState({canUpdate : (this.props.userDetails.id === ownerId && maxChangeState <= 3), columns : columns});
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
        this.resetCount();
    }

    toggleModal(activeModal){
        this.setState({modalVisible: activeModal});
    }

    updateCount(state) {
        this.setState({
            selectedCount: JSON.parse(sessionStorage.getItem(localStorageSelectionList)).length
        })
    }

    updateSelection(selectedDevices) {
        var selectionList = []
        if (selectedDevices !== undefined && selectedDevices !== null && selectedDevices !== []) {
            for (let i in selectedDevices) {
                selectionList.push(selectedDevices[i])
            }
        } else {
            selectionList = []
        }

        // Update the stored values
        sessionStorage.setItem(localStorageSelectionList, JSON.stringify(Array.from(new Set(selectionList)))); // Remove any duplicates
        this.setState({
            selectedCount: selectionList.length
        })
        
        // Refresh the table
        this.tableRefresh()
    }

    resetCount() {
        // Clear the contents of selected items stored in session storage
        sessionStorage.setItem(localStorageSelectionList, JSON.stringify([]));
        this.setState({ selectedCount: 0});
        if(this.state.canUpdate){
        // Start a new transaction for checkboxes
            fetch(CHK_INIT_URL, { credentials: 'include', headers: headers })
                .then((response) => { return response.json(); })
                .then((json) => { this.setState({ transaction: json, isLoading: false }); })
                .catch((ex) => { throw ex; });
        }
    }

    selectAll() {        
        // Make sure that the transaction is properly initialized.
        if(this.state.transaction === 0){
            // Clear the contents of selected items stored in session storage
            sessionStorage.setItem(localStorageSelectionList, JSON.stringify([]));
            this.setState({ selectedCount: 0});
            if(this.state.canUpdate){
                // Start a new transaction for checkboxes
                fetch(CHK_INIT_URL, { credentials: 'include', headers: headers })
                    .then((response) => { return response.json(); })
                    .then((json) => { 
                        this.setState({ transaction: json, isLoading: false }); 
                        this.fetchSelectAllToggle(true)
                    })
                    .catch((ex) => { throw ex; });
            }
        } else {
          this.fetchSelectAllToggle(true)
        }
    }

    unselectAll() {
      this.fetchSelectAllToggle(false)
    }

    fetchSelectAllToggle = (toggleSelect) => {
      showOverlaySpinner()
      let toggleCommand = toggleSelect ? 'selectall' : 'unselectall'
      FetchUtilities.fetchGet(`/api/v1/change/${this.props.changeNumber}/device/${this.state.transaction}/${toggleCommand}?`+this.table.generateUrlQuery(), 
        (httpStatus, response) => {
          let deviceList = response['DEVICES']
          this.updateSelection(deviceList)
          this.setState({ selectedCount: deviceList.length, showSpinner : false })
          this.tableRefresh()
          hideOverlaySpinner()
        }, _=> hideOverlaySpinner() )
    }

    handleSubmit(){
        this.toggleSpinner()
        let checkedItems =JSON.parse(sessionStorage.getItem(localStorageSelectionList));
        var listData = [];
        for (var i in checkedItems){
            listData.push({
                id : checkedItems[i],
                changeNumber : this.state.changeNumber || null,
                status: this.state.type
            })
        }
        this.sendData(listData);
    }

    sendData(formdata){
        let postUrl = HOLD_URL;
        fetch(postUrl,
            {
                method: 'POST',
                body: JSON.stringify(formdata),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }),
                credentials: 'include',
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                if (response.status === 200) {
                    this.resetCount();
                    this.tableRefresh();
                    if (typeof this.props.refresh === 'function') {
                        this.props.refresh() // Refresh the parent page to reflect updated data
                    } else {
                        window.location.reload() // Refresh the whole page as fallback
                    }

                    this.toggleSpinner()

                }
            })
            .catch((error) => {
                console.log(error);
            });
            this.toggleModal(undefined);
    }

    isEmpty(obj){
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    tableRefresh(){
        this.table.refresh();
    }

    toggleSpinner = () => {
        this.setState({
            showSpinner : !this.state.showSpinner
        })
    }

    // Handler for form change
    handleChange(e) {
        // Prevent legacy form post
        e.preventDefault();

        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name] : value
        });

    }

    render() {
        let deviceUrl = URL + this.props.changeNumber +"/"+ this.state.transaction;
        let selectedBox = sessionStorage.getItem(localStorageSelectionList) === null ? null : sessionStorage.getItem(localStorageSelectionList);
        let isDisabled = this.isEmpty(JSON.parse(selectedBox)) ? true : false;
        let modalHeader = isDisabled ? "Select a device to update" : "Update Certification status for " +this.state.selectedCount+ " devices "

        let customBar = this.state.canUpdate ? (
                <div className="p-2 clearfix">
                    <div>
                        {this.props.hasRole(ADMIN_ROLES) && this.state.canUpdate ? <Button color="primary" size="sm" className="float-left mr-1" onClick={()=>{this.toggleModal('hold')}}>Hold Devices</Button> : ''}
                        <CheckAllWidget selectedCount={this.state.selectedCount}
                                    selectAllCallback={this.selectAll} unselectAllCallback={this.unselectAll} />
                    </div>
                    <div style={{"float":"right"}}>
                        <DeleteDevice {...this.props} sequence={this.state.transaction} count={this.state.selectedCount} tableRefresh={this.tableRefresh.bind(this)} resetCount={this.resetCount.bind(this)} changeNumber={this.state.changeNumber} deviceNotif={this.state.deviceNotif}/>&nbsp;
                        <AddDevice {...this.props} changeNumber={this.state.changeNumber} tableRefresh={this.tableRefresh.bind(this)} deviceNotif={this.state.deviceNotif}/>&nbsp;
                        <AddDeviceByChipName {...this.props} changeNumber={this.state.changeNumber} key={this.state.key} tableRefresh={this.tableRefresh.bind(this)} deviceNotif={this.state.deviceNotif}/>&nbsp;
                        <UploadDeviceEdits changeNumber={this.state.changeNumber} tableRefresh={this.tableRefresh.bind(this)} toggleModal={this.toggleModal.bind(this)} deviceNotif={this.state.deviceNotif}/>&nbsp;
                        <DeviceHistory changeNumber={this.state.changeNumber} />&nbsp;
                    </div>
                </div>
        ) : undefined;

        let deviceRow = (props)=>{return <DeviceRow {...props} 
                                            updateCount={this.updateCount.bind(this)} 
                                            hasOverride={this.state.canUpdate} 
                                            transaction={this.state.transaction}
                                            tableRefresh={this.tableRefresh.bind(this)} 
                                            toggleSpinner={this.toggleSpinner.bind(this)} />};
        return (
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                <Modal
                    isOpen={this.state.modalVisible === 'hold'}
                    fade={true}
                    toggle={this.state.modalVisible === 'hold'}
                    backdrop={true}
                    size={"lg"}>
                    <ModalHeader toggle={this.toggleForm}>{modalHeader}</ModalHeader>
                    <ModalBody>
                        {
                            isDisabled ? <div> Please select at least one device. </div> : <div>
                                <Form>
                                    <FormGroup>
                                        <Label for="sbe"> Safety Certification Required: </Label>
                                        <Input
                                                        name="type"
                                                        onChange={this.handleChange}
                                                        type="select"
                                                        required >
                                                        <option value="No">No</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="Completed">Completed</option>
                                        </Input>
                                    </FormGroup>
                                </Form>
                            </div>
                        }
                        <span className='float-right'>
                            {this.state.selectedCount === 0 ? '' : <Button color="primary" className="mr-1" disabled={isDisabled} onClick={this.handleSubmit}>Submit</Button>}
                            <Button color="secondary" outline className="mr-1" onClick={()=>{this.toggleModal(undefined)}}>Cancel</Button>
                        </span>
                    </ModalBody>
                </Modal>

                {/* <UploadComponent modalVisible={this.state.modalVisible} tableRefresh={this.tableRefresh} toggleModal={this.toggleModal} changeNumber={this.props.changeNumber}/> */}

                {this.state.transaction !== undefined ? (
                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="devices_table"
                >
                <ReactiveTable server
                    credentials={'include'}
                    ref={(table) => this.table = table}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    striped columnFilters advancedColumns
                    columns={this.state.columns}
                    url={deviceUrl}
                    row={deviceRow}
                    customTopBar={customBar}
                    mirrorCustomTopBar
                />
            </ReactiveTableStore>) : ''}
            </div>
        )
    }
}

let rules = {
    editDeviceComment: ['required']
};

let message = {
    'required': 'Changes to Comment is required.'
};

class DeviceRow extends React.Component{
    constructor(props){
        super(props);
        this.state={
            data: this.props.data,
            editDeviceModalVisible: false,
            tableRowData : {},
            toolTipVisible : false,
            validity: {},
            errors: {},
            editForm: {
                editDeviceComment : null,
            }
        }
        this.updateSelection = this.updateSelection.bind(this);
    }

    validate = () => {
        
        let validation = new Validator();
        validation = new Validator(this.state.editForm, rules, message);

        validation.passes();

        let formValidity = {};
        let formErrors = {};

        Object.keys(this.state.editForm).forEach(field => {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
          });

          this.setState({
            validity: formValidity,
            errors: formErrors
        });
        return validation.passes();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data
        });
    }

    updateSelection(e){
        // Fetch the current list in session storage
        var selectionList = [];
        var rawList = sessionStorage.getItem(localStorageSelectionList);
        if (rawList !== undefined && rawList !== null) {
            selectionList = JSON.parse(rawList);
        }

        let isChecked = false;
        if(e){
            isChecked = true
        }

        fetch(`${CHK_URL}?ctx=CHG_CHGDEV&tid=${this.props.transaction}&eid=${this.state.data.id}&chk=${isChecked}`,
                { method: 'POST', credentials: 'include', headers: headers })
                .then((response)=>{
                    if(isChecked){
                    selectionList.push(this.state.data.id);
                    }else{
                        removeFromArray(selectionList, this.state.data.id);
                    }
                    
                    sessionStorage.setItem(localStorageSelectionList, JSON.stringify(selectionList));
                    this.props.updateCount(e);
                    // this.props.updateSequence(this.props.transaction);
                })
                .catch((ex) => { throw ex });  
    }

    editDevice = (rowData) => {
        this.setState({
            tableRowData : rowData, 
            editDeviceComment : rowData.changeDescription,
            editDeviceStatus : rowData.deviceStatus
        });
        this.toggleEditDeviceForm();
    }

    toggleEditDeviceForm = () => {
        this.setState({editDeviceModalVisible : !this.state.editDeviceModalVisible});
    }

    saveDeviceChanges = (e) => {
        if(this.validate()){
            e.preventDefault();
            if(this.state.editDeviceComment === this.state.tableRowData.changeDescription &&
            this.state.editDeviceStatus === this.state.tableRowData.deviceStatus){
                this.toggleEditDeviceForm();
            }else{
                this.props.toggleSpinner();
                let data = {
                    deviceStatus : this.state.editDeviceStatus !== null && this.state.editDeviceStatus !== undefined ? this.state.editDeviceStatus : this.state.tableRowData.deviceStatus,
                    deviceComment : this.state.editDeviceComment !== null && this.state.editDeviceComment !== undefined && this.state.editDeviceComment !== "" ? this.state.editDeviceComment : this.state.tableRowData.changeDescription
                }

                fetch(`/api/v1/edit-device/${this.state.tableRowData.changeNumber}?material=${this.state.tableRowData.material}`, {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }),
                    credentials: 'include',
                    body: JSON.stringify(data),
                })
                .then(FetchUtilities.checkStatusWithSecurity)
                .then((response) => {
                    this.props.tableRefresh();
                    this.toggleEditDeviceForm();
                    this.props.toggleSpinner();
                    this.setState({editForm : {editDeviceComment : null}})
                })
                .catch((ex) => {
                    console.error(ex);
                    // throw ex;
                });
            }
        }
    }

    handleChange = (name, value) => {
        if(name === "editDeviceComment"){
            this.setState((previousState) => {
                return previousState.editForm = {...previousState.editForm, [name]: value};
            }, () => this.validate()); 
        }else{
            this.setState((previousState) => {
                return previousState.data = { ...previousState.data, [name]: value };
            });
        }
    }

    toggleToolTip = () =>{
        this.setState({toolTipVisible:!this.state.toolTipVisible});
    }

    render(){
        // Fetch the current list in session storage
        var selectionList = [];
        var rawList = sessionStorage.getItem(localStorageSelectionList);
        if (rawList !== undefined && rawList !== null) {
            selectionList = JSON.parse(rawList);
        }
        const record = this.props.data;
        let isChecked = selectionList.includes(`${record['material']}`);

        let toolTip = record['changeDescription'] ? 
                    <Tooltip placement={"right"} isOpen={this.state.toolTipVisible} target={`btn-${record['material'].replace("/","-")}`} toggle={this.toggleToolTip}>
                        {record['changeDescription']}
                    </Tooltip> : undefined;

        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === 'action') {
                if(this.props.hasOverride){
                    return (
                        <React.Fragment>
                            <Modal isOpen={this.state.editDeviceModalVisible}
                                fade={true}
                                backdrop={true}
                                size={"sm"}>
                                <ModalHeader toggle={this.toggleEditDeviceForm}>Change Device</ModalHeader>
                                <ModalBody>
                                    {/* <Form onSubmit={this.searchDevices} autoComplete="off" id="searchDeviceForm" noValidate> */}
                                    <Form autoComplete="off" id="searchDeviceForm" noValidate>
                                        <Row>
                                            <Col md="12">
                                                <Label>Material: {this.state.tableRowData['material']} &nbsp;</Label>
                                                <Label>Old Material: {this.state.tableRowData['oldMaterial']} &nbsp;</Label>
                                                <Label>Chip Name: {this.state.tableRowData['chipName']} &nbsp;</Label>
    
                                                <Row style={{"height":"0px"}}>&nbsp;</Row>
    
                                                <FormWidgetSelect label="Status" name="editDeviceStatus"
                                                options={[{ value: "Active", label: "Active" }, { value: "Not Applicable", label: "Not Applicable" }, { value: "No PCN", label: "No PCN" }]} 
                                                value={this.state.editDeviceStatus}
                                                onChange={this.handleChange}
                                                bsSize="sm"/>
    
                                                <FormWidgetTextArea label="Comment" name='editDeviceComment' value={this.state.editDeviceComment ? this.state.editDeviceComment : ''} onChange={this.handleChange} required/>
                                                <Input type="hidden" name="" invalid={!this.state.validity.editDeviceComment}/>
                                                <FormFeedback>{this.state.errors.editDeviceComment}</FormFeedback>
                                            </Col>
                                        </Row>
                                    </Form>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={this.saveDeviceChanges}>Save Changes</Button>
                                    <Button onClick={this.toggleEditDeviceForm}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                            <td>
                                <GridCheckboxCell key={key} 
                                    id={`${record['material']}`} 
                                    callback={(event) => {this.updateSelection(event)}} 
                                    checked={isChecked} disabled={false} />
                                <td><Button onClick={() => this.editDevice(record)} id={`btn-${record['material'].replace("/","-")}`} name={record['material']} className='mr-2 mb-1 btn btn-outline-dark btn-sm'><FontAwesome name={'pencil'} /></Button></td>
                                {toolTip}
                            </td>
                        </React.Fragment>)
                }else{
                    return <td key={key}></td>
                }
            } else if (column.key === 'holdStatus') {
                return <td key={key}><StatusIndicator record={record} /></td>
            }
            else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })
        return(
            <tr key={`${record.id}-${record.orderableMaterial}`}>
                {cells}
            </tr>
        );
    }
}

class StatusIndicator extends Component {
    render() {
        const {holdStatus} = this.props.record
        let statusColor = 'success'
        statusColor = holdStatus === 'Yes' ? 'danger' : statusColor;
         return <div><BigBadge color={statusColor}>{holdStatus}</BigBadge></div>
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

export default DeviceTab;
