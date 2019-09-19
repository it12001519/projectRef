import React from 'react'
import { withRouter } from "react-router-dom";
import withLayout from "js/app/models/withLayout";
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";
import ReactiveTable, { ReactiveTableStore, }  from "reactive-tables";
import { Modal, ModalBody, ModalHeader,  Alert  } from 'reactstrap';
import Editrevision from "../sample/Editrevision";
import { GridLinkCell, GridTextCell, GridActionCell } from "js/universal/GridCells";
import FetchUtilities from "js/universal/FetchUtilities";
import PcnRevisionsList from 'js/app/views/home/tabs/PcnRevisionsList'

const BASE_URL = "/api/v1/pageableSampleRevisions";
const ADMIN_ROLES = ['System Admin','ChangeLink Admin','PCN Coordinator'];

class SampleRevisionListPage extends React.Component {

    columns = [
        {
            key: 'actions',
            label: '',
            sortable: false,
        },{
        key: 'id',
        label: 'ID',
        sortable: true, 
        filterable: true
    },
    { 
        key: 'daysToExpir',
        label: 'Revision',
        sortable: true,
        filterable: true
    }, { 
        key: 'pcnNumber',
        label: 'PCN Number',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleType',
        label: 'PCN Type',
        sortable: true,
        filterable: true
    }, {
        key: 'dateNotif',
        label: 'Date Notification',
        sortable: true,
        filterable: true
    }, {
        key: 'comments',
        label: 'Comments',
        sortable: true,
        filterable: true
    }, {
        key: 'dateExpir',
        label: 'Days To Expire',
        sortable: true,
        filterable: true
    }, {
        key: 'dateExpiration',
        label: 'Expiration Date',
        sortable: true,
        filterable: true
    }, {
        key: 'lastDayOrder',
        label: 'Last Day To Order',
        sortable: true,
        filterable: true
    }, {
        key: 'lastDayShip',
        label: 'Last Day Ship',
        sortable: true,
        filterable: true
    }, {
        key: 'fileName',
        label: 'File Name',
        sortable: true,
        filterable: true
    }]

