import React, {Component} from 'react'
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables'
import FetchUtilities from 'js/universal/FetchUtilities';
import { GridTextCell, GridCheckboxCell, GridActionButton, GridActionCell } from 'js/universal/GridCells';
import {Button, ButtonGroup, Modal, ModalHeader, ModalBody, Row, Col, Input, Alert, FormText, Label, Form, ModalFooter } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import { BigBadge } from 'js/app/models/ChangelinkUI';
import { removeFromArray } from 'js/universal/commons';
import Spinner, { showOverlaySpinner, hideOverlaySpinner, } from "js/universal/spinner";

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

const localStorageKey = 'checkedAddDeviceByChipNameData';
//Similar with add device component
class AddDeviceByChipName extends React.Component{
    constructor(props){
        super(props);
        this.state = {
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
            changeNumber : this.props.changeNumber,
            chipNameModalVisible: false,
            chipNameURL : null,
            sequence : null,
            showSpinner : false
        }
        this.tableRefresh = this.tableRefresh.bind(this);
    }

    componentWillMount(){
        localStorage.clear(localStorageKey);
        localStorage.removeItem(localStorageKey);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            changeNumber : this.props.changeNumber
        }, () => {
            this.refresh();
        });
    }

    refresh = () => {
        this.setState({
            changeNumber : this.props.changeNumberM
        });
    }

    toggleChipnameModal = () => {
        this.setState({chipNameModalVisible : !this.state.chipNameModalVisible});
    }

    tableRefresh() {
        this.table.refresh();
    }

    updateCount = (state) => {
        var obj = JSON.parse(localStorage.getItem(localStorageKey));
        this.setState({selectedCount : obj === undefined || obj === null ? 0 : Object.keys(obj).length});
    }

    toggleSpinner = () => {
        this.setState({
            showSpinner : !this.state.showSpinner
        })
    }

    handleClick = () => {
        if(this.props.changeNumber !== null && this.props.changeNumber !== undefined){
            this.toggleSpinner();
            fetch(`/api/v1/add-device/add-more-device/${this.props.changeNumber}/chipName`, { credentials: 'include', headers: headers })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                if(json !== null && json !== undefined){
                    return json
                }else{
                    return null
                }
            })
            .then((json) => {
                this.setState({chipNameURL : `/api/v1/search-candidate-device/${json}`, sequence : json});
                this.toggleSpinner();
                this.toggleChipnameModal();
                return json
            })
            .then((json) => {
                this.selectAll();
            })
            .catch((ex) => { 
                FetchUtilities.handleError(ex);
                throw ex; });
        }
    }

    updateCount = (state) => {
        var obj = JSON.parse(localStorage.getItem(localStorageKey));
        this.setState({selectedCount : obj === undefined || obj === null ? 0 : Object.keys(obj).length});
    }

    saveDevices = () => {
        this.toggleSpinner();
        fetch(`/api/v1/candidate-device/save/${this.state.sequence}/${this.props.changeNumber}/${this.props.deviceNotif}`, { credentials: 'include', headers: headers })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
            this.toggleChipnameModal();
            this.props.tableRefresh();
            this.toggleSpinner();
        })
        .catch((ex) => { 
            FetchUtilities.handleError(ex);
            throw ex; });
    }

    selectAll = () => {
      showOverlaySpinner()
      FetchUtilities.fetchGet(`/api/v1/candidate-device/${this.state.sequence}/selectAll?${this.table.generateUrlQuery()}`,
      (httpStatus, response) => {
            localStorage.clear(localStorageKey);
            localStorage.removeItem(localStorageKey);
            let isExist = {};
            for(let i in response){
                isExist[`${response[i].id}`] = JSON.parse(`{"orderableMaterial":"${response[i].id}"}`);
                localStorage.setItem(localStorageKey, JSON.stringify(isExist));
            }
            this.setState({selectedCount : response.length})
            this.tableRefresh();
            hideOverlaySpinner()
        }, _=> hideOverlaySpinner() )
    }

    unselectAll = (e) => {
        e.preventDefault();
        showOverlaySpinner()
        FetchUtilities.fetchGet(`/api/v1/candidate-device/${this.state.sequence}/unselectAll`,
        (httpStatus, response) => {
            localStorage.clear(localStorageKey)
            localStorage.removeItem(localStorageKey);
            this.tableRefresh();
            this.setState({selectedCount : 0});
            hideOverlaySpinner()
        }, _=> hideOverlaySpinner() )
    }

    render(){
        let customBar = <div className="p-2 clearfix">
                            <CheckAllWidget selectedCount={this.state.selectedCount}
                                            selectAllCallback={this.selectAll} unselectAllCallback={this.unselectAll} />
                        </div>
        let addDeviceRow = (props) => {return <AddDeviceRow {...props} updateCount={this.updateCount.bind(this)} sequence={this.state.sequence}/>}
        return(
            <div style={{'display':'inline-block'}}>
                <Spinner showSpinner={this.state.showSpinner} />
                <Modal
                    isOpen={this.state.chipNameModalVisible}
                    fade={true}
                    backdrop={true}
                    size={"lg"} 
                    style={{'maxWidth':'95%'}} >
                    <ModalHeader toggle={this.toggleChipnameModal}>Add Device By Chipname</ModalHeader>
                    <ModalBody>
                        {this.state.chipNameURL !== null && this.state.chipNameURL !== undefined ? 
                            <ReactiveTable server
                            credentials={'include'}
                            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                            fetchErrorHandler={FetchUtilities.handleError}
                            striped columnFilters advancedColumns
                            columns={this.state.columns}
                            ref={(table) => this.table = table}
                            customTopBar={customBar}
                            row={addDeviceRow}
                            url={this.state.chipNameURL} /> : undefined
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.saveDevices}>Add Devices</Button>
                        <Button onClick={this.toggleChipnameModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <Button onClick={this.handleClick}>Add Device by Chipname</Button>
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
        let isExist = localStorage.getItem(localStorageKey);
        isExist = isExist ? JSON.parse(isExist) : {};
        isExist[`${this.state.data.id}`] = JSON.parse(`{"orderableMaterial":"${this.state.data.material}"}`);
        localStorage.setItem(localStorageKey, JSON.stringify(isExist));
    }

    deleteItem(id){
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
                        callback={(event) => this.updateSelection(event, record.id)} 
                        checked={checked} disabled={false} />
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

export default AddDeviceByChipName;