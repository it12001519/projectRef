import React, {Component,} from 'react';
import {Alert, Button, Modal, ModalBody, ModalHeader} from 'reactstrap';
import ReactiveTable from 'reactive-tables';
import FontAwesome from 'react-fontawesome';

import FetchUtilities from 'js/universal/FetchUtilities';
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";
import LotForm from 'js/app/views/lots/LotForm';

// Mock data - using static json file in /public/json
const URL = "/json/DP1DM5.json";

// API data
// const URL = "/api/v1/lots";

// Table columns
// For usage, see https://bitbucket.itg.ti.com/projects/SCTMGDT/repos/reactive-tables/browse
const TABLE_COLUMNS = [
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    render: (e) => {
      return (
        <Button size="sm" color="dark" outline className="mr-2 mb-1" title={e.lot}><FontAwesome name="eye" /></Button>
      )
    },
  },
  {
    key: 'lot',
    label: 'Lot',
    sortable: true,
  }, {
    key: 'lpt',
    label: 'LPT',
    sortable: true,
  }, {
    key: 'facility',
    label: 'Facility',
    sortable: true,
  }, {
    key: 'curQty',
    label: 'Qty',
    sortable: true,
  }
];

class LotPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'lot',
      formVisible: false,
      alertVisible: false,
      alertColor: '',
      alertText: '',
      tableRowData: {}
    };
    
    // Bind functions
    this.handleTableRowClick = this.handleTableRowClick.bind(this);
    this.handleAlertClick = this.handleAlertClick.bind(this);
    this.handleFormCancel = this.handleFormCancel.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  // Handler for table onRowClick
  handleTableRowClick(row) {
    this.setState({
      tableRowData: row.data,
      formVisible: true
    });
  }
  
  // Handler for alert click / dismiss
  handleAlertClick() {
    this.setState({
      alertVisible: false,
      alertText: ''
    });
  }

  // Handler for form button onCancel
  handleFormCancel() {
    this.setState({
      formVisible: false
    });
  }

  // Handler for form button onSubmit
  // params: row, isSuccess
  handleFormSubmit(row, isSuccess) {
    // Just an example of setting message and color.
    // Real usage will post data and refresh table.
    // TODO interact with table and refresh
    if(isSuccess) {
      this.setState({
        alertColor: 'success',
        alertVisible: true,
        alertText: 'Success: ' + JSON.stringify(row),
        formVisible: false // close form
      }); 
    } else {
      this.setState({
        alertColor: 'danger',
        alertVisible: true,
        alertText: 'Error: ' + JSON.stringify(row),
        formVisible: false // close form
      }); 
    }
  }

  render() {

    return (
      <div>

        {/* Breadcrumb */} 
        <ChangeLinkBreadcrumb crumbs={[{ text: 'Home', to: "/" }, { text: 'Lots', active: true }]} />

        {/* Alert */} 
        <Alert
          color={this.state.alertColor}
          isOpen={this.state.alertVisible}
          toggle={this.handleAlertClick}>
          {this.state.alertText}
        </Alert>

        {/* ReactiveTable component */}
        <ReactiveTable server
            credentials={'include'}
            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
            //fetchErrorHandler={FetchUtilities.handleError()}
            striped={true}
            columnFilters={true}
            url={URL}
            columns={TABLE_COLUMNS}
            //onRowClick={this.handleTableRowClick}
          />

        {/* Modal wrapping LotForm component */}
        <Modal 
            isOpen={this.state.formVisible} 
            toggle={this.toggleForm} 
            fade={true} >
            <ModalHeader toggle={this.toggleForm}>Lot Detail</ModalHeader>
            <ModalBody>
                <LotForm 
                data={this.state.tableRowData}
                onCancel={this.handleFormCancel}
                onSubmit={this.handleFormSubmit} />
            </ModalBody>
        </Modal>
       
      </div>
    );
  }
}

export default LotPage;
