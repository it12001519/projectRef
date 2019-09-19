import React, {Component} from 'react'
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables'
import "css/approval-matrix-button-bar.css"
import FetchUtilities from 'js/universal/FetchUtilities';
import { GridTextCell, GridCheckboxCell, GridActionButton, GridActionCell } from 'js/universal/GridCells';
import {Button, ButtonGroup, Modal, ModalHeader, ModalBody, Row, Col, Input, Alert, FormText, Label, Form, ModalFooter, FormFeedback } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import { BigBadge } from 'js/app/models/ChangelinkUI';
import { removeFromArray } from 'js/universal/commons';
import Spinner, { showOverlaySpinner, hideOverlaySpinner, } from "js/universal/spinner";
import {InfoModal, ConfirmModal } from 'js/universal/Modals';
import Validator from 'validatorjs';
import UploadComponent from 'js/app/views/change/cms-device/UploadComponent';


var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

let rules = {
    values: ['required']
};

let message = {
    'required': 'This field is required.'
};

class AddDevice extends React.Component{
    constructor(props){
        super(props);
        this.state={
            columns: [
                {
                    key: 'action',
                    label: ''
                }, {
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
                    key: "enteredBy",
                    label: "Entered By"
                }, {
                    key: "asOfDate",
                    label: "As of Date"
                }
            ],
            data: {
                values : null,
            },
            list: [],
            invalidDevices: [],
            modalVisible: false,
            addModalVisible: false,
            warningModalVisible: null,
            invalidDevicesModalVisible: false,
            uploadModal: null,
            transaction: 0,
            changeNumber: this.props.changeNumber,
            selectedCount: 0,
            tableUrl: null,
            showSpinner: false,
            sequence: 0,
            includepinpkg : true,
            paramType : 'material',
            searchResponse: null,
            validity: {},
            errors: {}
        }
        this.table = null;
        this.tableRefresh = this.tableRefresh.bind(this);
    }

    initStates = () => {
        this.setState({
            data: {
                values : null,
            },
            list: [],
            invalidDevices: [],
            modalVisible: false,
            addModalVisible: false,
            warningModalVisible: null,
            invalidDevicesModalVisible: false,
            uploadModal: null,
            transaction: 0,
            changeNumber: this.props.changeNumber,
            selectedCount: 0,
            tableUrl: null,
            showSpinner: false,
            sequence: 0,
            includepinpkg : true,
            paramType : 'material',
            searchResponse: null,
            validity: {},
            errors: {}
        });
    }

    // Handle form validation
    validate = () => {
        
        let validation = new Validator();
        validation = new Validator(this.state.data, rules, message);

        validation.passes();

        let formValidity = {};
        let formErrors = {};

        Object.keys(this.state.data).forEach(field => {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
          });

          this.setState({
            validity: formValidity,
            errors: formErrors
        });
        return validation.passes();
    }

    componentWillMount(){
    }

    componentDidMount(){
        this.initStates();
    }

    toggleModal = () => {
        this.setState({
            modalVisible : !this.state.modalVisible
        })
    }

    toggleAddModal = () => {
        this.setState({
            addModalVisible : !this.state.addModalVisible
        });
    }

    toggleInvalidDeviceModal = () => {
        this.setState({
            invalidDevicesModalVisible : !this.state.invalidDevicesModalVisible
        });
    }

    toggleSpinner = () => {
        this.setState({
            showSpinner : !this.state.showSpinner
        })
    }

    //fetch candidate devices based on user inputs or file upload
    fetchDevices = (data) => {
        fetch('/api/v1/search-device', {
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
            return response.json();
        })
        .then((json) => {
            if(this.validateResponse(json)){
                this.setState({ tableUrl: `/api/v1/search-candidate-device/${json.seq}`, 
                                isLoading: false, 
                                list :  data.values.replace(/(?:\r\n|\r|\n)/g, ',').split(','), //fetch data from textarea and converts it to array, purpose is for filtering if material contains substring of the input value
                                addModalVisible : !this.state.addModalVisible,
                                showSpinner:false,
                                modalVisible: false, 
                                sequence: json.seq
                            });
            }
        })
        .catch((ex) => {
            console.error(ex);
            // throw ex;
        });
    }

