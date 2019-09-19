import React from 'react';
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables';
import { Table, Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import "css/approval-matrix-button-bar.css";
import FontAwesome from 'react-fontawesome';
import Spinner from 'js/universal/spinner';
import { ConfirmDeleteModal, } from 'js/universal/Modals';
import FetchUtilities from 'js/universal/FetchUtilities';
import AttachmentForm from 'js/app/models/AttachFormDisplay';
import { GridLinkCell, GridTextCell } from 'js/universal/GridCells';
import moment from 'moment';

const dataURL = "/attachsvc/list/";
const reactiveURL = "/api/v1/attachment-list-react/profile/";

class AttachmentDisplay extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            key: 'tbl-files',
            columns: [],
            data: [],
            showSpinner: true
        }
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
    }

    componentWillMount() {
        this.handleLoad();
    }

    componentDidMount() {
        this.setState({ showSpinner: false });
    }

    handleLoad(){
        //show spinner
        this.toggleSpinner();
        //let counter = 0;
        this.setState({
            columns: [
                {
                    key: 'action',
                    label: '',
                    filter: false
                }, {
                    key: "fileName",
                    label: "File Name"
                }, {
                    key: "description",
                    label: "Description"
                }, {
                    key: "uploadedByName",
                    label: "Uploaded By"
                }, {
                    key: "uploadDttm",
                    label: "Uploaded"
                }
            ]
        });

        var query = {
            LOCATION: this.props.loc, //page of the module
            APP_CONTEXT: this.props.context,
            ATTACH_CONTEXT: this.props.id,
        };

        fetch(dataURL+'?'+
            Object.keys(query)
            .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(query[key]))
            .join('&')
            .replace(/%20/g, '+'), 
            {
                method: 'GET',
                credentials: 'include',
                headers: new Headers({
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                })
        })
        .then((response) => response.json())
        .then(result => {
           const dataIn = result;
           this.setState({
              data: dataIn, 
              showSpinner: true 
           })
           //hide spinner
           this.toggleSpinner()
        })
        .catch((ex) => {
            console.error(ex);
            throw ex;
        });
    }

    // Handler for form button onSubmit
    handleFormSubmit(message, isSuccess) {
        this.toggleSpinner(); 
        if (isSuccess) {
            var m = new Date().getMilliseconds();
            this.setState({
                key: 'tbl-files-' + m, // Refresh the table
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });
        } else {
            this.setState({
                notify: 'error',
                notifyText: message,
                formVisible: false // close form
            });
        }

        //Hide the spinner
        this.toggleSpinner(); // no use
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    render() {
        let attachmentRowHide;
        if(typeof this.props.editable === "undefined"){
            attachmentRowHide = true;
        } else {
            attachmentRowHide = this.props.editable;
        }
        return (
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                
                <Table key={this.state.key} className='mt-1' bordered striped size="sm">
                    <thead>
                        <tr>
                            {
                                this.state.columns.map((column, i) => {
                                    return (
                                        <th key={`tblAttach-th-${i}`}>{column.label}</th>
                                    );
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                          !!this.state.data && Array.isArray(this.state.data)
                          ? this.state.data.map((value) => {
                                let uploadDttm = value.uploadDttm;
                                value.uploadDttm = moment(uploadDttm).format("YYYY/MM/DD HH:mm:ss");
                                return (
                                    <AttachmentRow 
                                        editable={attachmentRowHide}
                                        data={value}
                                        columns={this.state.columns}
                                        onSubmit={this.handleLoad}
                                        toggleSpinner={this.toggleSpinner}
                                        canDelete={this.props.canDelete}
                                         />
                                );
                            })
                          : <tr><td colspan={this.state.columns.length}>No data to display</td></tr>
                        }
                    </tbody>
                </Table>
            </div>
        )
    }
}

class AttachmentTab extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            key: 'tbl-files',
            columns: [],
            data: [], 
            fetchURL: reactiveURL
        }
        this.table = null
        this.handleLoad = this.handleLoad.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
    }

    handleLoad() {
        var query = reactiveURL + this.props.context + '/';
        
        if (this.props.id !== '') {
            query = query + this.props.id + '/';
        }

        if (this.props.loc !== '') {
            query = query + this.props.loc + '';
        }
        this.setState({ fetchURL: query });
        
    }

    handleOnSubmit() {
        this.refreshTable()
    }
    
    refreshTable() {
        this.table.refresh()
    }

    componentWillMount() {
        this.handleLoad();
        this.setState({
            columns: [
                {
                    key: 'action',
                    label: '',
                    filter: false
                },
                {
                    key: 'location',
                    label: 'Location',
                }, {
                    key: "fileName",
                    label: "File Name"
                }, {
                    key: "description",
                    label: "Description"
                }, {
                    key: "uploadedByName",
                    label: "Uploaded By"
                }, {
                    key: "uploadDttm",
                    label: "Uploaded"
                }
            ]
        });
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    render() {
        let MyAttachmentRow;    
        let canDelete = this.props.canDelete;
        if(canDelete === undefined || canDelete === null){
            canDelete = true;
        }
        
        if(this.props.editable){
            MyAttachmentRow = (props) => {
                return <AttachmentRow {...props} onSubmit={this.handleOnSubmit} editable={this.props.editable} canDelete={canDelete}/>
            }
        }else{
            MyAttachmentRow = (props) => {
                return <AttachmentEditRow {...props} onSubmit={this.handleOnSubmit} />
            }
        }
       
        return (
            
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="change_attachments_table"
                >
                <ReactiveTable server
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    row={MyAttachmentRow} ref={(table) => this.table = table}
                    columns={this.state.columns}
                    sort={[ ['uploadDttm', 'desc'] ]} // By default, dort by uploadDttm DESC
                    url={this.state.fetchURL}
                    onRowClick={this.handleTableRowClick}
                    onSubmit={this.handleLoad}
                    toggleSpinner={this.props.toggleSpinner}
                    key={this.state.key}
                    striped columnFilters advancedColumns 
                />
                </ReactiveTableStore>
            </div>
        )
    }
}

