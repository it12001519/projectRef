import React from 'react';
import {Button, Modal, ModalBody, ModalHeader, Col, Input, Label, Row, Badge, FormFeedback, FormGroup} from "reactstrap";
import FontAwesome from 'react-fontawesome';
import Spinner from 'js/universal/spinner';
import classnames from 'classnames';
import { InfoModal} from 'js/universal/Modals';

import Dropzone from 'react-dropzone';
const allowedFiles = [
    "zip", "7z", "msg", "css", "csv", "eml",
    "gif", "html", "json", "nsf", "oth", "opf",
    "oxt", "osf", "odc", "otc", "odf", "odft",
    "odi", "oti", "odp", "otp", "ods", "ots",
    "odt", "sxc", "stc", "sxw", "stw", "pic",
    "rtf", "rtx", "sql", "bmp", "rar", "doc",
    "docx", "xls", "xlsx", "ppt", "pptx", "txt",
    "csv", "pdf", "jpg", "jpeg", "png", "tiff",
    "xml"
];

const blockedFiles = [
    "action", "apk", "app", "bat", "bin", "cmd",
    "com", "command", "cpl", "csh", "dll", "exe", "gadget",
    "inf", "ins", "inx", "ipa", "isu", "job", "jse",
    "ksh", "lnk", "msc", "msi", "msp", "mst", "osx",
    "out", "paf", "pif", "prg", "ps1", "reg", "rgs",
    "run", "scr", "sct", "shb", "shs", "u3p", "vb",
    "vbe", "vbs", "vbscript", "workflow", "ws", "wsf",
    "wsh", "oxe", "73k", "89k", "a6p", "ac", "acc", "acr",
    "actm", "ahk", "air", "app", "arscript", "as", "asb",
    "awk", "azw2", "beam", "btm", "cel", "celx", "chm",
    "cof", "crt", "dek", "dld", "dmc", "docm", "dotm",
    "dxl", "ear", "ebm", "ebs", "ebs2", "ecf", "eham",
    "elf", "es", "ex4", "exopc", "ezs", "fas", "fky", "fpi",
    "frs", "fxp", "gs", "ham", "hms", "hpf", "hta", "iim",
    "ipf", "isp", "jar", "js", "jsx", "kix", "lo", "ls",
    "mam", "mcr", "mel", "mpx", "mrc", "ms", "mxe", "nexe",
    "obs", "ore", "otm", "pex", "plx", "potm", "ppam", 
    "ppsm", "pptm", "prc", "pvd", "pwc", "pyc", "pyo",
    "qpx", "rbx", "rox", "rpj", "s2a", "sbs", "sca", "scar",
    "scb", "script", "smm", "spr", "tcp", "thm", "tlb", 
    "udf", "upx", "url", "vlx", "vpm", "wcm", "widget",
    "wiz", "wpk", "wpm", "xap", "xbap", "xlam", "xlm",
    "xlsm", "xltm", "xqt", "xys", "zl9"
];
class AttachmentField extends React.Component { 
    constructor(props) {
        super(props)
        this.state = { 
            formVisible: false
        }
        this.handleModal = this.handleModal.bind(this);
        this.handleFormCancel = this.handleFormCancel.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);

    }    

    handleModal(e){
        e.preventDefault();
        this.setState({
            formVisible: true
        });
    }

    handleFormCancel() {
        this.setState({
            formVisible: false
        });
    }

    handleFormSubmit(message, isSuccess) {
        if (typeof this.props.onSubmit === 'function') {
            this.props.onSubmit(message, isSuccess);
        }
        this.setState({
            formVisible: false
        });
    }


    render() {
        return (
            <div className={this.props.className}>                
                    <Button color="secondary" size="sm" onClick={(event) => this.handleModal(event)}><FontAwesome name="paperclip" /> Add Attachment</Button>
                    <Modal
                        isOpen={this.state.formVisible}
                        fade={true} 
                        backdrop={true}
                        size="md">
                        <ModalHeader toggle={this.toggleForm}>Attachments</ModalHeader>
                        <ModalBody>
                            <AttachmentFieldUI 
                                id={this.props.id}
                                loc={this.props.loc}
                                classification={this.props.classification}
                                context={this.props.context}
                                onCancel={this.handleFormCancel} 
                                onSubmit={this.handleFormSubmit} 
                            />
                        </ModalBody>
                    </Modal>
            </div>            
        )
    }
}

