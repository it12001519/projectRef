import React, { Component, } from 'react';
import styled from 'styled-components';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';
import { BigBadge } from 'js/app/models/ChangelinkUI'
import { Button, Alert, InputGroup, InputGroupAddon, InputGroupText } from "reactstrap";
import "css/impl-matrix-button-bar.css";
import FetchUtilities from 'js/universal/FetchUtilities';
import { Link } from "react-router-dom";
import { GridActionCell } from 'js/universal/GridCells';
import Spinner, { showOverlaySpinner, hideOverlaySpinner } from 'js/universal/spinner'
import { ComponentModal } from 'js/universal/Modals';

const URL ="/api/v1/implMatrix";
const GLANCE_URL ="/api/v1/implMatrixGlance";
const DET_URL ="/api/v1/implMatrixDetails";
const RECALC_URL = "/api/v1/implRecalc";
const EMAIL_TRIG = "/api/v1/triggerRevertedEmail";

// Set up the default headers to disable browser cache fetches
var headers = new Headers();
headers.append('pragma', 'no-cache')
headers.append('cache-control', 'no-cache')

const TABLE_COLUMNS = [
  {
      key: 'implStatus',
      label: ''
  },
  {
      key: 'changeNo',
      label: 'Change No'
  },
  {
      key: 'pcnNo',
      label: 'PCN'
  },
  {
      key: 'orderableMaterial',
      label: 'Orderable Material'
  },
  {
      key: 'tiMaterial',
      label: 'TI Material'
  },
  {
      key: 'oldMaterial',
      label: 'Old Material'
  },
  
  {
      key: 'niche',
      label: 'Niche'
  },
  {
      key: 'pin',
      label: 'Pin'
  },
  {
      key: 'pkg',
      label: 'Pkg'
  },
  {
      key: 'pkgGroup',
      label: 'Pkg Group'
  },
  {
      key: 'sbe',
      label: 'SBE'
  },
  {
      key: 'sbe1',
      label: 'SBE-1'
  },
  {
      key: 'sbe2',
      label: 'SBE-2'
  },
  {
      key: 'reason',
      label: 'Reason'
  },
  {
      key: 'approvedImplDate',
      label: 'Date Approved to Implement'
  } ,
  {
      key: 'additionalInfo',
      label: ''
  } 
];

const hiddenColumns = ["oldMaterial","sbe2","tiMaterial","niche","pin","pkg","pkgGroup"];

class ImplementationMatrixTab extends Component {

  constructor(props){
      super(props);
      this.state = {
          jobNo : (this.props.changeNumber !== null && this.props.changeNumber !== undefined ? this.props.changeNumber : ''),
          URL : (this.props.URL === undefined || this.props.URL === null ? URL  + "/" + (this.props.changeNumber !== null && this.props.changeNumber !== undefined ? this.props.changeNumber : '') : this.props.URL) /*+ "?source="+this.props.source*/,
          columns : TABLE_COLUMNS
      }
  }
  
  componentWillMount(){
      if(this.props.source == 'Change'){
          var columnValues = this.state.columns;
          const dataRemoved = columnValues.filter((el) => {
          return el.key !== "changeNo";
          });
          this.setState({
              columns: dataRemoved
          });
      } else if(this.props.source == 'PCN' && this.props.reportMode != 'Y'){
          var columnValues = this.state.columns;
          const dataRemoved = columnValues.filter((el) => {
          return el.key !== "pcnNo";
          });
          this.setState({
              columns: dataRemoved
          });
      }
  }


