import React from 'react';
import Spinner from 'js/universal/spinner/';
import FontAwesome from 'react-fontawesome';
import FetchUtilities from 'js/universal/FetchUtilities';
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables';
import { Modal, ModalHeader, ModalBody, Button, Row, Col, Alert, UncontrolledTooltip } from "reactstrap";

const TABLE_COLUMNS = [
    { key: 'role', label: 'CCB Role', sortable: true },
    { key: 'name', label: 'Primary', sortable: true },
    { key: 'delegate', label: 'Delegate', sortable: true },
    { key: 'changeGrpId', label: 'Change Type', sortable: true },
    { key: 'sbeId', label: 'SBE', sortable: true },
    { key: 'sbeOneId', label: 'SBE1', sortable: true },
    { key: 'sbeTwoId', label: 'SBE2', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'indSec', label: 'Industry Sector', sortable: true },
    { key: 'gidep', label: 'GIDEP', sortable: true },
    { key: 'curFabSite', label: 'Current Fab Site', sortable: true },
    { key: 'curAssy', label: 'Current Assy', sortable: true },
    { key: 'updateATSS', label: 'Update ATSS', sortable: true },
    { key: 'isoDev', label: 'ISO Device', sortable: true },
    { key: 'safeCert', label: 'Safety Certification', sortable: true },
    { key: 'pkgGrp', label: 'Pkg Group', sortable: true },
    { key: 'pachinko', label: 'Pachinko', sortable: true },
    { key: 'niche', label: 'Niche', sortable: true },
    { key: 'dataSource', label: 'Data Source', sortable: true }
];

class AutoSelectApprover extends React.Component{
    constructor(props) {
        super(props);
        let changeNo = this.props.match.params.changeNumber;
        let url = `/api/v1/get_selected_approvers/${changeNo}`;

        this.state = {
            changeNumber: changeNo,
            showSpinner: false,
            message: {},
            disabled: true,
            modalVisible: false,
            url: url
           
        }
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }

    componentDidMount(){
        this.toggleSpinner();
        fetch(`/api/v1/validate_change_auto_select/`+this.state.changeNumber, {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                if (!response.ok) {
                    throw new Error({});
                }else{
                    return response.json();
                }
            }).then((json) =>{
                if(json.count > 0){
                    this.setState({
                        disabled:!this.state.disabled,
                        showSpinner:false
                    })
                }else{
                    this.setState({
                        showSpinner: false,
                        message: json
                    });
                }
            });
    }

    toggleSpinner(){
        this.setState({
            showSpinner: !this.state.showSpinner
        })
    }

    handleApprove() {
        this.toggleSpinner();
        fetch(`/api/v1/auto_select_approvers/`+this.state.changeNumber, {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                if (!response.ok) {
                    throw new Error({});
                }else{
                    return response.json();
                }
            }).then((json) =>{
                this.setState({message : json, showSpinner: false});
            });
            
    }

    toggleModal(){
        this.setState({modalVisible : !this.state.modalVisible});
    }

    render(){
        return(
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                <br />
                <Row>
                    <Col>
                        <h3 style={{'textAlign':'center'}}>Click on the button below to auto-select approvers for the change</h3>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col style={{'textAlign':'center'}}>
                        <Button disabled={this.state.disabled} className="mr-1 mb-1" size="sm" color="primary" onClick={() => this.handleApprove()}>
                            <FontAwesome name="check" /> Auto-select Approvers
                        </Button>
                    </Col>
                </Row>
                <br />

                <Modal
                    isOpen={this.state.modalVisible}
                    toggle={this.toggleModal}
                    fade={true}
                    backdrop={true}
                    size={"lg"} 
                    style={{'maxWidth':'95%'}}>
                    <ModalHeader toggle={this.toggleModal}>
                        <span id="toolTip">Auto Select Approver Criteria</span>
                        <UncontrolledTooltip placement="right" target="toolTip">
                            <p style={{'text-align':'left'}}>Auto Select Approver Criteria: The following CCB Roles were auto selected because the Device attributes had a match on the CCB Role attribute</p>
                        </UncontrolledTooltip>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <ReactiveTable server
                                credentials={'include'}
                                fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                                fetchErrorHandler={FetchUtilities.handleError}
                                striped={true}
                                columnFilters={true}
                                url={this.state.url}
                                ref={(table) => this.table = table}
                                columns={TABLE_COLUMNS} />
                        </Row>
                    </ModalBody>
                </Modal>

                {
                    this.state.message.status === 'success' ? 
                    (
                        <Alert color="success">
                            <Row>
                                <Col sm="10">
                                    <h5>{this.state.message.message}</h5>
                                </Col>
                                <Col sm="2" style={{'text-align':'right'}}>
                                    <Button className="mr-1 mb-1" size="sm" color="info" onClick={() => this.toggleModal()}><FontAwesome name="file" /> Reasons Report</Button>
                                </Col>
                            </Row>
                        </Alert>
                    ) : (
                        this.state.message.count === 0 ? 
                        (
                            <Alert color="danger">
                                <h5>{this.state.message.message}</h5>
                            </Alert>
                        ) : (
                            <br />
                        )
                    )
                }
            </div>
        );
    }
}

export default AutoSelectApprover;