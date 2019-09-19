import React from 'react';
import {Button, Modal, ModalHeader, ModalBody, Alert, ModalFooter, FormFeedback, Input} from 'reactstrap';
import FetchUtilities from 'js/universal/FetchUtilities';
import {FormWidgetTextArea} from 'js/universal/FormFieldWidgets';
import {InfoModal } from 'js/universal/Modals';
import Validator from 'validatorjs';
import Spinner from 'js/universal/spinner'

var headers = new Headers();
headers.append('pragma', 'no-cache');
headers.append('cache-control', 'no-cache');

let rules = {
    reason: ['required']
};

let message = {
    'required': 'This field is required.'
};
//deleting of devices will depend on the sequence ID based from the toggle of checkboxes from device tab
class DeleteDevice extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            sequence : this.props.sequence,
            count : 0,
            changeNumber : this.props.changeNumber,
            deleteModalVisible: false,
            noSelectedModalVisible: false,
            validity: {},
            errors: {},
            data: {
                reason : null
            },
            showSpinner : false,
            deviceNotif : this.props.deviceNotif,
            changeOwnerId : null
        }
    }

    validate = () => {
        
        let validation = new Validator();
        validation = new Validator(this.state.data, rules, message);

        validation.passes();

        let formValidity = {};
        let formErrors = {};

        Object.keys(this.state.data).forEach(field => {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
          });

          this.setState({
            validity: formValidity,
            errors: formErrors
        });
        return validation.passes();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            sequence: this.props.sequence,
            count: this.props.count,
            changeNumber : this.props.changeNumber
        }, () => {
            this.refresh();
        });
    }

    componentWillMount(){
        let ownerId = "";
        if(this.props.summaryData !== undefined && this.props.summaryData !== null){
            this.props.summaryData.fields.map((o) => {
                if(o.label === "Change Owner"){
                    if(o.value.includes('('))
                        ownerId = o.value.match(/[aAxX]\d{7}|[xX][a-zA-Z\d]{7}/g)
                        if(ownerId && ownerId.length > 0){
                            ownerId = ownerId[0]
                        }
                    else
                        ownerId = o.value
                }
            });
        }
        this.setState({changeOwnerId : ownerId})
    }

    refresh = () => {
        this.setState({
            sequence: this.props.sequence, 
            count: this.props.count,
            changeNumber : this.state.changeNumber
        });
    }

    toggleDeleteModal = () =>{
        this.setState({deleteModalVisible : !this.state.deleteModalVisible})
    }

    handleChange = (name, value) => {
        this.setState((previousState) => {
            return previousState.data = {...previousState.data, [name]: value};
        }, () => this.validate()); 
    }

    toggleSpinner = () => {
        this.setState({showSpinner : !this.state.showSpinner});
    }

    deleteSelected = () => {
        if(this.validate()){
            this.toggleSpinner();
            let data = {
                transacId : this.state.sequence,
                changeNo : this.state.changeNumber,
                reason : this.state.reason,
                deviceNotif : this.state.deviceNotif,
                changeOwnerId : this.state.changeOwnerId
            }
    
            fetch('/api/v1/delete-device', {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }),
                credentials: 'include',
                body: JSON.stringify(data),
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                this.toggleDeleteModal();
                this.toggleSpinner();
                this.props.resetCount();
            })
            .catch((ex) => {
                console.error(ex);
            }).finally(()=>{
                this.props.tableRefresh();  
            });
        }
    }

    render(){
        return(
            <div style={{'display':'inline-block'}}>
                <Spinner showSpinner={this.state.showSpinner} />
                <Modal
                    isOpen={this.state.deleteModalVisible}
                    fade={true}
                    backdrop={true}
                    size={"md"} >
                    <ModalHeader toggle={this.toggleDeleteModal}>Delete Device</ModalHeader>
                    {this.state.sequence !== null && this.state.sequence !== undefined && this.state.sequence !== 0 && this.state.count !== 0 ?
                        <div>
                            <ModalBody>
                                <p>
                                    {this.state.count} record selected to be deleted. Enter a reason for deleting this record and click Continue to delete. The reason will be associated with all selected records. 
                                </p>
                                <FormWidgetTextArea label='Enter Reason' name='reason' value={this.state.data.reason ? this.state.data.reason : ''} id="deleteText" style={{"height":"120px"}} onChange={this.handleChange} required />
                                <Input type="hidden" name="" invalid={!this.state.validity.reason}/>
                                <FormFeedback>{this.state.errors.reason}</FormFeedback>
                            </ModalBody>
                            <ModalFooter>
                                <Button onClick={this.deleteSelected}>Continue</Button>
                                <Button onClick={this.toggleDeleteModal}>Cancel</Button>
                            </ModalFooter>
                        </div> :
                        <div>
                            <InfoModal icon='exclamation-circle' color='danger'
                            title='Error' message={"No device selected. Please select at least one device and try again."}
                            handleClose={() => this.setState({ deleteModalVisible: false })} />
                        </div>
                    }
                </Modal>

                <Button onClick={this.toggleDeleteModal}>Delete Selected</Button>
            </div>
        );
    }
}

export default DeleteDevice;