  postRecalc = (method, data) => {
      let v_identifier = this.props.pcnNumber;
      if(this.props.source == 'Change'){
          v_identifier = this.props.changeNumber;
      }

      let R_URL = `${RECALC_URL}`
      R_URL = this.props.source === "PCN" ? `${RECALC_URL}?identifier=${this.props.pcnNumber}` : R_URL
      R_URL = this.props.source === "Change" ? `${RECALC_URL}?identifier=${this.props.changeNumber}` : R_URL
      R_URL = R_URL  + "&source="+this.props.source


      showOverlaySpinner()

      fetch(R_URL,
          {
              method: 'POST',
              headers: new Headers({
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Pragma': 'no-cache',
                  'Cache-Control': 'no-cache'
              }),
              credentials: 'include',
          })
          .then(FetchUtilities.checkStatusWithSecurity)
          .then((response) => { return response.json() })
              .then((response) => {
                      hideOverlaySpinner();
                      this.table.refresh();
                      this.glance.refresh();
              })
              .catch((error) => {
                  hideOverlaySpinner()
                  this.table.refresh();
                  this.glance.refresh();
              });
    }

    postEmail = (method, data) => {
      showOverlaySpinner();
      fetch(EMAIL_TRIG,
          {
              method: 'POST',
              headers: new Headers({
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Pragma': 'no-cache',
                  'Cache-Control': 'no-cache'
              }),
              credentials: 'include',
          })
          .then(FetchUtilities.checkStatusWithSecurity)
          .then((response) => { return response.json() })
              .then((response) => {
                      hideOverlaySpinner();
              })
              .catch((error) => {
                  hideOverlaySpinner()
              });
    }

  render() {
      let matrixRow = (props) => {
          return <ImplMatrixRow {...props} changeNumber = {this.props.changeNumber} reportMode = {this.props.reportMode} />
      };
      let { ...other } = this.props;
      //basing on the change number, check if the data is created before 2014
      let isOlder = false;
      if (this.props.changeNumber !== null && this.props.changeNumber !== undefined){
          if(Number(this.props.changeNumber.substring(1,3)) < 14){
              isOlder = true;
          }
      }else if(this.props.pcnNumber !== null && this.props.pcnNumber !== undefined){
          if(Number(this.props.pcnNumber.substring(0,4)) < 2014){
              isOlder = true;
          }
      };
      
      let customBar = (
          this.props.reportMode === "Y" ? undefined :  
          <div className="p-2 clearfix">
              <Button color="primary" size="sm" className="float-left mr-1" onClick={this.postRecalc}>Refresh Matrix</Button>
              {/*TODO: remove this when merging back to 2.0
                   <Button color="primary" size="sm" className="float-left mr-1" onClick={this.postEmail}>Trigger Email</Button> 
              */}
              <ImplMatrixAtaGlanceBar {...other} ref={(glance) => this.glance = glance} />
          </div>
      );

      return (
          <div>
              {isOlder ? (
                  <Alert color="warning">Changes/PCNs created/issued before 2014 do not have Implementation Matrix.</Alert>
              ) : (
                  <ReactiveTableStore
                      credentials={'include'}
                      server
                      tableId= { this.props.tableId === undefined || this.props.tableId === null ? "implMatrix_table" : this.props.tableId }
                  >
                  <ReactiveTable server
                  ref={(table) => this.table = table}
                  credentials={'include'}
                  fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                  fetchErrorHandler={FetchUtilities.handleError}
                  striped columnFilters advancedColumns
                  url={this.state.URL}
                  row={matrixRow}
                  hiddenColumns = {hiddenColumns}
                  customTopBar={!!customBar ? customBar : undefined}
                  columns={this.state.columns}
                  
                  />
                  </ReactiveTableStore>)
              }
          </div>
      )
  }
}

class ImplMatrixAtaGlanceBar extends React.Component {

  constructor(props) {
      super(props);

      this.state = {
          count: {
              ready: '',
              notApproved: '',
              pending: '',
              obsolete: '',
              reverted: '',
              total: ''
          }
      }
  }

  componentDidMount() {
      this.refresh();
  }

  refresh = () => {
      let G_URL = `${GLANCE_URL}`
      G_URL = this.props.source === "PCN" ? `${GLANCE_URL}?pcnNumber=${this.props.pcnNumber}` : G_URL
      G_URL = this.props.source === "Change" ? `${GLANCE_URL}?changeNumber=${this.props.changeNumber}` : G_URL
      G_URL = G_URL  + "&source="+this.props.source

      FetchUtilities.fetchGet(G_URL,
          (httpStatus, response) => {
              this.setState({ count: response}) 
          }
      )
  }

