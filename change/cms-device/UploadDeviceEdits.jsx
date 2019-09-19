import React, {Component} from 'react'
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables'
import "css/approval-matrix-button-bar.css";
import FetchUtilities from 'js/universal/FetchUtilities';
import { GridTextCell, GridCheckboxCell } from 'js/universal/GridCells';
import {Form,  FormGroup, Label, Row, Col, Badge, Input, Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import { BigBadge } from 'js/app/models/ChangelinkUI'
import { removeFromArray } from 'js/universal/commons';
import { ComponentModal, successModal } from 'js/universal/Modals';
import Dropzone from 'react-dropzone';
import Spinner from 'js/universal/spinner'
import {FormWidgetTextArea, FormWidgetSelect} from 'js/universal/FormFieldWidgets';
import UploadComponent from 'js/app/views/change/cms-device/UploadComponent'

class UploadDeviceEdits extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            modalVisible: undefined,
        }
    }

    toggleModal = (activeModal) => {
        this.setState({modalVisible: activeModal});
    }

    tableRefresh = () => {
        this.props.tableRefresh();
    }

    render(){
        let description = <ol>
                            <li>Upload file must be in .xls or xlsx format. </li>
                            <li>Column sequence must be Material, Status, and Comments.  </li>
                            <li>Materials changing must be within this device list. </li>
                        </ol>
        return(
            <div style={{"display" : "inline-block"}}>
                <Button onClick={()=>{this.toggleModal('upload')}}>Upload Device Edits</Button>
                <UploadComponent uploadAction={'edit'} description={description} modalVisible={this.state.modalVisible} tableRefresh={this.tableRefresh} toggleModal={this.toggleModal} changeNumber={this.props.changeNumber}/>
            </div>
        )
    }
}

export default UploadDeviceEdits;