//
// TODO - add component to foundational services library
//
class AttachmentFieldUI extends React.Component{
    constructor(props) {
        super(props)
        this.state = { 
          acceptedFiles: [],
          rejectedFiles: [],
          description: '',
          showSpinner: true,
          activeModal: null,
          modalColor: '',
          modalTitle: '',
          modalMessage: ''
        }
        this.handleCancel = this.handleCancel.bind(this);
        this.validate = this.validate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.closeNotifModal = this.closeNotifModal.bind(this);
        this.removeAttachment = this.removeAttachment.bind(this);
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }
    // Validator
    // TODO move into external function
    validate(e) {
        const form = e.target;
        const formLength = form.length;
        if (formLength !== undefined) {
        // Form validation - onSubmit
        let retValue = true;
        for (let i = 0; i < formLength; i++) {
            const elem = form[i];
            if (elem.nodeName.toLowerCase() !== 'button') {
            if (!elem.checkValidity()) {
                elem.className = classnames('form-control', { 'is-invalid': true });
                retValue = false;
            } else {
                elem.className = classnames('form-control', { 'is-valid': true });
            }
            }
        }
        return retValue;
        } else {
        // Single input validation - onChange
        const elem = e.target;
        if (elem.nodeName.toLowerCase() !== 'button') {
            if (!elem.checkValidity()) {
            elem.className = classnames('form-control', { 'is-invalid': true });
            return false;
            } else {
            elem.className = classnames('form-control', { 'is-valid': true });
            return true;
            }
        }
        return true;
        }
    }

    componentDidMount() {
        this.setState({ showSpinner: false });
    }

    handleChange(e) {
        // Prevent legacy form post
        e.preventDefault();
    
        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
    
        // Validate
        this.validate(e);
    
        // Set state using function to granularly modify data
        this.setState((previousState) => {
          return previousState.data = { ...previousState.data, [name]: value };
        });
    }

    // Mods
    
    // handleFormSubmit(message, isSuccess) {
    //     //hide spinner
    //     this.toggleSpinner();
    //     if (typeof this.props.onSubmit === 'function') {
    //            this.props.onSubmit(message, isSuccess);
    //        }
    //     //clear
    //     // Set state using function and callback to eliminate async issues
    //     this.setState({
    //         page: + data.currentPage
    //     }, () => {
    //         this.search()
    //     })
    //     this.setState((prevState, props) => ({
    //         // counter: prevState.counter + props.increment
    //         acceptedFiles: prevState.acceptedFiles.filter(file => file.name !== message)
    //       }));
    //     this.setState(prevState => ({ 
    //         acceptedFiles: prevState.acceptedFiles.filter(file => file.name !== message) 
    //     }));

    //     // Else, hide form and clean rejectedFiles
    //     this.setState({
    //         // acceptedFiles: [],
    //         // rejectedFiles: [],
    //         formVisible: false,
    //     });        
    // }

    // handleCancel(e) {
    //     e.preventDefault();
    //     if (typeof this.props.onCancel === 'function') {
    //       this.props.onCancel();
    //     }
    // }

    // saveAttachments() {
        
    //     //show spinner
    //     this.toggleSpinner();
    //     var query = {
    //         LOCATION: this.props.loc, //page of the module
    //         APP_CONTEXT: this.props.context,
    //         ATTACH_CONTEXT: this.props.id,
    //         DESCRIPTION: this.state.description
    //     };
    //     let attachments = new FormData();

    //     this.state.acceptedFiles.forEach((file) => {
    //         attachments.append(file.name, file);
    //         this.handleFormSubmit(file.name, true);
    //     });

    //     // fetch(`/attachsvc/upload?` +
    //     //     Object.keys(query)
    //     //     .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(query[key]))
    //     //     .join('&')
    //     //     .replace(/%20/g, '+'), {
    //     //     method: 'POST',
    //     //     body: attachments,
    //     //     credentials: 'include',
    //            headers: new Headers({
    //                'Pragma': 'no-cache',
    //                'Cache-Control': 'no-cache'
    //            })
    //     //     }).then((response) => {           
    //     //     if (!response.ok) {
    //     //         this.handleFormSubmit(file.name, false);
    //     //     }else{
    //     //         this.handleFormSubmit(file.name, true);
    //     //     }
    //     //     });
    // }

    // Original

    handleFormSubmit(message, isSuccess) {
        //hide spinner
        this.toggleSpinner();
        if (typeof this.props.onSubmit === 'function') {
            this.props.onSubmit(message, isSuccess);
        }
        this.setState({
            formVisible: false
        });
        
    }

    handleCancel(e) {
        e.preventDefault();
        if (typeof this.props.onCancel === 'function') {
          this.props.onCancel();
        }
    }

