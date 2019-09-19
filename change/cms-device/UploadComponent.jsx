import React from 'react'
import "css/approval-matrix-button-bar.css";
import FetchUtilities from 'js/universal/FetchUtilities';
import { Form, FormGroup, Label, Row, Col, Badge, } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import { ComponentModal, successModal } from 'js/universal/Modals';
import Dropzone from 'react-dropzone';
import Spinner from 'js/universal/spinner'

const allowedFiles = ['xls','xlsx'];

class UploadComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = { 
            acceptedFiles: [],
            spinner: false,
            uploadURL: null
        }
    }

    componentDidMount(){
        if(this.props.uploadAction === 'edit'){
            this.setState({uploadURL : `/api/v1/upload-device-edit?change_no=${this.props.changeNumber}`})
        }else if(this.props.uploadAction === 'add'){
            this.setState({uploadURL : `/api/v1/upload-device-add?change_no=${this.props.changeNumber}&paramType=${this.props.paramType}&includepinpkg=${this.props.includepinpkg}`});
        }
    }

    toggleModal = (modal) =>{
        this.props.toggleModal(modal);
    }

    toggleSpinner = () =>{
        this.setState({
            spinner : !this.state.spinner
        });
    }

    removeAttachment = () => {
        this.setState({
            acceptedFiles: [],
            spinner: false
        });
    }
    
    uploadAttachment = () =>{
        const dataLimit = 20971520;
        let dataSize = 0;
        let files = this.state.acceptedFiles;
        for(var i in files){
            dataSize += files[i].size;
        }
        if(dataSize > dataLimit){
            this.setState({
                activeModal : "info2",
                modalTitle: 'File Size Limit',
                modalColor: 'danger',
                modalMessage: 'File size limit already reached, the application could only accept 20MB of data per upload'
            });
        }else if(files.length !== 0){
            // //show spinner
            this.toggleSpinner();

            let attachments = new FormData();
            this.state.acceptedFiles.forEach((file) => {
                attachments.append("file", file);
            });
            if(this.state.uploadURL !== undefined && this.state.uploadURL !== null && this.state.uploadURL !== ""){
                fetch(this.state.uploadURL, {
                    method: 'POST',
                    body: attachments,
                    credentials: 'include',
                    headers: new Headers({
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    })
                    })
                    .then((response) => { return response.json()})
                    .then((json) => {
                        if(this.props.uploadAction === 'edit'){
                            successModal(json.updatedDevices + " devices " + "of " + json.totalMats + " has been updated" , ()=>{this.setState({acceptedFiles : [], spinner : false})})
                            this.toggleSpinner();
                            this.toggleModal();
                            this.props.tableRefresh();
                            this.props.uploadTable()
                        }else if(this.props.uploadAction === 'add'){
                            this.toggleModal();
                            this.setState({spinner : false})
                            this.props.uploadTable(json);
                        }           
                    })
                    .catch(error => {this.toggleSpinner();
                        FetchUtilities.handleError(error)});
            }
        }
    }

    render(){
        let dropzoneStyle = {
            width: "100% !important",
            height: "65px !important",
            border: "2px dashed #aaa",
            textAlign: "center",
            paddingTop: "20px",
            fontSize: "13px"
        }

        let listCss = {
            listStyle : 'none',
            paddingLeft: '1em'
        }

        return <React.Fragment>
            < ComponentModal
                show={this.props.modalVisible === 'upload'}
                size='md' color='warning' icon='upload' title='Upload File'
                buttons={
                    [{ size:"sm", color: 'primary', outline: true, label: 'Continue', bypassCloseAfterClick: true, onClick: ()=>{this.uploadAttachment();}, disabled: this.state.acceptedFiles.length === 0 },
                    { size:"sm", color: 'secondary', outline: true, label: 'Cancel', onClick: ()=>{this.removeAttachment(); this.toggleModal()} }]
                }>
            <Form>
            {this.state.spinner && this.state.acceptedFiles.length !== 0 ? (
                                        <div className='p-2' style={{ height: '5rem' }}>
                                            <Spinner showSpinner overlay={false} />
                                        </div>
                                    ) : 
                <React.Fragment>
                    
                        <FormGroup>
                            {this.state.acceptedFiles.length === 0 ? 
                            <Dropzone name="uploadFile" 
                                style={dropzoneStyle}
                                // maxSize={MAX_SIZE}\
                                onDrop={(files) => {
                                    let accepted = [];
                                    let rejected = [];
                                    this.removeAttachment();
                                    for(let i in files){
                                        let fileName = files[i].name
                                        let fileExt = fileName.split('.').pop();
                                        if(allowedFiles.some(x=> x === fileExt.toLocaleLowerCase())){
                                            accepted.push(files[i]);
                                        } else {
                                            rejected.push(files[i]);
                                        }
                                    }
                                    if(rejected.length > 0 && accepted.length === 0){
                                        alert("Upload file must be in .xls or xlsx format.");
                                    }else{
                                        this.setState({
                                            acceptedFiles: this.state.acceptedFiles.concat(accepted.pop())
                                        });
                                    }
                                }}
                            >
                                <p><FontAwesome name="plus" color="secondary" /> Click or Drop files here.</p>
                            </Dropzone> : <span></span>
                            }
                        </FormGroup>
                        {this.state.acceptedFiles.length > 0 ?
                        <Row>
                            <Col md="12">
                                <Label>Accepted Files</Label>
                                <ul style={listCss}>
                                    {
                                        this.state.acceptedFiles.map((f, i) => {
                                            return (
                                            <li key={f.name} className="fileList">
                                                <FontAwesome name="times-circle" onClick={() => this.removeAttachment()} />
                                                {' '}{f.name}{' '}
                                                <Badge color="success" pill>{Math.ceil(f.size/(1024*1024))} MB</Badge>
                                            </li>
                                            )
                                        })
                                    }
                                </ul>
                            </Col>
                        </Row> : <span></span>
                        }
                </React.Fragment>
            }

            </Form>    
                    <hr />
                    {this.props.description !== null && this.props.description !== undefined ? this.props.description : ""}
            </ComponentModal>
        </React.Fragment>
    }
}

export default UploadComponent;