    //verifies json content if wild card/user inputs returns an invalid/non-existing device/s
    validateResponse = (json) => {
        this.setState({showSpinner : false});
        if(json.total_devices === 0 && json.invalid_count === 0){
            this.setState({searchResponse : json, warningModalVisible : "info2"});
            return false;
        } else if(json.invalid_count > 0){
            this.setState({searchResponse : json})
            this.toggleInvalidDeviceModal();
            return false;
        }else{
            return true;
        }
    }

    //set the url source for reactive table
    uploadTable = (json) => {
        if(this.validateResponse(json)){
            this.setState({tableUrl : `/api/v1/search-candidate-device/${json.seq}`, 
                           sequence : json.seq, 
                           addModalVisible : !this.state.addModalVisible, 
                           showSpinner:false, modalVisible: false, list : json.devices,
                           searchResponse : json});
            this.selectAll();
        }
    }

    //validate form inputs then send data to fetch candidate devices
    searchDevices = () => {
        if(this.validate()){
            this.toggleSpinner();
            let data = {
                change_no : this.state.changeNumber,
                paramType : this.state.paramType === undefined || this.state.paramType === null ? 'material' : this.state.paramType,
                values : this.state.values,
                includepinpkg : this.state.includepinpkg === undefined ? false : this.state.includepinpkg
            }
            this.fetchDevices(data);
        }
    }

    //input validation
    handleChange = (e) => {
        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if(name === "values"){
            this.setState((previousState) => {
                return previousState.data = {...previousState.data, [name]: value};
            }, () => this.validate()); 
        }else{
            this.setState({
                [name] : value
            });
        }
    }

    tableRefresh(){
        this.table.refresh();
    }

    updateCount = (state) => {
        //TODO: do an ajax call to count the selected items then set it as the selected count
        // var obj = JSON.parse(localStorage.getItem(localStorageKey));
        // this.setState({selectedCount : obj === undefined || obj === null ? 0 : Object.keys(obj).length});
    }

    //if search results contains invalid devices then filter the correct data before fetching the candidate devices
    fetchValidDevice = () => {
        if(this.state.searchResponse.valid_count > 0){
            let list = [];
            list = this.state.searchResponse.invalid_devices;
            let values = this.state.values !== undefined ? this.state.values.toUpperCase() : this.state.searchResponse.devices.join('\n').toUpperCase();
            list.map((o) => {
                values = values.replace(o, "");
            });
            this.setState({values : values});

            this.toggleSpinner();
            let data = {
                change_no : this.state.changeNumber,
                paramType : this.state.paramType === undefined || this.state.paramType === null ? 'material' : this.state.paramType,
                values : values,
                includepinpkg : this.state.includepinpkg === undefined ? false : this.state.includepinpkg
            }
            this.toggleInvalidDeviceModal()
            this.fetchDevices(data);
        } else {
            this.toggleInvalidDeviceModal()
        } 
    }

