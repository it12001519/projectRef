import React from 'react';
import FontAwesome from 'react-fontawesome';
import { Row, Col, Button, ButtonGroup, Label } from 'reactstrap';
import { FormWidgetRadioButtonGroup } from 'js/universal/FormFieldWidgets';
import { SearchPCN } from 'js/app/models/TrkLookUp';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';
import FetchUtilities from 'js/universal/FetchUtilities';
import { GridTextCell, GridLinkCell, GridCheckboxCell } from 'js/universal/GridCells';
import { removeFromArray } from 'js/universal/commons';
import { InfoModal } from 'js/universal/Modals';
import {showOverlaySpinner, hideOverlaySpinner} from 'js/universal/spinner';

import "css/approval-matrix-button-bar.css";

const URL = "/api/v1/change/pcn/";
const CHK_INIT_URL = "/api/chk/init/";
const CHK_URL = "/api/chk/toggle/";
const localStorageSelectionList = 'checkedDeviceData';
const ADMIN_ROLES = ['ChangeLink Admin', 'Change Coordinator'];

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

const postHeaders = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache'
  })

const pcnType = [
        {
            label: 'New'
            , value: 'New'
        }, {
            label: 'Addendum'
            , value: 'Addendum'
        }
    ];

const pcnNotificationType = [
        {
            label: 'Initial'
            , value: 'Initial'
        }, {
            label: 'Final'
            , value: 'Final'
        }
    ]

const columns = [
        {
            key: 'action',
            label: ''
        },{
            key: 'changeNumber',
            label: 'Change Number'
        }, {
            key: "material",
            label: "Material"
        }, {
            key: "oldMaterial",
            label: "Old Material"
        }, {
            key: "longPartNumber",
            label: "Long Part Number"
        }, {
            key: "chipName",
            label: "Chip Name"
        }, {
            key: "niche",
            label: "Niche"
        }, {
            key: "pcnRecordStatus",
            label: "Status"
        }, {
            key: "changeState",
            label: "Change Status"
        }, {
            key: "pcnNumbers",
            label: "PCN Numbers"
        }, {
            key: "mccbName",
            label: "MCCB"
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
            label: "SBE-"
        }, {
            key: "ctech",
            label: "CTECH"
        }, {
            key: "prtech",
            label: "PR Technology"
        }, {
            key: "pin",
            label: "Pin"
        }, {
            key: "pkg",
            label: "Package"
        }, {
            key: "xChain",
            label: "X-Chain"
        }, {
            key: "apnFlag",
            label: "aAPN Flag"
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
            key: "enteredBy",
            label: "Entered By"
        }, {
            key: "asOfDate",
            label: "As Of Date"
        }
    ]

const hiddenColumns = ["changeNumber"]

class ChangeCustomerDevice extends React.Component {

    constructor(props) {
        super(props);        
        this.state = {            
            canUpdate: props.hasRole(ADMIN_ROLES)
            , selectedCount: 0  
            , transaction: 0
            , configPcnUrl: ''
            , data: {
                pcnType: 'New'
                , pcnNotificationType: 'Final'
                , pcnNumber: ''
                , changeNumber: this.props.changeNumber 
            }
            , validity: {}
            , errors: {} 
            , canPushToPCN: props.canPushToPCN
        }

        this.table = null;
    }
 
    componentDidMount(){
        sessionStorage.setItem(localStorageSelectionList, JSON.stringify([]));
        this.setState({ selectedCount: 0});
        this.startNewTransaction();
        this.getConfigValues();
    }

    componentWillReceiveProps(nextProps) {        
        this.setState({
            canUpdate: nextProps.hasRole(ADMIN_ROLES)
            , canPushToPCN: nextProps.canPushToPCN
        })
        this.resetCount();
    }   

