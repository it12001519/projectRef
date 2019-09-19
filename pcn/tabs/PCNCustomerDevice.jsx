import React from 'react';
import ReactiveTable, {ReactiveTableStore, } from 'reactive-tables';
import FetchUtilities from 'js/universal/FetchUtilities';
import { GridTextCell, GridCheckboxCell } from 'js/universal/GridCells';
import {Button, Input, Modal, ModalHeader, Table, Form, ModalBody, FormGroup, Label, Col, Row, ButtonGroup, Alert} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import { InfoModal} from 'js/universal/Modals';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import classnames from 'classnames';
import Spinner from 'js/universal/spinner';

const localStorageKey = "checkedPCNDeviceData";
const POST_URL = '/api/v1/customer-device';

var headers = new Headers();
headers.append('pragma', 'no-cache')
headers.append('cache-control', 'no-cache')

const localStorageSelectionList = 'PCNCustomerDevice';

const ADMIN_ROLES = ['System Admin','ChangeLink Admin','PCN Coordinator'];

class PCNCustomerDevice extends React.Component{
    constructor(props){
        super(props);
        this.state={
            showSpinner: false,
            pcnNumber: this.props.pcnNumber,
            url: '/api/v1/customer_device',
            modalVisible: false,
            deviceStatus: null,
            notificationStatus: null,
            activeModal: null,
            timestamp: null,
            canUpdate: props.hasRole(ADMIN_ROLES),
            columns: [
                {
                    key: 'action',
                    label: '',
                    sortable: false
                },{
                    key: 'changeNumber',
                    label: 'Change Number'
                },{
                    key: 'profitCtrName',
                    label: 'Profit Center Name'
                },{
                    key: 'relClass',
                    label: 'Rel Class'
                },{
                    key: 'soldToNumber',
                    label: 'Customer Number'
                },{
                    key: 'soldToName',
                    label: 'Customer Name'
                },{
                    key: 'customerPart',
                    label: 'Customer Part'
                },{
                    key: 'orderableMaterial',
                    label: 'Affected Device'
                },{
                    key: 'custRegion',
                    label: 'Region'
                },{
                    key: 'sbe',
                    label: 'SBE'
                },{
                    key: 'sbe1',
                    label: 'SBE-1'
                },{
                    key: 'sbe2',
                    label: 'SBE-2'
                },{
                    key: 'dataSource',
                    label: 'Data Source'
                },{
                    key: 'endCustomerNumber',
                    label: 'End Customer Number'
                },{
                    key: 'endCustomerName',
                    label: 'End Customer Name'
                },{
                    key: 'notificationPeriod',
                    label: 'Notification Period'
                },{
                    key: 'deviceStatus',
                    label: 'Device Status'
                },{
                    key: 'notificationStatus',
                    label: 'Notification Status'
                },{
                    key: 'industrySector',
                    label: 'Industry Sector'
                },{
                    key: 'documentUsedForNotification',
                    label: 'Document Used'
                },{
                    key: 'timestamp',
                    label: 'Notification Date'
                }
            ],
            infoModalColor: 'warning',
            infoModalTitle: 'No Changes',
            infoModalMessage: 'If there are no changes to be made, please cancel the request'
        }
        this.toggleModal = this.toggleModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.sendData = this.sendData.bind(this);
        this.tableRefresh = this.tableRefresh.bind(this);
        this.closeNotifModal = this.closeNotifModal.bind(this);
        this.handleDatePicker = this.handleDatePicker.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.unselectAll = this.unselectAll.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
    }