  render() {

      return (
          <div className="approval-matrix-glance-bar float-right">
              <InputGroup size="sm">
                  <InputGroupAddon addonType="prepend">
                      <InputGroupText className="alert-dark"><b>Total:</b>&nbsp; {this.state.count.total}</InputGroupText>
                      <InputGroupText className="alert-success"><b>Ready:</b>&nbsp; {this.state.count.ready}</InputGroupText>
                      <InputGroupText className="alert-warning"><b>Pending:</b>&nbsp; {this.state.count.pending}</InputGroupText>
                      <InputGroupText className="alert-danger"><b>Not Ready:</b>&nbsp; {this.state.count.notReady}</InputGroupText>
                      <InputGroupText className="alert-danger"><b>Reverted:</b>&nbsp; {this.state.count.reverted}</InputGroupText>
                      <InputGroupText className="alert-secondary"><b>Obsolete:</b>&nbsp; {this.state.count.obsolete}</InputGroupText>
                  </InputGroupAddon>
              </InputGroup>
          </div>
      )
  }
}

class ImplMatrixRow extends Component {
  constructor(props){
      super(props);
      this.state = {
          implDetailsModal : false,
          changeNo: this.props.data['changeNo'] || this.props.changeNumber,
          pcnNo: this.props.data['pcnNo'],
          orderableMaterial: this.props.data['orderableMaterial'],
          reason: this.props.data['reason'],
          spinner: false,
          drilldownRecord : null
      }
  }

  toggleSpinner = () => {
      this.setState({
          spinner : !this.state.spinner
      })
  }

  toggleImplDetails = (changeNo, pcnNo, orderableMaterial) => {
      this.setState({
          implDetailsModal: !this.state.implDetailsModal
      });
      this.setState({
          spinner : true
      })

      if(!this.state.implDetailsModal){
          this.setState({
              drilldownRecord : null
            });
            
          FetchUtilities.fetchPost(DET_URL, this.props.data,
              (httpStatus, response) => {
                  this.setState({
                      spinner : false
                  })
                if (httpStatus === 200 || httpStatus === 201) {
                    if(response){
                        this.setState({
                          drilldownRecord : response
                        });
                    }
                    
                } else {
                  throw new Error('Error in getting the Implementation Matrix Drilldown Report');
                }
              }, _=> this.toggleSpinner()
            )
      }
  }