    saveAttachments() {        
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
            //show spinner
            this.toggleSpinner();
            var query = {
                LOCATION: this.props.loc || "", //page of the module
                APP_CONTEXT: this.props.context || "",
                ATTACH_CONTEXT: this.props.id || "",
                CLASSIFICATION: this.props.classification || "",
                DESCRIPTION: this.state.description || ""
            };
            let attachments = new FormData();

            this.state.acceptedFiles.forEach((file) => {
                attachments.append(file.name, file);
            });

            fetch(`/attachsvc/upload?` +
                Object.keys(query)
                .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(query[key]))
                .join('&')
                .replace(/%20/g, '+'), {
                method: 'POST',
                body: attachments,
                credentials: 'include',
                headers: new Headers({
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                })
                }).then((response) => {           
                if (!response.ok) {
                    this.handleFormSubmit('Error encountered.', false);
                }else{
                    this.handleFormSubmit('File Uploaded.', true);
                }
                });
        }else{
            this.setState({
                activeModal : "info2",
                modalTitle: 'No Selected Files',
                modalColor: 'info',
                modalMessage: 'Select a file/s to upload'
            });
        }
    }

    closeNotifModal(){
        this.setState({activeModal:null})
    }

    removeAttachment(i) {
        let newArr = []
        this.state.acceptedFiles.map((item, j) => {
          if (j !== i) {
            newArr.push(this.state.acceptedFiles[j])
            return this.state.acceptedFiles[j]
          } else {
            return undefined
          }
        })
        this.setState((previousState) => {
          previousState = { ...previousState, 'acceptedFiles': newArr };
          previousState.values = { ...previousState.values, 'acceptedFiles': newArr.length > 0 ? 'value' : undefined };
          return previousState;
        });
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
        const MAX_SIZE = 20971520; // 20MB
        return(
            <div className={this.props.className}>
                <Spinner showSpinner={this.state.showSpinner} />
                <InfoModal
                show={this.state.activeModal === 'info2'}
                icon="exclamation-circle"
                color={this.state.modalColor}
                title={this.state.modalTitle}
                message={this.state.modalMessage}
                handleClose={this.closeNotifModal}
                />
                <Row>
                    <Col md="12">
                        <Dropzone name="uploadFile" 
                            style={dropzoneStyle}
                            // maxSize={MAX_SIZE}
                            onDrop={(files) => {
                                let accepted = [];
                                let rejected = [];
                                for(let i in files){
                                    let fileName = files[i].name
                                    let fileExt = fileName.split('.').pop();
                                    if(blockedFiles.includes(fileExt.toLocaleLowerCase())){
                                        rejected.push(files[i]);
                                    } else {
                                        accepted.push(files[i]);
                                    }        
                                }
                                this.setState({
                                    acceptedFiles: this.state.acceptedFiles.concat(accepted),
                                    rejectedFiles: this.state.rejectedFiles.concat(rejected)
                                });
                            }}
                        >
                            <p><FontAwesome name="plus" color="secondary" /> Click or Drop files here.</p>
                        </Dropzone>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input
                                name="description"
                                value={this.state.description ? this.state.description : ''}
                                onChange={this.handleChange}
                                type="textarea" maxLength="140"
                                required />
                            <FormFeedback>Maximum of 140 characters</FormFeedback>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <hr />
                        <Label>Accepted Files</Label>
                        <ul style={listCss}>
                            {
                                this.state.acceptedFiles.map((f, i) => {
                                    return (
                                      <li key={f.name} className="fileList">
                                        <FontAwesome name="times-circle" onClick={() => this.removeAttachment(i)} />
                                        {' '}{f.name}{' '}
                                        <Badge color="success" pill>{Math.ceil(f.size/(1024*1024))} MB</Badge>
                                      </li>
                                    )
                                  })
                                // this.state.acceptedFiles.map(f => <li key={f.name} className="fileList">{f.name}&nbsp;
                                // <Badge color="success" pill>{f.size} Bytes</Badge></li>)
                            }
                        </ul>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <hr />
                        <Label>Rejected Files</Label>
                        <ul style={listCss}>
                            {
                                this.state.rejectedFiles.map(f => <li key={f.name} className="fileList">{f.name}&nbsp;
                                <Badge color="danger" pill>{Math.ceil(f.size/(1024*1024))} MB</Badge></li>)
                            }
                        </ul>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <Button color="secondary" outline onClick={(event) => this.handleCancel(event)} className="mr-1 float-right">Close</Button>
                        <Button color="primary"  className="mr-1 float-right" onClick={(event) => this.saveAttachments(event)}><FontAwesome name="arrow-up" />{' '}Upload</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default AttachmentField