    componentWillMount(){
        localStorage.removeItem(localStorageKey);
        this.setState({deviceStatus: null, notificationStatus: null})
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    selectAll() {
        this.toggleSpinner();
        let URL = `${this.state.url}/${this.state.pcnNumber}`
        URL = this.props.filterByChange ? `${this.state.url}/${this.state.pcnNumber}` : URL
        URL = this.props.filterByPCN ? `${this.state.url}/${this.state.pcnNumber}` : URL
        fetch(`${URL}/selectAll?`+this.table.generateUrlQuery(), { credentials: 'include', headers: headers })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => { return response.json() })
        .then((json) => { 
            let isExist =localStorage.getItem(localStorageKey);
            isExist = isExist ? JSON.parse(isExist) : {};
            for(let i in json){
                isExist[`${json[i].id}`] = JSON.parse(`{"orderableMaterial":"${json[i].orderableMaterial}","soldToName":"${json[i].soldToName}","deviceStatus":"${json[i].deviceStatus}","notificationStatus":"${json[i].notificationStatus}","timestamp":"${json[i].timestamp}"}`);
                localStorage.setItem(localStorageKey, JSON.stringify(isExist));
            }
            this.tableRefresh();
            this.toggleSpinner();
        })
        .catch((ex) => { 
            this.toggleSpinner();
            FetchUtilities.handleError(ex);
            throw ex; });
    }

    unselectAll() {
        localStorage.clear(localStorageKey)
        localStorage.removeItem(localStorageKey);
        this.tableRefresh();
    }

    toggleModal() {
        let hasSelected = this.isEmpty(localStorage.getItem(localStorageKey)) ? false : true;
        if(hasSelected){
            this.setState({ modalVisible: !this.state.modalVisible});
        }else{
            this.setState({
                infoModalTitle: 'Invalid Input',
                infoModalMessage: 'Select records first before clicking the Mass Update button.',
                activeModal: 'info2',
                infoModalColor: 'warning'
            });
        }
    }

    closeModal() {
        this.setState({ modalVisible: false });
    }

    closeNotifModal(){
        this.setState({activeModal:null})
    }

    handleInputChange = (e) => {
        const target = e.target;
        let value =target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState((previousState) => {
            return previousState.data = {...previousState.data, [name]: value};
        });
    }

    handleSubmit(e){
        if((this.state.deviceStatus === null && this.state.notificationStatus === null) ||
           (this.state.deviceStatus === "No Change" && this.state.notificationStatus)){
               this.setState({
                   activeModal: 'info2',
                   infoModalTitle: 'No Changes Made',
                   infoModalMessage: 'If there are no changes to be made (Device Status or Notification Status), please cancel the request',
                   infoModalColor: 'info'
                });
        }else{
            let date = null;
            if(this.state.timestamp !== null){
                date = this.state.timestamp.format("YYYY/MM/DD HH:mm:ss")
            }
            let checkedItems =JSON.parse(localStorage.getItem(localStorageKey));
            var listData = [];
            for (var i in checkedItems){
                listData.push({
                    id : i,
                    deviceStatus : this.state.deviceStatus || null,
                    notificationStatus : this.state.notificationStatus || null,
                    timestamp : date,
                    docUsed : 'Mass_Update_Dummy.doc'
                })
            }
            this.sendData(listData);
        }
    }

    tableRefresh(){
        this.table.refresh();
    }

    sendData(formdata){
        this.toggleSpinner();
        fetch(POST_URL,
        {
            method: 'POST',
            body: JSON.stringify(formdata),
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
            if (response.status === 200) {
                localStorage.removeItem(localStorageKey);
                this.tableRefresh();
                this.setState({deviceStatus: null, notificationStatus: null, timestamp: null});
                this.toggleSpinner();
            }
        })
        .catch((error) => {
            console.log(error);
        });
        this.toggleModal();
    }