class AttachmentEditRow extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            editable : this.props.editable
            , canDelete: this.props.canDelete
        }
    }
    render(){
        return <AttachmentRow editable={this.state.editable} //should modify to be dynamic
                              data = {this.props.data}
                              columns = {this.props.columns}
                              onSubmit={this.props.onSubmit}
                              toggleSpinner={this.props.toggleSpinner}  
                              canDelete={this.state.canDelete}/>
                              

    }
}

class AttachmentRow extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            formVisible: false,
            showSpinner: true,
            tableRowData: {},
            editable: this.props.editable
            , canDelete: this.props.canDelete
        }

        this.handleTableRowClick = this.handleTableRowClick.bind(this);
        this.handleFormCancel = this.handleFormCancel.bind(this);
    }

    // Handler for table onRowClick
    handleTableRowClick(row) {
        this.setState({
            tableRowData: row,
            formVisible: true, 
        });
    }

    // Handler for form button onCancel
    handleFormCancel() {
        this.setState({
            tableRowData: this.emptyForm,
            formVisible: false
        });
    }

    render() {
            const record = this.props.data
            const cells = this.props.columns.map((column) => {
                const key = 'column-' + column.key;

                if (column.key === 'action') {
                    return <td key={key}><AttachmentActionCell 
                                            record={record} 
                                            handleTableRowClick={this.handleTableRowClick}
                                            onSubmit={this.props.onSubmit}
                                            toggleSpinner={this.props.toggleSpinner}
                                            editable = {this.props.editable}
                                            canDelete = {this.props.canDelete} /></td>
                }
                 else if(column.key === 'location'){
                    return <td key={key}><AttachmentBadge
                                            record={record}
                                            column={column}
                                            /></td>
                } else {
                    return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
                }
        })

        return (
            <tr>
                {cells}
                <Modal
                    isOpen={this.state.formVisible}
                    toggle={this.toggleForm}
                    fade={true} 
                    backdrop={true}>
                    <ModalHeader toggle={this.toggleForm}>Update Attachment</ModalHeader>
                    <ModalBody>
                        {
                            //Update form 
                        }
                        <AttachmentForm
                            data={this.state.tableRowData}
                            onCancel={this.handleFormCancel}
                            onSubmit={this.props.onSubmit}
                            //toggleSpinner={this.props.toggleSpinner}
                            />
                    </ModalBody>
                </Modal>
            </tr>
        )
    }
}

class AttachmentActionCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableRowData: this.props.record,
            formVisible: false
        }
        this.handleFileDelete = this.handleFileDelete.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
    }

    handleTableRowClick = () => {
        this.props.handleTableRowClick(this.state.tableRowData);
    }

    handleFileDelete(){
        this.setState({
            formVisible: true
        });
    }

    handleFormSubmit(message, isSuccess){     
        if (typeof this.props.onSubmit === 'function') {
            this.props.onSubmit(message, isSuccess);
        }
        this.setState({
            formVisible: false
        });
    }

    toggleModal(e) {
        e.preventDefault();
        this.setState({
          formVisible: !this.state.formVisible
        });
    }

    // Toggles the visibility of the spinner
    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    handleDownload(){
        fetch("/attachsvc/download/"+this.props.record.attachContext
                +"?HASH=" + this.props.record.hash,  
            {
                method: 'GET',
                credentials: 'include',
                headers: new Headers({
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                })
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                if (response.status !== 200) {
                    throw response;
                } else {
                    let blob = new Blob([response.blob], {type: this.props.record.contentType});
                    let a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    let downloadURL = window.URL.createObjectURL(blob);
                    
                    a.href = downloadURL;
                    a.download = this.props.record.fileName;
                    a.click();
                    
                }
                if (typeof this.props.onSubmit === 'function') {
                    this.props.onSubmit('Fail to download the document', true);
                }
            })
            .catch((error) => {
                FetchUtilities.handleError(error);
            });
    }

    handleDelete(e) {
        e.preventDefault();

        // Show the spinner
        this.toggleSpinner(); 

        this.toggleModal(e);
        fetch("/attachsvc/delete?ATTACHMENT_ID=" + this.props.record.id,
            {
                method: 'POST',
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
                if (response.status !== 200) {
                    throw response;
                }
                this.handleFormSubmit('Attachment permanently deleted.', true);
            })
            .catch((error) => {
                FetchUtilities.handleError(error);
            });
    }

    render() {
        let editButton = this.props.editable;
        let canDelete = this.props.canDelete;
        return(
            <React.Fragment>
                {
                    editButton ? (
                        <React.Fragment>
                            <React.Fragment>
                                <ConfirmDeleteModal
                                    show={this.state.formVisible}
                                    message={'You are about to delete the attachment. Deleted attachments cannot be recovered. Do you want to proceed?'}
                                    handleClose={(event) => this.toggleModal(event)}
                                    handleConfirmation={(event) => this.handleDelete(event, this.state.tableRowData.id)}
                                />
                                <a href={window.location.protocol + '//' +
                                    window.location.hostname +
                                    //":8090/attachsvc/download/?ATTACHMENT_ID="+this.props.record.ATTACHMENT_ID}
                                    //":80/attachsvc/download/?ATTACHMENT_ID="+this.props.record.ATTACHMENT_ID}
                                    ":8090/attachsvc/download/?ATTACHMENT_ID=" + this.props.record.id}
                                    download={this.props.record.fileName} className="btn btn-outline-dark btn-sm"><FontAwesome name="arrow-down" /></a>&nbsp;
                                <Button outline size="sm" color="dark"
                                                    onClick={this.handleTableRowClick}
                                                    onSubmit={this.handleFormSubmit}
                                                > <FontAwesome name="pencil" />
                                                </Button>&nbsp;
                            </React.Fragment>

                            
                            <React.Fragment>
                                {
                                    canDelete ? (
                                        <Button outline size="sm" color="dark" onClick={this.toggleModal}><FontAwesome name="trash" /></Button>
                                    ): ''
                                }                                
                            </React.Fragment>                            
                        </React.Fragment>
                    ) : (
                        <span><a href={window.location.protocol + '//' +
                        window.location.hostname +
                        "/attachsvc/download/?ATTACHMENT_ID=" + this.props.record.id}
                        download={this.props.record.fileName} className="btn btn-outline-dark btn-sm"><FontAwesome name="arrow-down" /></a>&nbsp;</span>
                    )
                }
            </React.Fragment>
        ) 
    }
}

class AttachmentBadge extends React.Component {
    render() {
        let url = "";
        let location = this.props.record.location;
        if(location.toLocaleLowerCase().includes("feedback")){
            url=`/feedback/${this.props.record.classification}`;
        }else if(location.toLocaleLowerCase().includes("samples")){
            url=`/sample/${this.props.record.classification}`;
        }
        return (
            <div>
                {
                    this.props.record.classification === null ? (
                        <GridTextCell key={this.props.record[this.props.column.key]}>
                            <Button color="dark" outline disabled >{this.props.record[this.props.column.key]}</Button>
                        </GridTextCell>
                    ) : (
                        <GridLinkCell key={this.props.record.classification} align='center' url={url} newTab>
                            <Button color="dark" outline >{this.props.record[this.props.column.key]}</Button>
                        </GridLinkCell>
                    )
                }
            </div>
        )
    }
}

export { AttachmentDisplay,
    AttachmentTab
}

