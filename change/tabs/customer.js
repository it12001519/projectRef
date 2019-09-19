import React from 'react';
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables';
import { Modal, ModalHeader, ModalBody, Button, Table, } from "reactstrap";
import { GridTextCell, } from 'js/universal/GridCells';
import "css/approval-matrix-button-bar.css";
import FetchUtilities from 'js/universal/FetchUtilities';

const URL = "/api/v1/customers/";

class CustomerTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    key: 'wwCustomerNumber',
                    label: 'WW Customer Number'
                }, {
                    key: "wwCustomerName",
                    label: "WW Customer Name"
                }, {
                    key: "soldToNumber",
                    label: "Sold To Customer Number"
                }, {
                    key: "soldToName",
                    label: "Sold To Customer Name"
                }, {
                    key: "endCustomerName",
                    label: "End Customer Name"
                }, {
                    key: "contactEmail",
                    label: "Contact Type"
                }, {
                    key: "orderableMaterial",
                    label: "Device"
                }, {
                    key: "customerPart",
                    label: "Customer Part"
                },{
                    key: "customerCategory",
                    label: "Customer Category"
                }, {
                    key: "profitCtrName",
                    label: "Profit Ctr Name"
                }, {
                    key: "industrySector",
                    label: "Industry Sector"
                }, {
                    key: "dataSource",
                    label: "Data Source"
                }, {
                    key: "custRegion",
                    label: "Region"
                }, {
                    key: "sbe",
                    label: "SBE"
                }, {
                    key: "sbe1",
                    label: "SBE-1"
                }, {
                    key: "relClass",
                    label: "Rel Class"
                }
            ],
            data: []
        }
    }

    render() {
        const customerUrl = URL + this.props.changeNumber;
        return (
            <div>
                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="customers_table"
                >
                <ReactiveTable server
                    ref={()=>{}}
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    striped columnFilters advancedColumns
                    columns={this.state.columns}
                    url={customerUrl}
                    row={CustomerRow}
                />
                </ReactiveTableStore>
            </div>
        )
    }
}

class CustomerRow extends React.Component {

    state = {
        formVisible: false,
        tableRowData: {}
    }

    // Handler for table onRowClick
    handleModal = (row) => {
        this.setState({
            tableRowData: row,
            formVisible: true
        })
    }

    // Handler for form button onCancel
    handleFormCancel = () => {
        this.setState({
            tableRowData: [],
            formVisible: false
        })
    }

    render() {
        const record = this.props.data;
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;

            if (column.key === 'contactEmail') {
                return <td key={key}>
                    <CustomerActionCell
                        record={record}
                        handleModal={this.handleModal} />
                </td>
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })

        return (
            <tr key={`${record.device}-${record.orderable_material}`}>
                {cells}
                <Modal
                    isOpen={this.state.formVisible}
                    toggle={this.toggleForm}
                    fade={true}
                    backdrop={true}
                    size={"lg"}>
                    <ModalHeader toggle={this.toggleForm}>Contact Information</ModalHeader>
                    <ModalBody>
                        <CustomerDetails record={this.state.tableRowData}
                            onCancel={this.handleFormCancel} />
                    </ModalBody>
                </Modal>
            </tr>
        )
    }
}

class CustomerDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.record,
            contactData: null
        }
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentWillReceiveProps(next) {
        this.setState({
            contactData: null,
        }, () => {
            this.refresh();
        });
    }

    refresh() {
        // Fetch the latest set of data
        fetch("/api/v1/contacts/" + this.props.record.soldToNumber, {
            credentials: 'include', headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.setState({ contactData: json });
            })
            .catch((ex) => {
                FetchUtilities.handleError(ex);
                throw ex;
            });
    }
    componentDidMount() {
        this.refresh();
    }

    // Handler for form cancel
    handleCancel(e) {
        e.preventDefault();
        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
    }
    render() {
        let contactInfo;
        if (this.state.contactData !== null) {

            contactInfo = this.state.contactData.content.map((e) => {
                return (
                    <tr key={e.contactEmail}>
                        <td><a href={`mailto:${e.contactEmail}`}>{e.contactEmail}</a></td>
                        <td>{e.contactName}</td>
                    </tr>
                )
            });
        } else {
            contactInfo = <tr></tr>
        }
        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contactInfo}
                    </tbody>
                </Table>
                <Button color="secondary" outline onClick={(event) => this.handleCancel(event)} className="mr-1 float-right">Close</Button>
            </div>
        )
    }
}

class CustomerActionCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            formVisible: false
        }
        this.handleModal = this.handleModal.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    componentWillMount() {
        this.refresh();
    }

    componentWillReceiveProps(next) {
        this.setState({
            data: this.props.record,
        }, () => {
            this.refresh();
        });
    }

    refresh(){
        this.setState({
            data: this.props.record
        })
    }

    handleModal = () => {
        this.props.handleModal(this.state.data);
    }
    render() {
        let customerType = "";
        if (this.state.data.contactEmail === "Internal") {
            customerType = <Button color="info" onClick={this.handleModal}>Internal</Button>
        } else if (this.state.data.contactEmail === "External") {
            customerType = <Button color="warning" onClick={this.handleModal}>External</Button>
        } else if (this.state.data.contactEmail === "None") {
            customerType = <Button color="danger" disabled onClick={this.handleModal}>None</Button>
        }
        return customerType
    }
}

export default CustomerTab