    isEmpty(obj){
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    handleDatePicker(date){
        this.setState({timestamp: date});
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    render(){
        let URL = `${this.state.url}/${this.state.pcnNumber}`;
        
        let customBar = (
            this.state.canUpdate ?
            <div style={{margin: '10px 0 10px 5px'}}>
                <Button color="primary" size="sm" className='mr-1' onClick={this.toggleModal}><FontAwesome name="pencil"/> Update Status</Button>
                <ButtonGroup>
                    <Button color='secondary' size='sm' outline onClick={this.selectAll}><FontAwesome name='check-square' />{' '}Select all</Button>
                    <Button color='secondary' size='sm' outline onClick={this.unselectAll}><FontAwesome name='square-o' />{' '}Unselect all</Button>
                </ButtonGroup>
            </div>
            : undefined
        );
        let selectedBox = localStorage.getItem(localStorageKey) === null ? null : localStorage.getItem(localStorageKey);
        let isDisabled = this.isEmpty(selectedBox) ? true : false;
        let modalHeader = isDisabled ? "Select a device to update" : "Device update"
        let tdData;
        let data;
        if(!isDisabled){
            let td = "";
            for (var i in selectedBox){
                td += selectedBox[i];
            }
            let a = JSON.parse(td);
            let t = [];
            for(var i in a){
                t.push(a[i]);
            }
            data = t;
            tdData = data.map((e) => {
                return (
                    <tr key={e.soldToName}>
                        <td>{e.orderableMaterial}</td>
                        <td>{e.soldToName}</td>
                        <td>{e.deviceStatus}</td>
                        <td>{e.notificationStatus}</td>
                        <td>{e.timestamp}</td>
                    </tr>
                )
            });
        }else{
            tdData = <tr><td>{'No Selected Device'}</td></tr>
        }
        return(
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                <InfoModal
                show={this.state.activeModal === 'info2'}
                icon="exclamation-circle"
                color={this.state.infoModalColor}
                title={this.state.infoModalTitle}
                message={this.state.infoModalMessage}
                handleClose={this.closeNotifModal}
                />
                <Modal
                    isOpen={this.state.modalVisible}
                    fade={true}
                    backdrop={true}
                    size={"lg"}>
                    <ModalHeader toggle={this.toggleForm}>{modalHeader}</ModalHeader>
                    <ModalBody>
                        <Alert color="primary">
                            It can take up to 15 minutes for the changes to reflect in the Revision Tab.
                        </Alert>
                        <div style={{minHeight:'50px',maxHeight:'300px',overflowY:'auto',width:'100%', marginBottom:'10px'}}>
                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Affected Device</th>
                                        <th>Customer Name</th>
                                        <th>Device Status</th>
                                        <th>Notification Status</th>
                                        <th>Notification Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tdData}
                                    {/* <TableFormat record={data} /> */}
                                </tbody>
                            </Table>
                        </div>
                        <Form>
                            <Row form>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label for="deviceStatus">Device Status:</Label>
                                        <Input type="select" 
                                            id="deviceStatus"
                                            name="deviceStatus"
                                            value={this.state.deviceStatus ? this.state.deviceStatus: ''}
                                            onChange={this.handleInputChange}
                                            disabled={isDisabled}>
                                            <option key=''>No Change</option>
                                            <option key='Active'>Active</option>
                                            <option key='Addendum'>Addendum</option>
                                            <option key='Retracted'>Retracted</option>
                                            <option key='Reissue'>Reissue</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label for="notificationStatus">Notification Status:</Label>
                                        <Input type="select" 
                                           id="notificationStatus" 
                                           name="notificationStatus"
                                           value={this.state.notificationStatus ? this.state.notificationStatus: ''}
                                           onChange={this.handleInputChange}
                                           disabled={isDisabled}>
                                        <option key=''>No Change</option>
                                        <option key='Addendum_Sent'>Addendum Sent</option>
                                        <option key='Approve'>Approve</option>
                                        <option key='No_Assigned_Contacts'>No Assigned Contacts</option>
                                        <option key='Excluded'>Excluded</option>
                                        <option key='Not_Sent'>Not Sent</option>
                                        <option key='Notification_Pending'>Notification Pending</option>
                                        <option key='Reissue_Sent'>Reissue Sent</option>
                                        <option key='Retracted_Sent'>Retracted Sent</option>
                                        <option key='Sent'>Sent</option>
                                        <option key='N/A'>N/A</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label for="timestamp">Notification Date:</Label>
                                        <DatePicker 
                                        name="timestamp"
                                        dateFormat="YYYY/MM/DD"
                                        selected={this.state.timestamp ? moment(this.state.timestamp): undefined}
                                        todayButton={"Today"}
                                        placeholderText="YYYY-MM-DD HH:MI:SS"
                                        onChange={this.handleDatePicker}
                                        className={classnames("form-control")}
                                        disabled={isDisabled}
                                        // invalid={!this.state.validity.lastDate}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Form>
                        <Button color="danger" className="float-right" onClick={this.closeModal}>Cancel</Button>
                        <Button color="primary" className="float-right" disabled={isDisabled} onClick={this.handleSubmit}>Submit</Button>
                    </ModalBody>
                </Modal>

                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="pcn_cust_dev_table"
                >
                    <ReactiveTable
                    ref={(table) => this.table = table}
                    server striped columnFilters advancedColumns
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    url={URL} 
                    columns={this.state.columns}
                    row={PCNCustDevRow}
                    customTopBar={customBar}
                    mirrorCustomTopBar
                    />
                </ReactiveTableStore>
            </div>
        );
    }
}

class PCNCustDevRow extends React.Component{
    constructor(props){
        super(props);
        this.state={
            data: this.props.data
        }
        this.updateSelection = this.updateSelection.bind(this);
        this.refresh = this.refresh.bind(this);
        this.addLocalItem = this.addLocalItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: this.props.data
        }, () => {
            this.refresh();
        });
    }

    refresh(){
        this.setState({data: this.props.data});
    }

    updateSelection(e){
        if(e){
            this.addLocalItem();
        }else{
            this.deleteItem()
        }
        
    }

    addLocalItem(){
        let isExist =localStorage.getItem(localStorageKey);
        isExist = isExist ? JSON.parse(isExist) : {};
        isExist[`${this.state.data.id}`] = JSON.parse(`{"orderableMaterial":"${this.state.data.orderableMaterial}","soldToName":"${this.state.data.soldToName}","deviceStatus":"${this.state.data.deviceStatus}","notificationStatus":"${this.state.data.notificationStatus}","timestamp":"${this.state.data.timestamp}"}`);
        localStorage.setItem(localStorageKey, JSON.stringify(isExist));
    }

    deleteItem(){
        let checkedItems = JSON.parse(localStorage.getItem(localStorageKey));
        let placeholder = {};
        for (var i in checkedItems){
            if(i !== this.props.data.id){
                placeholder[i]=checkedItems[i];
            }
        }
        localStorage.removeItem(localStorageKey);
        let withValue = this.withData(placeholder)
        if(withValue){
            localStorage.setItem(localStorageKey, JSON.stringify(placeholder));
        }else{
            localStorage.removeItem(localStorageKey);
        }        
    }

    withData(obj){
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return true;
        }
        return false;
    }

    render(){
        const record = this.props.data;
        let checked = false;
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            let checkedItems =JSON.parse(localStorage.getItem(localStorageKey));
            for (var i in checkedItems){
                if(i === this.props.data.id){
                    checked = true;
                }
            }
            if (column.key === 'action') {
                return <GridCheckboxCell key={key} 
                        id={`${record.id}-${record[key]}`} 
                        callback={(event) => this.updateSelection(event)} 
                        checked={checked} disabled={false} />
            } else {
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

// class TableFormat extends React.Component{
//     constructor(props){
//         super(props);
//         this.state={
//             data: this.props.record
//         }
//     }

//     render(){
//         let deviceInfo = <tr><td>PENDING</td></tr>;
//         if (this.state.data !== null) {

//             deviceInfo = this.state.data.map((e) => {
//                 return (
//                     <tr key={e.soldToName}>
//                         <td>{e.orderableMaterial}</td>
//                         <td>{e.soldToName}</td>
//                         <td>{e.deviceStatus}</td>
//                         <td>{e.notificationStatus}</td>
//                         <td>{e.timestamp}</td>
//                     </tr>
//                 )
//             });
//         } else {
//             deviceInfo = <tr></tr>
//         }
//         return(
//             {deviceInfo}
//         );
//     }
// }
export default PCNCustomerDevice;