    constructor(props) {
        super(props);

        this.state = {
            formVisible: false,
            handleDelete: false,
            alertVisible: false,
            alertColor: '',
            alertText: '',
            tableRowData: {},
            columns: [],
            formVisible2:false,
            data: [],
            canUpdate: props.hasRole(ADMIN_ROLES)
        };

        // Bind functions
        this.handleButton = this.handleButton.bind(this);
        this.handleFormCancel = this.handleFormCancel.bind(this);
        this.toggleForm = this.toggleForm.bind(this);     
        this.toggleForm2 = this.toggleForm2.bind(this);
   
        this.toggleForm = this.toggleForm.bind(this);        
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
               canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    toggleForm(row) {
        this.setState({
            tableRowData: row,
            formVisible: !this.state.formVisible
        });
    }

    toggleForm2(row) {
        this.setState({
            tableRowData: row,
            formVisible2: !this.state.formVisible2
        });
    }
    
    handleButton(row) {
        let chg = this.props.changeNumber

        if (chg === 'undefined' || chg == null) {
            this.setState({
                tableRowData: row.data,
                formVisible3: true,
                change: this.props.changeNumber

            });

        }
        else {
            this.setState({
                tableRowData: row.data,
                formVisible: true,
                change: this.props.changeNumber

            });

        }
    }

    // Handler for form button onCancel
    handleFormCancel() {
        this.setState({
            formVisible: false,
            formVisible2: false,
            formVisible3: false,
            handleDelete: false

        });
    }

    handleDelete(id) {
        // Show the spinner
        this.toggleSpinner();

        this.toggleDeleteModal(undefined);
        fetch(URL + '/' + id,
            {
                method: 'DELETE',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }),
                credentials: 'include',
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(() => {
                this.handleFormSubmit('Announcement permanently deleted.', true);
            })
            .catch((error) => {
                this.handleFormSubmit(error, false);
            });
    }  
   
    render() {
        let columns = JSON.parse(JSON.stringify(this.columns));

        const crumbs = [
            {
                text: 'Home',
                to: "/"
            }, {
                text: 'PCN Revisions',
                active: true
            }
        ]

        return <div>

            <ChangeLinkBreadcrumb crumbs={crumbs}/>

            <ReactiveTable
                server
                striped columnFilters advancedColumns
                credentials='include'
                fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                fetchErrorHandler={FetchUtilities.handleError}
                row={DeviceListRow}
                columns={columns}
                url={BASE_URL }
                canUpdate={this.state.canUpdate}
                // customTopBar={customBar}
                // mirrorCustomTopBar
            />
                    <Modal
                        isOpen={this.state.formVisible}
                        toggle={this.toggleForm}
                        data={this.state.tableRowData}
                        fade={true}>
                        <ModalHeader toggle={this.toggleForm}>Edit Revision</ModalHeader>
                        <ModalBody>
                            <Editrevision
                                onCancel={this.handleFormCancel}
                                onDelete={this.handleDelete}
                                />
                        </ModalBody>
                    </Modal>
        </div>
    }

}

class DeviceListRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            formVisible2: false,
            handleDelete: false,
            deleteModal: false,
            showSpinner: true,
            tableRowData: {},
            canUpdate: this.props.table.props.canUpdate
            //canUpdate: props.hasRole(ADMIN_ROLES)
        }

        // Bind functions
        this.handleFormCancel = this.handleFormCancel.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.toggleForm2 = this.toggleForm2.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
               canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    handleFormSubmit(message, isSuccess) {
        if (isSuccess) {
            this.setState({
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });

            // HACK: Refresh the page. Once available, only refresh ReactiveTables.
            window.location.reload(true);
        } else {
            this.setState({
                notify: 'error',
                notifyText: message,
                formVisible: false // close form
            });
        }

        // Hide the spinner
        this.toggleSpinner();
    }

    toggleForm(row) {
        this.setState({
            tableRowData: row,
            formVisible: !this.state.formVisible 
           // formVisible2: !this.state.formVisible2 
        });
    }
    toggleForm2(row) {
        this.setState({
            tableRowData: row,
            formVisible2: !this.state.formVisible2
           // formVisible2: !this.state.formVisible2 
          
        });
    }
    handleFormCancel() {
        this.setState({
            tableRowData: this.emptyForm,
            formVisible: false,
            formVisible2: false
        });
    }
 
    render() {
        const record = this.props.data;
        let buttons='';

        if(!this.state.canUpdate)
        {                         
            buttons = [
                { 'icon': 'eye', 'title': 'Edit', 'callback': () => this.toggleForm2(record) }
                    ];              
                           
              }
        else
        {        
                buttons = [
                    { 'icon': 'pencil', 'title': 'Edit', 'callback': () => this.toggleForm(record) },
                    { 'icon': 'eye', 'title': 'Edit', 'callback': () => this.toggleForm2(record) }
                ];
        
         }

        const cells = this.props.columns.map(column => {
            const key = 'column-' + column.key;
            if (column.key === 'actions') {
                //  alert(record.pcnNumber)
                return <GridActionCell key={key} buttons={buttons} />
            }
            if (column.key === "sampleSampleNumber") {
                const sampleUri = "/sample/" + record.sampleSampleNumber
                return <GridLinkCell key={key} url={sampleUri}>{record[column.key]}</GridLinkCell>
            } else if (column.key === "cmsCmsNumber") {
                const changeUri = "/change/" + record.cmsCmsNumber
                return <GridLinkCell key={key} url={changeUri}>{record[column.key]}</GridLinkCell>
            } else if (column.key === "pcnNumber") {
                const changeUri = "/pcn/" + record.pcnNumber
                return <GridLinkCell key={key} url={changeUri}>{record[column.key]}</GridLinkCell>
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })

        return <tr>{cells}
                        <Modal
                        isOpen={this.state.formVisible}
                        toggle={this.toggleForm}
                        fade={true}>
                        <ModalHeader toggle={this.toggleForm}>Edit Revision</ModalHeader>
                        <ModalBody>
                        <Alert color="primary">
                              It can take up to 15 minutes for the changes to reflect in the Revision Tab.
                            </Alert>
                            <Editrevision
                                data={this.state.tableRowData}
                                onCancel={this.handleFormCancel}
                                onDelete={this.handleDelete} />
                        </ModalBody>
                    </Modal>
                    <Modal
                            isOpen={this.state.formVisible2}
                            toggle={this.toggleForm2}
                            fade={true}
                            size="lg">
                            <ModalHeader toggle={this.toggleForm2}>Devices List</ModalHeader>
                            <ModalBody>
                            <PcnRevisionsList
                            data={this.state.tableRowData}
                            id={this.props.data.id}
                            onCancel={this.handleFormCancel}
                            onSubmit={this.handleFormUpdateSubmit}
                            onDelete={this.handleDelete}/>
                            </ModalBody>
                 </Modal>
        </tr>
    }
}

export default withLayout(withRouter(SampleRevisionListPage))