  render() {
      const record = this.props.data;
      const implMoreDetailsBtn = [
          {'icon' : 'info-circle', 'title': 'Implementation Matrix Row Info', 'callback': () => { (() => {this.toggleImplDetails()})(); }}
      ]
      const cells = this.props.columns.map((column) => {
          const key = 'column-' + column.key;

          if(column.key === 'implStatus') {
              return <td key={key}><StatusIndicator record={record} /></td>
          } else if(this.props.reportMode === "Y" && column.key=== "changeNo"){
              return <td key={key}>
                      <Link to={"/change/" + record[column.key]}>
                              {record[column.key]}
                      </Link>
              </td>
          } else if(this.props.reportMode === "Y" && column.key=== "pcnNo"){
              return <td key={key}>
                      <Link to={"/pcn/" + record[column.key]}>
                              {record[column.key]}
                      </Link>
              </td>
          }else if (column.key === "additionalInfo"){
              if(record['implStatus'] === 'Not Ready' || record["reason"].includes("X-Chain") || record['implStatus'] === 'Reverted' 
              ){
                  return (
                      <React.Fragment>
                      <GridActionCell key={"action"+key} buttons={implMoreDetailsBtn}/>
                      <td style={{ display: 'none' }} key={key + "hidden"}>
                          <ComponentModal 
                              show={this.state.implDetailsModal}
                              handleClose={() => this.toggleImplDetails(undefined)}
                              color="info"
                              title="Implementation Matrix Drilldown"
                              buttons={[{ color: 'secondary', outline: true, label: 'Close', onClick: ()=>{this.toggleImplDetails()} }]}>
                                  {this.state.spinner ? (
                                      <div className='p-2' style={{ height: '5rem' }}>
                                          <Spinner showSpinner overlay={true} />
                                      </div>
                                  ) : this.state.drilldownRecord ? 
                                      <React.Fragment> 
                                         { this.state.drilldownRecord.QUAL ?
                                      
                                          <p> <span style={{ fontWeight: 'bold' }}>Qual Pending: </span>The following Quals are not in Approved state:
                                              <ul>
                                                  {this.state.drilldownRecord.QUAL.map((item)=>{
                                                  return <React.Fragment><li>{item.QUAL_ID} - {item.STATUS}</li></React.Fragment>;
                                              })}
                                              </ul>
                                          </p>
                                          : <span></span>
                                         }
                                         { this.state.drilldownRecord.PCN_PENDING ?
                                              <p> <span style={{ fontWeight: 'bold' }}>PCN Pending: </span>{this.props.data['orderableMaterial']} has not been sent out for:
                                                  <span>
                                                      <ul>
                                                          {this.state.drilldownRecord.PCN_PENDING.map((item)=>{
                                                          return <React.Fragment><li><span style={{ fontWeight: 'bold' }}>{item.SOLD_TO_CUSTNAME} ({item.SOLD_TO_CUSTNO})</span> - {item.STATUS}</li></React.Fragment>;
                                                      })}
                                                      </ul>
                                                  </span>
                                              </p>
                                              : <React.Fragment>{this.props.data['reason'].includes("PCN Pending") ? <p>PCN has not yet been assigned for {this.props.data['orderableMaterial']}.</p> : <span></span>}</React.Fragment>  
                                          }
                                          { this.state.drilldownRecord.DEVICE_RETRACTED ?
                                              <p> <span style={{ fontWeight: 'bold' }}>Device Retracted: </span>
                                                          {this.state.drilldownRecord.DEVICE_RETRACTED.map((item)=>{
                                                          return <React.Fragment>Device {item.ORDERABLE_MATERIAL} ({item.STATUS}) has been retracted in PCN{item.PCN}.</React.Fragment>;
                                                      })}
                                              </p>
                                              : <span></span>
                                          }
                                          { this.state.drilldownRecord.CUSTOMER_APPROVAL ?
                                              <p> <span style={{ fontWeight: 'bold' }}>Customer Approval Pending: </span> {this.props.data['orderableMaterial']} has not been approved for:
                                                  <span>
                                                      <ul>
                                                          {this.state.drilldownRecord.CUSTOMER_APPROVAL.map((item)=>{
                                                          return <React.Fragment><li><span style={{ fontWeight: 'bold' }}>{item.CUSTOMER_NAME} ({item.CUSTOMER_NUMBER})</span> - {item.SHORT_TEXT}</li></React.Fragment>;
                                                      })}
                                                      </ul>
                                                  </span>
                                              </p>
                                              : <p><span></span></p>
                                          }
                                          { this.state.drilldownRecord.REVISION_EXPIRATION ?
                                              <p> <span style={{ fontWeight: 'bold' }}>PCN Revision has not expired: </span>
                                                          {this.state.drilldownRecord.REVISION_EXPIRATION.map((item)=>{
                                                          return <React.Fragment>The expiration date for the latest revision of {this.props.data['orderableMaterial']} in PCN{item.PCN_NUMBER} is on <span style={{ fontWeight: 'bold' }}>{item.DATE_EXPIRATION}</span>.</React.Fragment>;
                                                      })}
                                              </p>
                                              : <p><span></span></p>
                                          }
                                          { this.state.drilldownRecord.CANCELLED ?
                                              <p> <span style={{ fontWeight: 'bold' }}>PCN Cancelled: </span>A Revision Type = Cancellation has been sent out for {this.props.data['orderableMaterial']} to the following customers:
                                                  <span>
                                                      <ul>
                                                          {this.state.drilldownRecord.CANCELLED.map((item)=>{
                                                          return <React.Fragment><li>PCN{item.PCN_NUMBER} <span style={{ fontWeight: 'bold' }}>{item.CUSTOMER_NAME} ({item.CUSTOMER_NUMBER})</span></li></React.Fragment>;
                                                      })}
                                                      </ul>
                                                  </span>
                                              </p>
                                              : <React.Fragment><span></span></React.Fragment> 
                                              
                                          }
                                          { this.state.drilldownRecord.LTB ?
                                              <p> <span style={{ fontWeight: 'bold' }}>Wait PCN Expiration: </span>
                                                          {this.state.drilldownRecord.LTB.map((item)=>{
                                                          return <React.Fragment>The Last Date to Buy (LTB) for {this.props.data['orderableMaterial']} has not yet passed (<span style={{ fontWeight: 'bold' }}>{item.LTB}</span>).</React.Fragment>;
                                                      })}
                                              </p>
                                              : <p><span></span></p>
                                          }
                                          { this.state.drilldownRecord.MCCB ?
                                              <p> <span style={{ fontWeight: 'bold' }}>CCB Status: </span>
                                                          <ul>
                                                          {this.state.drilldownRecord.MCCB.map((item)=>{
                                                          let itemName =  item.MCCB_NAME === "TBD" ? this.props.data['changeNo'] : item.MCCB_NAME;
                                                          return <React.Fragment><li>{itemName} is in {item.CHANGE_STATE} state. </li></React.Fragment>;
                                                      })}</ul>
                                              </p>
                                              : <p><span></span></p>
                                          }
                                          { this.state.drilldownRecord.ERROR ?
                                              <p> <span style={{ fontWeight: 'bold' }}>Revision Error: </span>
                                                          <ul>
                                                          <li>One of the PCN revisions in the revisions tab has an error. (Marked with ?)</li> </ul>
                                              </p>
                                              : <p><span></span></p>
                                          }
                                          { this.state.drilldownRecord.XCHAIN ?
                                              <p> <span style={{ fontWeight: 'bold' }}>X-Chain 19: </span>
                                                          <span>
                                                              <ul>
                                                                  <li>{this.props.data['orderableMaterial']} is obsolete.</li> 
                                                              </ul>
                                                          </span>
                                              </p>
                                              : <p><span></span></p>
                                          }
                                          { this.state.drilldownRecord.PSCA ?
                                              <p> <span style={{ fontWeight: 'bold' }}>PSCA Certificate Pending: </span>
                                                          <ul>
                                                          <li>{this.props.data['orderableMaterial']} has a certification hold.</li> </ul>
                                              </p>
                                              : <p><span></span></p>
                                          }
                                      </React.Fragment> :
                                      <div></div>                                      
                                  }
                          </ComponentModal>                           
                      </td>
                      </React.Fragment>
                  )
              }
              else{
                  return <td key={key}></td>
              }
          }
          else {
              return <td key={key}><ImplMatrixDefaultCell record={record} column={column}/></td>
          }
      })
      return (
          <tr>{cells}</tr>
      )
  }
}

class StatusIndicator extends Component {
  render() {
      const {implStatus} = this.props.record
      let statusColor = 'warning'
      statusColor = implStatus === 'Ready' ? 'success' : statusColor;
      statusColor = implStatus === 'Obsolete' ? 'secondary' : statusColor;
      statusColor = implStatus === 'Not Ready' || implStatus === 'Reverted'? 'danger' : statusColor;
       return <div><BigBadge color={statusColor}>{implStatus}</BigBadge></div>
  }
}

class ImplMatrixDefaultCell extends Component {
  render() {
      try{
      return <span>{this.props.record[this.props.column.key]}</span>
      }catch(err){
          throw err;
      }
  }
}

export default styled(ImplementationMatrixTab)`
.chkSolitary
{
  margin-left: 0 !important;
}
`;