    getConfigValues = () =>  {
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

    toggleModal = () => {
        this.setState({modalVisible: !this.state.modalVisible});
    }


    toggleMessage = () => {
        this.setState({ alertVisibility: !this.state.alertVisibility })
    }
    

    closeAlertModal = () => {
        this.setState({
            alertType: undefined
        });
    }

    updateCount = (state) => {
        this.setState({
            selectedCount: JSON.parse(sessionStorage.getItem(localStorageSelectionList)).length
        })
    }

    updateSelection = (selectedDevices) => {
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

    resetCount = () => {
        // Clear the contents of selected items stored in session storage
        sessionStorage.setItem(localStorageSelectionList, JSON.stringify([]));
        this.setState({ selectedCount: 0});
        this.startNewTransaction();
    }

    startNewTransaction = () => {
        if(this.state.canUpdate){
            // Start a new transaction for checkboxes
                fetch(CHK_INIT_URL, { credentials: 'include', headers: headers })
                    .then((response) => { return response.json(); })
                    .then((json) => { this.setState({ transaction: json }); })
                    .catch((ex) => { throw ex; });
            }
    }

    selectAll = () => {
        if(this.state.canUpdate) {
            showOverlaySpinner();
            //make sure that the transaction is properly initialized.
            // Clear the contents of selected items stored in session storage
            sessionStorage.setItem(localStorageSelectionList, JSON.stringify([]));
            this.setState({ selectedCount: 0, //isLoading: true
            });

            if (this.state.transaction === 0) {
                // Start a new transaction for checkboxes
                FetchUtilities.fetchGet(CHK_INIT_URL,
                  (httpStatus, response) => {
                    this.setState({ transaction: response });
                    this.fetchSelectAllToggle(true)  
                })
            } else {
              this.fetchSelectAllToggle(true)      
            }
        }
    }

    unselectAll = () => {
        if (this.state.canUpdate) {
          this.fetchSelectAllToggle(false)
        }
    }

    fetchSelectAllToggle = (toggleSelect) => {
      showOverlaySpinner()
      let toggleCommand = toggleSelect ? 'selectallPCNPush' : 'unselectallPCNPush'
      FetchUtilities.fetchGet(`/api/v1/change/pcn/${this.state.data.changeNumber}/${this.state.transaction}/${toggleCommand}?`+this.table.generateUrlQuery(), 
        (httpStatus, response) => {
          let deviceList = response['DEVICES']
          this.updateSelection(deviceList)
          this.setState({ selectedCount: deviceList.length })
          this.tableRefresh()
          hideOverlaySpinner()
        }, _=> hideOverlaySpinner() )
    }

    tableRefresh = () => {
        this.table.refresh();
    }

    handleView(e, viewType){
        e.preventDefault();
    }

    onChange = (name, value) => {
        
        this.setState((previousState) => {
          previousState.data = { ...previousState.data, [name]: value };
          return previousState;
        });
        
      }

    pushToPCN = () => {
        showOverlaySpinner();
        if(this.state.selectedCount === 0 ){
            this.setState(
                {
                    alertMessage: 'Please select device(s).',
                    alertType: 'warning'
                }
            )
            hideOverlaySpinner();
            this.toggleMessage();            
            
        } else {  
            var queryData = this.state.data;
            const URL_PUSH_PCN = '/api/v1/pcn/pushToPCN/' + this.state.transaction;

                FetchUtilities.fetchPost(URL_PUSH_PCN, queryData,
                    (httpStatus, response) => {
                      if (httpStatus === 200 || httpStatus === 201) {
                        this.setState({
                            data: response
                        });
                        this.unselectAll();
                        if (typeof this.props.refresh === 'function') {
                            this.props.refresh() // Refresh the parent page to reflect updated data
                        } else {
                            window.location.reload() // Refresh the whole page as fallback
                        }                     
                      } else if (httpStatus === 400) {   
                        let formErrors = [];
                        let index = 0;                    
                        Object.entries(response.errorDetails).forEach(field => {                          
                          formErrors[index++] = field[1].value + '\r\n';                          
                        });
                        this.setState({
                          errors: formErrors,
                          alertType: 'error'
                        });
                      } else {
                        throw new Error('Transaction failed')
                      }
                      hideOverlaySpinner();
                    }
                  );
                
            }

            
    }

    
    onUpdatePCN = (pcn) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, pcnNumber: pcn.pcn_number };
        });
    }

    render() {            
        let deviceRow = (props)=>{return <PcnDeviceRow {...props} updateCount={this.updateCount.bind(this)} startNewTransaction={this.startNewTransaction.bind(this)} transaction={this.state.transaction} canUpdate={this.state.canUpdate && this.state.canPushToPCN} configPcnUrl={this.state.configPcnUrl}/>};
        
        let customBar = this.state.canUpdate && this.state.canPushToPCN ? (
            <React.Fragment>
          
            <Row>
                <Col>
                    <div className="p-2 clearfix">
                    
                        <Button color="primary" size="sm" className="float-left mr-1" onClick={(event) => this.pushToPCN()}><FontAwesome name="arrow-right" />{' '}Push to PCN</Button> 
                        <CheckAllWidget selectedCount={this.state.selectedCount}
                            selectAllCallback={this.selectAll} unselectAllCallback={this.unselectAll} />
                    
                    </div>
                </Col>
                <div className="p-2 clearfix">
                    <Col>
                    <FormWidgetRadioButtonGroup label='PCN Type' name="pcnType" value={this.state.data.pcnType}   
                        required                                 
                        options={pcnType}
                        onChange={this.onChange} />
                    </Col>
                </div>
                <div className="p-2 clearfix">
                    <Col>
                    <FormWidgetRadioButtonGroup label='PCN Notification Type' name="pcnNotificationType" value={this.state.data.pcnNotificationType}  
                        required                                  
                        options={pcnNotificationType}
                        onChange={this.onChange} />
                    </Col>
                </div>
                <div className="p-2 clearfix">
                    <Col>
                    {
                        this.state.data.pcnType === 'Addendum'
                                                              ? (
                                                                  <React.Fragment>
                                                                      <Label for="pcnNumber"> PCN Number: </Label>
                                                                      <SearchPCN onUpdate={this.onUpdatePCN} selected={this.state.data.pcnNumber} url='/api/v1/lookup/allPcns' required/>                                       
                                                                 </React.Fragment>
                                                              ) : ''
                                                          }
                    </Col>
                </div>
            </Row>
                                                
                </React.Fragment>
            ): undefined;

        return (
            <React.Fragment>
                <ReactiveTableStore server credentials={'include'} tableId="pcnPush">
                    <ReactiveTable server
                        credentials={'include'}
                        ref={(table) => this.table = table}
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        row={deviceRow}
                        striped columnFilters advancedColumns
                        columns={columns}
                        hiddenColumns={hiddenColumns}
                        customTopBar={customBar}
                        url={URL + this.state.data.changeNumber}
                    />
                </ReactiveTableStore>
                <InfoModal
                    show={this.state.alertType === 'warning' || this.state.alertType === 'error'}
                    icon="exclamation-circle"
                    color= {this.state.alertType === 'warning'? "warning": "danger"}
                    title={this.state.alertType === 'warning'? "Invalid Input": "Error"}
                    message={this.state.alertType === 'error'? this.state.errors: this.state.alertMessage}
                    handleClose={this.closeAlertModal}
                />
            </React.Fragment>
        )
    }

}