    //save candidate devices
    saveDevices = () => {
        this.toggleSpinner();
        fetch(`/api/v1/candidate-device/save/${this.state.sequence}/${this.props.changeNumber}/${this.props.deviceNotif}`, { credentials: 'include', headers: headers })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
            this.initStates()
            this.props.tableRefresh();
        })
        .catch((ex) => { 
            FetchUtilities.handleError(ex);
            throw ex; });
    }

    selectAll = () => {
      showOverlaySpinner()
      FetchUtilities.fetchGet(`/api/v1/candidate-device/${this.state.sequence}/selectAll?${this.table.generateUrlQuery()}`,
      (httpStatus, response) => {
          //TODO: Just return the selected count in the backend
        //   this.setState({selectedCount : response.length})
          this.tableRefresh();
          hideOverlaySpinner()
        }, _=> hideOverlaySpinner() )
    }

    unselectAll = (e) => {
        e.preventDefault();
        showOverlaySpinner()
        FetchUtilities.fetchGet(`/api/v1/candidate-device/${this.state.sequence}/unselectAll`,
        (httpStatus, response) => {
            //TODO: Just return the selected count in the backend
            // this.setState({selectedCount : 0});
            this.tableRefresh();
            hideOverlaySpinner()
          }, _=> hideOverlaySpinner() )
    }

    toggleUpload = (activeModal) => {
        this.setState({uploadModal : activeModal});
    }

    render(){
        let customBar = <div className="p-2 clearfix">
                            <CheckAllWidget selectedCount={this.state.selectedCount}
                                            selectAllCallback={this.selectAll} unselectAllCallback={this.unselectAll} />
                        </div>
            
        let uploadLabel = "Material Name";
        if(this.state.paramType === 'material')
            uploadLabel = "Material Name"
        else if(this.state.paramType === 'oldMaterial')
            uploadLabel = "Old Material Name"
        else if(this.state.paramType === 'chipName')
            uploadLabel = 'Chip Name'

        let addDeviceRow = (props) => {return <AddDeviceRow {...props} updateCount={this.updateCount.bind(this)} sequence={this.state.sequence} list={this.state.list}/>}
        let invalidDeviceMessage = this.state.searchResponse !== null ? 
                                    <div>
                                        <p>{this.state.searchResponse.valid_count} of {this.state.searchResponse.total_devices} will be added. The following are not orderable materials. Click Yes to confirm or No to revise the list.</p>
                                        <Input type="textarea" value={this.state.searchResponse.invalid_devices.toString().replace(/,/g, '\n')} id="filterText" style={{"height":"120px"}}/>
                                        <p>Are you sure you want to proceed?</p>
                                    </div> : undefined
        let description = <ol>
                            <li>Upload file must be in .xls or xlsx format. </li>
                            <li>First column must be Material/Old Material/Chipname.  </li>
                        </ol>

        return (
            <div style={{'display':'inline-block'}}>
                <Button onClick={this.toggleModal}>Add Device</Button>
                <Spinner showSpinner={this.state.showSpinner} />

                {this.state.uploadModal === "uploadDevice" ? 
                    <UploadComponent uploadAction={'add'} 
                    description={description}
                    modalVisible={'upload'} 
                    tableRefresh={this.tableRefresh} 
                    uploadTable={this.uploadTable.bind(this)}
                    toggleModal={this.toggleUpload} 
                    changeNumber={this.props.changeNumber}
                    paramType={this.state.paramType}
                    includepinpkg={this.state.includepinpkg}
                    /> : ""
                }

                {this.state.warningModalVisible === "info2" ? 
                    <InfoModal icon='exclamation-circle' color='warning'
                    title='Device Not Found' message={"The device(s) that you are trying to search cannot be found or is(are) already in the list."}
                    handleClose={() => this.setState({ warningModalVisible: null })} /> : undefined
                }

                {this.state.searchResponse !== null ? 
                    <ConfirmModal
                        show={this.state.invalidDevicesModalVisible}
                        color="warning"
                        title="Invalid Device"
                        icon='exclamation-circle'
                        message={invalidDeviceMessage}
                        handleClose={this.toggleInvalidDeviceModal}
                        handleConfirmation={this.fetchValidDevice}
                    /> : undefined
                }
                
                <Modal
                    isOpen={this.state.addModalVisible}
                    fade={true}
                    backdrop={true}
                    size={"lg"} 
                    style={{'maxWidth':'95%'}}
                >
                    <ModalHeader toggle={this.toggleAddModal}>Add Device</ModalHeader>
                    <ModalBody>
                        <Alert color="danger">NOTE: Bold devices were added because of same Pin, Package and Die.</Alert>
                        {this.state.tableUrl !== null ? 
                            <ReactiveTable server
                            credentials={'include'}
                            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                            fetchErrorHandler={FetchUtilities.handleError}
                            striped columnFilters advancedColumns
                            columns={this.state.columns}
                            ref={(table) => this.table = table}
                            customTopBar={customBar}
                            row={addDeviceRow}
                            url={this.state.tableUrl} /> 
                        : <span>&nbsp;</span>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.saveDevices}>Add Device</Button>
                        <Button color="default" onClick={this.toggleAddModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <Modal
                    isOpen={this.state.modalVisible}
                    fade={true}
                    backdrop={true}
                    size={"md"}>
                    <ModalHeader toggle={this.toggleForm}>Add Device</ModalHeader>
                    <ModalBody>
                        <Alert color="dark">
                            Add Devices - Select the appropriate method to create your device list
                        </Alert>
                        <Form autoComplete="off" id="searchDeviceForm" noValidate>
                            <Row>
                                <Col md="3" style={{'paddingLeft':'30px'}}>
                                    <Row>&nbsp;</Row>
                                    <Label><Input type="radio" name="paramType" id="material" value="material" defaultChecked onChange={this.handleChange}/> Material</Label>
                                    <Label><Input type="radio" name="paramType" id="oldMaterial" value="oldMaterial" onChange={this.handleChange} /> Old Material</Label>
                                    <Label><Input type="radio" name="paramType" id="chipName" value="chipName" onChange={this.handleChange} /> Chip Name</Label>
                                </Col>
                                <Col md="9">
                                    <Label>Enter a list of values ('*' allowed as wildcard)</Label>
                                    <Input type="textarea" name="values" id="filterText" value={this.state.data.values ? this.state.data.values : ''} style={{"height":"120px"}} onChange={this.handleChange}/>
                                    <Input type="hidden" name="" invalid={!this.state.validity.values}/>
                                    <FormFeedback>{this.state.errors.values}</FormFeedback>
                                    <FormText>Tip: Separate each device by a new line by hitting the "Enter" key.</FormText>
                                </Col>
                            </Row>
                            <Row>&nbsp;</Row>
                            <Row>
                                <Col md="12" style={{"textAlign" : "center", "marginBottom" : "10px"}}>
                                    <Label check>
                                        <Input type="checkbox" id="includeAttr" name="includepinpkg" value={this.state.includepinpkg} defaultChecked onChange={this.handleChange}/> Include devices from Chipname, Pin, Pkg
                                    </Label>
                                </Col>
                                <Col md="12" style={{"textAlign" : "center"}}>
                                    <Button onClick={(event) => this.searchDevices(event, false)}>Search</Button>&nbsp;
                                    <Button onClick={this.toggleModal}>Cancel</Button>&nbsp;
                                    <Button onClick={()=>this.toggleUpload('uploadDevice')}>Upload Devices by {uploadLabel}</Button>
                                </Col>
                            </Row>
                        </Form>
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}

class AddDeviceRow extends React.Component{
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

    updateCandidateDevice = (isIncluded, material) => {
        if(this.props.data !== undefined || this.props.data !== null){
            let data = {
                is_included : isIncluded,
                sequence : this.props.sequence,
                material : material
            }

            fetch('/api/v1/candidate-device/updateSelection', {
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
            .catch((ex) => {
                console.error(ex);
                // throw ex;
            });
        }
    }

    updateSelection(e, id){
        if(this.props.data !== undefined || this.props.data !== null){
            if(e){
                this.addLocalItem(id);
                this.updateCandidateDevice(1,id);
            }else{
                this.deleteItem(id)
                this.updateCandidateDevice(0,id);
            }
            this.props.updateCount();
        }
    }

    addLocalItem(id){
        // let isExist = localStorage.getItem(localStorageKey);
        // isExist = isExist ? JSON.parse(isExist) : {};
        // isExist[`${this.state.data.id}`] = JSON.parse(`{"orderableMaterial":"${this.state.data.material}"}`);
        // localStorage.setItem(localStorageKey, JSON.stringify(isExist));
    }

    deleteItem(id){
        // let checkedItems = JSON.parse(localStorage.getItem(localStorageKey));
        // let placeholder = {};
        // for (var i in checkedItems){
        //     if(i !== this.props.data.id){
        //         placeholder[i]=checkedItems[i];
        //     }
        // }
        // localStorage.removeItem(localStorageKey);
        // let withValue = this.withData(placeholder)
        // if(withValue){
        //     localStorage.setItem(localStorageKey, JSON.stringify(placeholder));
        // }else{
        //     localStorage.removeItem(localStorageKey);
        // }        
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
        console.log(record);
        let checked = false;
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            //TODO: Add is_included in the customer device object. base it from there
            // let checkedItems =JSON.parse(localStorage.getItem(localStorageKey));
            // for (var i in checkedItems){
            //     if(i === this.props.data.id){
            //         checked = true;
            //     }
            // }
            if (column.key === 'action') {
                return <GridCheckboxCell key={key} 
                        id={`${record.id}-${record[key]}`} 
                        callback={(event) => this.updateSelection(event, record.id)} 
                        checked={checked} disabled={false} />
            } else if (column.key === 'material'){
                //verify if material should be highlighted (increase font-weight) or not
                let list = this.props.list;
                //need to test for *DLP* wildcard if bold or not
                let result = list.filter(el => {
                    let str = el.replace("*","").toUpperCase();
                    if(record['material'] === str){
                        return el;
                    }else if(record['material'] !== str){
                        if(record['material'].includes(str) && el.includes("*")){
                            return el;
                        }
                    }else{
                        return [];
                    }
                });
                if(result.length < 1){
                    return <GridTextCell key={key}><b>{record[column.key]}</b></GridTextCell>
                }else{
                    return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
                }
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })
        return(
            <tr key={`${record.id}-${record.material}`}>
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
        this.state = { selectedCount: this.props.selectedCount }
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

export default AddDevice;