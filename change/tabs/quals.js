import React from 'react';
import FetchUtilities, { fetchPost,} from 'js/universal/FetchUtilities'
import { GridTextCell, GridActionCell } from 'js/universal/GridCells';
import { InfoModal, ComponentModal, ConfirmDeleteModal } from 'js/universal/Modals';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';
import { FloatNotifySuccess, } from 'js/app/models/FloatNotification';
import QualForm from "js/app/views/change/QualForm";
import { warningModal} from 'js/universal/Modals'
import { showOverlaySpinner, hideOverlaySpinner, } from 'js/universal/spinner'

const BASE_URL = "/api/v1/qualInfo/";
const URL_QUAL_DELETE = '/api/v1/qual/deleteQualInfo'
//const BASE_URL = "/json/qualInfo.json";

const columns = [
    {
        key: 'row-edit',
        label: '',
        sortable: false,
        filterable: false
    },
    {
        key: 'qualLink',
        label: 'Qual ID'
    }, {
        key: 'qualTitle',
        label: 'Qual Title'
    }, {
        key: 'qualQreName',
        label: 'QRE'
    }, {
        key: 'qualStatus',
        label: 'Qual Status'
    }, {
        key: 'qualStatusDttm',
        label: 'Status Date'
    },
    {
        key: 'qualCompleteDttm',
        label: 'Forecast Qual Completion'
    },
    {
        key: 'gating',
        label: 'Implementation Matrix Gating'
    },
    {
        key: 'conditionalAccepted',
        label: 'Implementation Matrix Conditionally Accepted'
    }
]

class QualInfoTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeModal: null
        }
        this.table = null;
        this.toggle = this.toggle.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    toggle(index) {
        this.setState({
            activeModal: index
        });
    }
    
    refreshTable() {
        this.table.refresh();
    }

    // Handler for form button onSubmit
    handleFormSubmit(message, isSuccess) {
        if (isSuccess) {
            this.setState({
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });

            // HACK: Refresh the page. Once available, only refresh ReactiveTables.
            // window.location.reload(true);
            this.table.refresh();
        } else {
            this.setState({
                notify: 'error',
                notifyText: 'Error: ' + message,
                formVisible: false // close form
            });
        }

    }

    render() {
        let URL = BASE_URL + this.props.changeNumber;
        let data = {
            changeNo: this.props.changeNumber
        }
        let qualRow = (props) => { return <QualRow {...props} changeNo={this.props.changeNumber} handleFormSubmit={this.handleFormSubmit} refresh={this.refreshTable}/> };

        return (
            <div>
                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="qualInfo_table"
                >
                <ReactiveTable server
                    url={URL}
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    columns={columns}
                    row={qualRow}
                    ref={(table) => this.table = table}
                    mirrorCustomTopBar
                    striped columnFilters advancedColumns />
                </ReactiveTableStore>

                <ComponentModal show={this.state.activeModal !== null}
                    title= {this.state.activeModal + ' Qual Info'}>
                    <QualForm onSubmit={this.handleFormSubmit} data={data} refresh={this.refreshTable} toggle={this.toggle} />
                </ComponentModal>
                {
                    /* Notify for success/failure/error */
                    this.state.notify === 'success' ? (
                        <FloatNotifySuccess message={this.state.notifyText} />
                    ) : this.state.notify === 'error' ? (
                        <InfoModal show={this.state.notify === 'error'} icon='exclamation-circle' color='danger'
                            title='Error' message={this.state.notifyText}
                            handleClose={() => {this.setState({
                                notify : null
                            })}} />
                    ) : undefined
                }
            </div>
        )
    }

}

class QualRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeModal: null
        }
        this.toggle = this.toggle.bind(this);
    }

    toggle(index) {
        this.setState({
            activeModal: index
        });
    }

    deleteQual = () => {
        showOverlaySpinner()
        fetchPost(URL_QUAL_DELETE,
            JSON.stringify(this.props.data),
            (httpStatus, response) => {
                if (httpStatus >= 200 && httpStatus < 300) {
                    this.props.refresh();
                    hideOverlaySpinner()
                    this.toggle(null)
                } else {
                    warningModal(response.message)
                }
            }, _ => hideOverlaySpinner()
        )
    }

    render() {
        const buttons = [
            { 'icon': 'pencil', 'title': 'Edit', 'callback': () => { this.toggle('Edit') } },
            { 'icon': 'trash', 'title': 'Delete', 'callback': () => { this.toggle('Delete') } }
        ];

        const addbutton = [
            { 'icon': 'plus', 'title': 'Edit', 'callback': () => { this.toggle('Add') } },
        ];

        const record = this.props.data
        const cells = this.props.columns.map((column, index) => {
            const key = 'column-' + column.key + index;
            if (column.key === 'row-edit') {
                if(record == null || record['qualId'] == null)
                    return <GridActionCell key={key} buttons={addbutton} />
                else
                    return <GridActionCell key={key} buttons={buttons} />
            }
            else if(record == null || record['qualId'] == null){
                return <GridTextCell key={key}>&nbsp;</GridTextCell>
            }
            else if (column.key === 'qualLink') {
                return <td key={key}><a href={record['qualLink']} target="_new">{record['qualId']}</a></td>
            } else {
                if(column.key == 'gating' && record[column.key] === null){
                    return <GridTextCell key={key}>Yes</GridTextCell>
                }else if(column.key == 'conditionalAccepted' && record[column.key] === null){
                    return <GridTextCell key={key}>No</GridTextCell>
                }
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        });

        return (
            <tr>
                {cells}
                <td style={{ display: 'none' }}>
                    <ComponentModal show={this.state.activeModal === 'Edit' || this.state.activeModal === 'Add'}
                        title={'Update Qual Info'}>
                        <QualForm data={record} changeNo={this.props.changeNo} onSubmit={this.props.handleFormSubmit} refresh={this.props.refresh} toggle={this.toggle} />
                    </ComponentModal>
                    <ConfirmDeleteModal
                        show={this.state.activeModal === 'Delete'}
                        message={'You are about to delete a Qual Info. This actions is not recoverable. Would you like to proceed?'}
                        handleClose={() => this.toggle(null)}
                        handleConfirmation={() => this.deleteQual()}
                    />
                </td>
            </tr>
        )
    }
}

export default QualInfoTab;