class PcnDeviceRow extends React.Component{
    constructor(props){
        super(props);
        this.state={
            data: this.props.data
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data
        });
    }

    updateSelection = (e) => {
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

        if(this.props.transaction === 0 || this.props.transaction === '0'){
            this.props.startNewTransaction();
        }

        fetch(`${CHK_URL}?ctx=CHG_CHGPCNPUSHDEV&tid=${this.props.transaction}&eid=${this.state.data.material}&chk=${isChecked}`,
                { method: 'POST', credentials: 'include', headers: headers })
                .then((response)=>{
                    if(isChecked){
                        selectionList.push(this.state.data.material);
                    }else{
                        removeFromArray(selectionList, this.state.data.material);                        
                    }
                    
                    sessionStorage.setItem(localStorageSelectionList, JSON.stringify(selectionList));
                    this.props.updateCount(e);
                })
                .catch((ex) => { throw ex });        
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
        
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === 'action') {
                if(this.props.canUpdate){
                    return <GridCheckboxCell key={key} 
                    id={`${record['material']}`} 
                    callback={(event) => {this.updateSelection(event)}} 
                    checked={isChecked} disabled={!record['canPushToPCN']} /> 
                }
                                   
            } else if (column.key === 'pcnNumbers') {
                return <GridLinkCell key={key} external={true} url={this.props.configPcnUrl + record['pcnNumbers']}>{record[column.key]}</GridLinkCell>                
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })
        return(
            <tr key={`${record.material}-${record.orderableMaterial}`}>
                {cells}
            </tr>
        );
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

export default ChangeCustomerDevice
