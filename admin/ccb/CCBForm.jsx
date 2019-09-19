import React, { Component, } from 'react';
import { Button, Form, FormGroup, Label, Input, Col, Modal, ModalHeader, ModalBody, FormFeedback} from 'reactstrap';
import withLayout from 'js/app/models/withLayout';
import {Link} from "react-router-dom";
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import Validator from 'validatorjs';
import Select from 'react-select';
import update from 'immutability-helper';
import Required from "js/universal/Required";
import CreatableSelect from 'react-select/lib/Creatable';
import ReactiveTable from 'reactive-tables';
import LDAPSearchInput from 'js/universal/LDAPSearchInput';
import classnames from 'classnames';
import { ConfirmModal } from 'js/universal/Modals';
import Spinner from 'js/universal/spinner';

let headers = new Headers({
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
})

let rules = {
    name: ['required'],
    ccb: ['required'],
    role: ['required'],
};

let copyRules = {
    name: ['required'],
    ccb: ['required'],
    role: ['required'],
    roleCount: ['regex:/[N]/']
}

let message = {
    'required': 'This field is required.',
    'regex': 'Role name already exists. Please enter a new role name.'
};

class CCBForm extends Component {
    constructor(props) {
        super(props);
           var initialState = {
               show:true,
               activeModal: null,
               modalVisible: false,            
               data: {
                id: this.props.location.state.data['id'] || null,
                ccb: this.props.location.state.data['ccb'] || null,
                role: this.props.location.state.data['role'] || null,
                roleId: this.props.location.state.data['roleId'] || null,
                position: this.props.location.state.data['position'] || null,
                name: this.props.location.state.data['name'] || null,
                delegate:  this.props.location.state.data['delegate'] || null,
                ccbStatus: this.props.location.state.data['ccbStatus'] || '1',
                changeGrp: this.props.location.state.data['changeGrp'] || null,
                changeGrpId: this.props.location.state.data['changeGrpId'] || null,
                changeType: this.props.location.state.data['changeType'] || null,
                sbe: this.props.location.state.data['sbe'] || null,
                sbeId: this.props.location.state.data['sbeId'] || null,
                sbeOne: this.props.location.state.data['sbeOne'] || null,
                sbeOneId: this.props.location.state.data['sbeOneId'] || null,
                sbeTwo: this.props.location.state.data['sbeTwo'] || null,
                sbeTwoId: this.props.location.state.data['sbeTwoId'] || null,
                customer: this.props.location.state.data['customer'] || null,
                indSec: this.props.location.state.data['indSec'] || null,
                gidep: this.props.location.state.data['gidep'] || null,
                applicationPhase: this.props.location.state.data['applicationPhase'] || null,
                curFabSite: this.props.location.state.data['curFabSite'] || null,
                curAssy: this.props.location.state.data['curAssy'] || null,
                updateATSS: this.props.location.state.data['updateATSS'] || null,
                isoDev: this.props.location.state.data['isoDev'] || null,
                safeCert: this.props.location.state.data['safeCert'] || null,
                pkgGrp: this.props.location.state.data['pkgGrp'] || null,
                pachinko: this.props.location.state.data['pachinko'] || null,
                niche: this.props.location.state.data['niche'] || null,
                roleAutoApprove: this.props.location.state.data['roleAutoApprove'] || null,
                numOfDays: this.props.location.state.data['numOfDays'] || null,
                dataSource: this.props.location.state.data['dataSource'] || null,
                pcnRequired: this.props.location.state.data['pcnRequired'] || null,
                manualSelection: this.props.location.state.data['manualSelection'] ||'N'
               },
               mode: this.props.location.state.mode,
               optionsForCCB: [],
               optionsForRole: [],
               optionsForStatus: [],
               optionsForChangeGrp: [],
               optionsForChangeType: [],
               optionsForChangeTypeList: [],
               optionsForSBE: [],
               optionsForSBEone: [],
               optionsForSBEoneList: [],
               optionsForSBEtwo: [],
               optionsForSBEtwoList: [],
               optionsForIndSec: [],
               optionsForCustomer: [],
               optionsForCurFabSite: [],
               optionsForCurAssy: [],
               optionsForPkgGrp: [],
               optionsForNiche: [],
               optionsForAppPhase: [],
               optionsForDataSource: [],
               optionsForYesNo: [],
               loadingOptions: true,
               validity: {},
               errors: {},
               details: {},
               ccbDetails: [],
               columns: [
                    {
                        key: 'change_no',
                        label: 'Change Number'
                    }, {
                        key: "change_title",
                        label: "Change Title"
                    }, {
                        key: "primary_name",
                        label: "Primary Name"
                    }, {
                        key: "delegate_name",
                        label: "Delegate Name"
                    }
                ]
           }
    // Bind functions
    this.state = initialState;
    
    this.hanldeObsoletingRole = this.hanldeObsoletingRole.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.handleStatusVal = this.handleStatusVal.bind(this);
    this.toggle = this.toggle.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
    this.checkRoleCount();
    this.validate = this.validate.bind(this);
    }

    // Handle form validation
    validate() {
        
        let validation = new Validator();
        if(this.state.mode === 'copy') {
            this.checkRoleCount();
            validation = new Validator(this.state.data, copyRules, message);
        } else {
            validation = new Validator(this.state.data, rules, message);
        }

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

    componentDidMount() {
        this.loadOptions();
        if(this.state.data.id !== null) {
            this.fetchDetails(this.state.data.id)
        }
    }

    fetchDetails(id) {
        fetch("/api/v1/ccb/details/" + id, {
            credentials: 'include', headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => {
            this.setState({details: json})
            this.convertDetails();
        })
        .catch(error => FetchUtilities.handleError(error))
    }

    convertDetails() {
        this.state.details.forEach((key, i) => {
            this.setState({
                data: {
                    id: key.ID,
                    ccb: key.CCB,
                    role: key.ROLE,
                    roleId: key.ROLEID,
                    position: key.POSITION,
                    ccbStatus: key.CCBSTATUS,
                    name: this.state.data.name,
                    delegate: this.state.data.delegate,
                    changeGrpId: key.CHANGEGRPID,
                    changeType: this.state.data.changeType,
                    sbeId: key.SBEID,
                    sbeOneId: key.SBEONEID,
                    sbeTwoId: key.SBETWOID,
                    customer: this.state.data.customer,
                    indSec: this.state.data.indSec,
                    gidep: this.state.data.gidep,
                    applicationPhase: this.state.data.applicationPhase,
                    curFabSite: this.state.data.curFabSite,
                    curAssy: this.state.data.curAssy,
                    updateATSS: this.state.data.updateATSS,
                    isoDev: this.state.data.isoDev,
                    safeCert: this.state.data.safeCert,
                    pkgGrp: this.state.data.pkgGrp,
                    pachinko: this.state.data.pachinko,
                    niche: this.state.data.niche,
                    roleAutoApprove: this.state.data.roleAutoApprove,
                    numOfDays: this.state.data.numOfDays,
                    dataSource: this.state.data.dataSource,
                    roleCount: this.state.data.roleCount,
                    pcnRequired: this.state.data.pcnRequired,
                    manualSelection: this.state.data.manualSelection
                }
            })
        })
    }

    showSpinner(flag) {
        this.setState({ loadOptions: flag });
    }

    loadOptions() {
        this.showSpinner(true);
        var queryData = this.getQueryData();
        fetch('/api/v1/ccbForm/', {
            method: 'POST',
            body: JSON.stringify(queryData),
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }),
            credentials: 'include'
        })
        .then((response) => response.json())
        .then((json) => {
            this.setState({
                optionsForCCB: json.optionsForCCB,
                optionsForRole: json.optionsForRole,
                optionsForStatus: json.optionsForStatus,
                optionsForChangeGrp: json.optionsForChangeGrp,
                optionsForChangeType: json.optionsForChangeType,
                optionsForChangeTypeList: json.optionsForChangeTypeList,
                optionsForSBE: json.optionsForSBE,
                optionsForSBEone: json.optionsForSBEone,
                optionsForSBEoneList: json.optionsForSBEoneList,
                optionsForSBEtwo: json.optionsForSBEtwo,
                optionsForSBEtwoList: json.optionsForSBEtwoList,
                optionsForIndSec: json.optionsForIndSec,
                optionsForCustomer: json.optionsForCustomer,
                optionsForCurFabSite: json.optionsForCurFabSite,
                optionsForCurAssy: json.optionsForCurAssy,
                optionsForPkgGrp: json.optionsForPkgGrp,
                optionsForNiche: json.optionsForNiche,
                optionsForAppPhase: json.optionsForAppPhase,
                optionsForDataSource: json.optionsForDataSource,
                optionsForYesNo: json.optionsForYesNo
            })
            this.setState({ show: false, });
            this.showSpinner(false);
        });
    }

    fetchSBE1List(sbeId) {
        var queryData = this.getQueryData();
        fetch('/api/v1/admin/ccb/sbe1List/' + sbeId, {
            method: 'POST',
            body: JSON.stringify(queryData),
            headers: new Headers({
                'Content-Type': 'application/json',
                 Accept: 'application/json',
                 'Pragma': 'no-cache',
                 'Cache-Control': 'no-cache'
            }),
            credentials: 'include'
        })
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    optionsForSBEone: json.optionsForSBEone
                });
            })
            .catch(error => FetchUtilities.handleError(error));
    } 

    fetchSBE2List(sbeOneId) {
       var queryData = this.getQueryData();
       fetch('/api/v1/admin/ccb/sbe2List/' + sbeOneId, {
           method: 'POST',
           body: JSON.stringify(queryData),
           headers: new Headers({
               'Content-Type': 'application/json',
                Accept: 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
           }),
           credentials: 'include'
       })
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    optionsForSBEtwo: json.optionsForSBEtwo
                });
            })
            .catch(error => FetchUtilities.handleError(error));
    }

    fetchChangeTypeList(changeGrpId) {
        var queryData = this.getQueryData();
        fetch('/api/v1/admin/ccb/changeType/' + changeGrpId, {
            method: 'POST',
            body: JSON.stringify(queryData),
            headers: new Headers({
                'Content-Type': 'application/json',
                 Accept: 'application/json',
                 'Pragma': 'no-cache',
                 'Cache-Control': 'no-cache'
            }),
            credentials: 'include'
        })
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    optionsForChangeType: json.optionsForChangeType
                });
            })
            .catch(error => FetchUtilities.handleError(error));
    }

    fetchRoleList(ccb) {
        var queryData = this.getQueryData();
        fetch("/api/v1/admin/ccb/roleList/" + ccb, {
            method: 'POST',
            body: JSON.stringify(queryData),
            headers: new Headers({
                'Content-Type': 'application/json',
                 Accept: 'application/json',
                 'Pragma': 'no-cache',
                 'Cache-Control': 'no-cache'
            }),
            credentials: 'include'
        })
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    optionsForRole: json.optionsForRole
                });
            })
            .catch(error => FetchUtilities.handleError(error));
    }

    handleRoleList = (name, ccbValue) => {
        let obj = {}
        this.setState(obj);

        const value = ccbValue === null ? '' : ccbValue.value
        this.setState({
            value
        })

        if(name === 'ccb') {
            this.setState((previousState) => ({
                data: {
                    ...previousState.data,
                    'ccb': '',
                    [name]: ccbValue === null ? '' : value
                }
            }));
            this.fetchRoleList(value);
        } else {
            this.setState((previousState) => {
                return previousState.data = {
                    ...previousState.data,
                    [name]: ccbValue === null ? '' : value
                };
            });
        }
    }

    /* multi -select function for change group */
    handleChangeGroup = (name, selectedOptions) => {

        const value = selectedOptions.map((selectedOption) => selectedOption.value).join(",")
        this.setState({
            value
        })
        
        if(name === 'changeGrpId') {
            this.setState((previousState) => ({
                data: {
                    ...previousState.data,
                    [name]: selectedOptions.map((selectedOption) => selectedOption.value).join(",")
                }
            }))
            this.fetchChangeTypeList(selectedOptions.map((selectedOption) => selectedOption.value).join(","))
        } else {
            this.setState((previousState) => {
                return previousState.data = {
                    ...previousState.data,
                    [name]: selectedOptions.map((selectedOption) => selectedOption.value).join(",")
                };
            });
        }
    }

    getQueryData() {
        var data = {};

        data.id = this.state.data.id;
        data.ccb =this.state.data.ccb;
        data.role = this.state.data.role;
        data.roleId = this.state.data.roleId;
        data.position = this.state.data.position;
        data.ccbStatus = this.state.data.ccbStatus;
        data.changeGrp = this.state.data.changeGrp;
        data.changeGrpId = this.state.data.changeGrpId;
        data.changeType = this.state.data.changeType;
        data.sbe = this.state.data.sbeId;
        data.sbeId = this.state.data.sbeId;
        data.sbeOne = this.state.data.sbeOneId;
        data.sbeOneId = this.state.data.sbeOneId;
        data.sbeTwo = this.state.data.sbeTwoId;
        data.sbeTwoId = this.state.data.sbeTwoId;
        data.customer = this.state.data.customer;
        data.indSec = this.state.data.indSec;
        data.gidep = this.state.data.gidep;
        data.applicationPhase = this.state.data.applicationPhase;
        data.curFabSite = this.state.data.curFabSite;
        data.curAssy = this.state.data.curAssy;
        data.updateATSS = this.state.data.updateATSS;
        data.isoDev = this.state.data.isoDev;
        data.safeCert = this.state.data.safeCert;
        data.pkgGrp = this.state.data.pkgGrp;
        data.pachinko = this.state.data.pachinko;
        data.niche = this.state.data.niche;
        data.roleAutoApprove = this.state.data.roleAutoApprove;
        data.numOfDays = this.state.data.numOfDays;
        data.dataSource = this.state.data.dataSource;
        data.roleCount = this.state.data.roleCount;
        data.pcnRequired = this.state.data.pcnRequired;
        data.manualSelection = this.state.data.manualSelection;
        
        return data;
    }

    data() {
        return this.state.data;
    }

    
    handleChange(e) {
        this.setState({
            data: this.state.data,
        }, () => {
            this.setState({
                data: this.state.data,
            });
        });
    }

    handleInputChange = (e) => {
        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        if(name === 'role') {
            this.checkRoleCount(value);
        }
        // Set state using function to granularly modify data
        this.setState((previousState) => {
            return previousState.data = {...previousState.data, [name]: value};
        }, () => this.validate()); 
    } 

    /* multi -select function for SBEs */
    handleMultiSBEChange = (name, selectedOptions) => {

        const value = selectedOptions.map((selectedOption) => selectedOption.value).join(",")
        this.setState({
            value
        })
        
        if(name === 'sbeId') {
            this.setState((previousState) => ({
                data: {
                    ...previousState.data,
                    'sbeOneId': '',
                    'sbeTwoId': '',
                    [name]: selectedOptions.map((selectedOption) => selectedOption.value).join(",") 
                }
            }));
            this.fetchSBE1List(value);
            } else if (name === 'sbeOneId') {
                this.setState((previousState) => ({
                    data: {
                        ...previousState.data,
                        'sbeTwoId': '',
                        [name]: selectedOptions.map((selectedOption) => selectedOption.value).join(",")
                    }
                }));
                this.fetchSBE2List(value);
            } else if (name === 'sbeTwoId') {
                this.setState((previousState) => ({
                    data: {
                        ...previousState.data,
                        [name]: selectedOptions.map((selectedOption) => selectedOption.value).join(",")
                    }
                }));
            } else {
                this.setState((previousState) => {
                    return previousState.data = {
                        ...previousState.data,
                        [name]: selectedOptions.map((selectedOption) => selectedOption.value).join(",")
                    };
                });
            }
    }

    // Handle form submit
  handleSubmit(e) {
    e.preventDefault();
    let URL = "";
      if (this.validate()) {
        this.toggleSpinner();
        if(this.state.mode === 'copy') {
            URL = "/api/v1/ccb/copy";
        } else {
            URL = "/api/v1/ccb/";
        }
        
        fetch(URL,
            {
                method: 'POST',
                body: JSON.stringify(this.state.data),
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
                if(response.status === 200) {
                    this.props.history.push({pathname: '/admin/ccb/'});
                    return response
                } else {
                    let formValidity = {};
                    let formErrors = {};
                    Object.keys(response.errorDetails).forEach(field => {
                        formValidity[field.key] = false;
                        formErrors[field.key] = field.value;
                    });
                    this.setState({
                        validity: formValidity,
                        errors: formErrors
                    });
                }
            })
            .catch((error) => {
                this.toggleSpinner();
                this.handleError(error);
            });
      } 
  }

  //handle LDAP input field for Primary Name
  handlePrimarySearch = (searchValue) => {
      this.setState({
          selectedPrimary: searchValue.label
      }, () => this.state.data.name = this.state.selectedPrimary);
  }

  //handle LDAP input field for Delegate Name
  handleDelegateSearch = (searchValue) => {
    this.setState({
        selectedDelegate: searchValue.label
    }, () => this.state.data.delegate = this.state.selectedDelegate);
  }

  toggleModal() {
    this.setState({ modalVisible: !this.state.modalVisible });
  }

  toggleSpinner =() => {
    this.setState({ showSpinner: !this.state.showSpinner });
}

  hanldeObsoletingRole(){
    if(this.state.data.id !== null && this.state.data.ccbStatus === "2"){
        this.setState({ modalVisible: !this.state.modalVisible });
    }
  }

  handleStatusVal(action) {
    if(action === "Obsolete"){
        this.toggleModal();
        return true;
    }else{
        this.toggleModal();
        this.state.data.ccbStatus = "1";
        return false;
    }
  }

  toggle(index) {
    this.setState({
      activeModal: index
    });
  }

  closeModal() {
    this.setState({
      activeModal: null
    });
    this.handleStatusVal("Cancel");
  }
  
  closeConfirmModal(){
      this.setState({
          activeModal: null
      });
      this.handleStatusVal("Obsolete")      
  }

  checkRoleCount() {
    fetch('/api/v1/checkRole/',
        {
            method: 'POST',
            body: JSON.stringify(this.state.data),
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => this.setState((previousState) => ({
            data: {
                ...previousState.data,
                roleCount: JSON.stringify(json)
            }
        }), () => this.state.data.roleCount < 1 ? (
            this.setState((previousState) => ({
                data: {
                    ...previousState.data,
                    roleCount: 'N'
                }
            }))
        ) : (
            this.setState((previousState) => ({
                data: {
                    ...previousState.data,
                    roleCount: 'Y'
                },
            }))
        )))
        .catch(error => FetchUtilities.handleError(error))
    }

    /* multi select feature */ 
    handleMultiSelectChange = (name, selectedOptions) => {
        this.setState((previousState) => ({
            data: {
                ...previousState.data,
                [name]: selectedOptions.map((selectedOption) => selectedOption.value).join(",")
            }
        }))
    }
    

  render() {
    return(        
        <div>
            <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'CCB', to: "/admin/ccb" },
                    { text: 'CCB Form', active: true }
                ]} />
        <div className="card card-body">
            <Modal
                isOpen={this.state.modalVisible}
                toggle={this.toggleModal}
                fade={true} 
                backdrop={true}
                size={"lg"}>
                <ModalHeader toggle={this.toggleModal}>Affected Changes </ModalHeader>
                <ModalBody>
                    {this.state.data.id !== null ? (
                        <ReactiveTable server
                            credentials={'include'}
                            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                            fetchErrorHandler={FetchUtilities.handleError}
                            striped columnFilters advancedColumns
                            columns={this.state.columns}
                            url={"/api/v1/ccb/obsolete/"+this.state.data.roleId}
                        />
                    ) : (
                        <Label>No Affected Changes for this Role</Label>
                    )}
                    <div className="float-right">
                        <Label></Label>
                        <Button color="primary" onClick={() => this.toggle('confirm2')}>Obsolete</Button>{' '}
                        <Button color="secondary" onClick={() => this.handleStatusVal("Cancel")}>Cancel</Button>{' '}
                    </div>
                    
                </ModalBody>
            </Modal>

            <ConfirmModal
            show={this.state.activeModal}
            color="warning"
            title="Confirm Obsoleting Role"
            message="Completing this action will obsolete the role which has pending approval for some changes. Are you sure you want to proceed?"
            handleClose={this.closeModal}
            handleConfirmation={this.closeConfirmModal}
            />

            <Form onSubmit={this.handleSubmit}> 
            <Spinner showSpinner={this.state.showSpinner} />
                <FormGroup row>
                    <Col sm={6}>
                        <Label for="name"><Required required> Primary: </Required></Label>
                        <LDAPSearchInput 
                            onSelectLdap={this.handlePrimarySearch} 
                            placeholder={'Enter user'} 
                            selected={this.state.data.name}/>
                        <Input type="hidden" name="" invalid={!this.state.validity.name}/>
                        <FormFeedback>{this.state.errors.name}</FormFeedback>
                    </Col>
                    <Col md={6}>
                        <Label for="delegate"> Delegate: </Label>
                        <LDAPSearchInput 
                            onSelectLdap={this.handleDelegateSearch} 
                            placeholder={'Enter user'} 
                            selected={this.state.data.delegate}/>             
                    </Col>
                </FormGroup>

                <FormGroup row>
                    <Col sm={4}>
                    <Label for="ccbField"><Required required> CCB: </Required></Label>
                    {
                        this.state.data.id === null 
                        ? (
                            <div>
                                <Select
                                    name="ccb"
                                    componentClass="select"
                                    placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                                    isLoading={this.state.loadOptions}
                                    disabled={this.state.loadOptions}
                                    options={this.state.optionsForCCB}
                                    value={this.state.data.ccb ? this.state.data.ccb: ''}
                                    onChange={this.handleRoleList.bind(this, 'ccb')}
                                    required/>
                                <Input type="hidden" name="" invalid={!this.state.validity.ccb}/>
                                <FormFeedback>{this.state.errors.ccb}</FormFeedback>
                            </div>
                        ) : (
                            <div>
                                <Select
                                    name="ccb"
                                    componentClass="select"
                                    placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                                    isLoading={this.state.loadOptions}
                                    disabled={this.state.loadOptions}
                                    options={this.state.optionsForCCB}
                                    value={this.state.data.ccb ? this.state.data.ccb: ''}
                                    onChange={this.handleRoleList.bind(this, 'ccb')} />
                            </div>
                        )
                    }
                    </Col>
                    
                    
                    <Col sm={4}>
                    <Label for="role"><Required required> Role: </Required></Label>
                        {this.state.data.id === null ? (
                        <div><CreatableSelect 
                        name="role"
                        componentClass="select"
                        placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                        isLoading={this.state.loadOptions}
                        disabled={this.state.loadOptions}
                        options={this.state.optionsForRole}
                        value={this.state.data.role}
                        onChange={
                            (role) => {
                                this.setState({
                                data: update(this.state.data, {
                                    $merge: { role: role ? (role.value ? role.value : null) : null }
                                })
                                }, () => {
                                this.handleChange();
                                });
                            }
                        }
                        required />
                        <Input type="hidden" name="" invalid={!this.state.validity.role}/>
                    <FormFeedback>{this.state.errors.role}</FormFeedback></div>
                        ) : (
                    <div><Input type="text" name="role" onChange={this.handleInputChange} value={this.state.data.role}/>
                    <div className={classnames({"valid-feedback": this.state.validity.role}, {"invalid-feedback": !this.state.validity.role})} style={{ display: 'block' }}>{this.state.errors.role}</div>
                    <div className={classnames({"valid-feedback": this.state.validity.roleCount}, {"invalid-feedback": !this.state.validity.roleCount})} style={{ display: 'block' }}>{this.state.errors.roleCount}</div></div>
                        )
                    }
                    </Col>

                    <Col sm={4}>
                    <Label for="position"> Position: </Label>
                        <Input type="number"
                            name="position"
                            placeholder={"Enter Role Position"}
                            maxLength="75"
                            value={this.state.data.position ? this.state.data.position : ''}
                            onChange={this.handleInputChange}
                        />
                    </Col>
                </FormGroup>
                
                <FormGroup row>
                    <Col sm={4}>
                    <Label for="ccbStatus"> Status: </Label>
                    <Select 
                            name="ccbStatus"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForStatus}
                            value={this.state.data.ccbStatus} 
                            onChange={
                                (ccbStatus) => {
                                  this.setState({
                                    data: update(this.state.data, {
                                      $merge: { ccbStatus: ccbStatus ? (ccbStatus.value ? ccbStatus.value : null) : null }
                                    })
                                  }, () => {
                                    this.handleChange();
                                    /*obsoleting roles - do not delete */
                                    this.hanldeObsoletingRole();
                                  });
                                }
                              }
                            />
                    </Col>
            
                    <Col sm={4}>
                    <Label for="changeGrp"> Change Group: </Label>
                        <Select
                            multi
                            name="changeGrp"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForChangeGrp}
                            value={this.state.data.changeGrpId}
                            onChange={this.handleChangeGroup.bind(this, 'changeGrpId')}
                        />
                    </Col>
                    
                    <Col sm={4}>
                    <Label for="changeType"> Change Type: </Label>
                        <Select
                        multi
                        name="changeType"
                        componentClass="select"
                        placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                        isLoading={this.state.loadOptions}
                        disabled={this.state.loadOptions}
                        options={this.state.optionsForChangeType || this.state.optionsForChangeTypeList}
                        value={this.state.data.changeType}
                        onChange={this.handleMultiSelectChange.bind(this, 'changeType')}
                    />
                    </Col>
                </FormGroup>
                
                <FormGroup row>
                    
                    <Col sm={4}>
                    <Label for="sbe"> SBE: </Label>
                        <Select
                            multi
                            name="sbe"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForSBE}
                            value={this.state.data.sbeId}
                            onChange={this.handleMultiSBEChange.bind(this, 'sbeId')}
                        />
                    </Col>
                    
                    
                    <Col sm={4}>
                    <Label for="sbeOne"> SBE-1: </Label>
                    <Select
                            multi
                            name="sbeOneId"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForSBEone || this.state.optionsForSBEoneList}
                            value={this.state.data.sbeOneId}
                            onChange={this.handleMultiSBEChange.bind(this, 'sbeOneId')}
                              />
                    </Col>
                
                    <Col sm={4}>
                    <Label for="sbeTwo"> SBE-2: </Label>
                        <Select
                            multi
                            name="sbeTwoId"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForSBEtwo || this.state.optionsForSBEtwoList}
                            value={this.state.data.sbeTwoId}
                            onChange={this.handleMultiSBEChange.bind(this, 'sbeTwoId')}
                        />
                    </Col>
                </FormGroup>
                  
                <FormGroup row>
                    <Col sm={4}>
                    <Label for="customer"> Customer: </Label>
                        <Select
                            multi
                            name="customer"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForCustomer}
                            value={this.state.data.customer}
                            delimiter=","
                            onChange={this.handleMultiSelectChange.bind(this, 'customer')}
                        />
                    </Col>
                    
                    <Col sm={4}>
                    <Label for="indSec"> Industry Sector: </Label>                    
                        <Select
                            multi
                            name="indSec"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForIndSec}
                            value={this.state.data.indSec}
                            onChange={this.handleMultiSelectChange.bind(this, 'indSec')}
                        />
                    </Col>
                    
                    <Col sm={4}>
                    <Label for="gidep"> GIDEP: </Label>
                        <Select
                            name="gidep"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForYesNo}
                            value={this.state.data.gidep}
                            onChange={
                                (gidep) => {
                                  this.setState({
                                    data: update(this.state.data, {
                                      $merge: { gidep: gidep ? (gidep.value ? gidep.value : null) : null }
                                    })
                                  }, () => {
                                    this.handleChange();
                                  });
                                }
                              }
                        />
                    </Col>
                    
                </FormGroup>
                <FormGroup row>
                    <Col sm={4}>
                    <Label for="applicationPhase"> Application Phase(s): </Label>
                        <Select 
                                multi
                                name="applicationPhase"
                                componentClass="select"
                                placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                                isLoading={this.state.loadOptions}
                                disabled={this.state.loadOptions}
                                options={this.state.optionsForAppPhase}
                                value={this.state.data.applicationPhase}
                                onChange={this.handleMultiSelectChange.bind(this, 'applicationPhase')}
                            />
                    </Col>

                    <Col sm={4}>
                    <Label for="curFabSite"> Current Fab Site: </Label>
                        <Select
                                multi
                                name="curFabSite"
                                componentClass="select"
                                placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                                isLoading={this.state.loadOptions}
                                disabled={this.state.loadOptions}
                                options={this.state.optionsForCurFabSite}
                                value={this.state.data.curFabSite}
                                onChange={this.handleMultiSelectChange.bind(this, 'curFabSite')}
                            />
                    </Col>

                    <Col sm={4}>
                    <Label for="curAssy"> Current Assy Site: </Label>
                        <Select
                            multi
                            name="curAssy"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForCurAssy}
                            value={this.state.data.curAssy}
                            onChange={this.handleMultiSelectChange.bind(this, 'curAssy')}
                            />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Col sm={4}>
                    <Label for="niche">Niche </Label>
                    <Select
                            multi
                            name="niche"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForNiche}
                            value={this.state.data.niche} 
                            onChange={this.handleMultiSelectChange.bind(this, 'niche')}
                            />
                    </Col> 

                    <Col sm={4}>
                    <Label for="pkgGrp">PKG Group: </Label>
                    <Select
                            multi
                            name="pkgGrp"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForPkgGrp}
                            value={this.state.data.pkgGrp}
                            onChange={this.handleMultiSelectChange.bind(this, 'pkgGrp')}
                            />
                    </Col>
                
                    <Col sm={4}>
                    <Label for="dataSource">Data Source </Label>
                        <Select
                            multi
                            name="dataSource"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForDataSource}
                            value={this.state.data.dataSource}
                            onChange={this.handleMultiSelectChange.bind(this, 'dataSource')}
                            />
                    </Col>
                </FormGroup>            
                <FormGroup row>
                    <Col sm={4}>
                    <Label for="updateATSS">Update ATSS: </Label>
                    <Select
                            name="updateATSS"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForYesNo}
                            value={this.state.data.updateATSS}
                            onChange={
                                (updateATSS) => {
                                this.setState({
                                    data: update(this.state.data, {
                                    $merge: { updateATSS: updateATSS ? (updateATSS.value ? updateATSS.value : null) : null }
                                    })
                                }, () => {
                                    this.handleChange();
                                });
                                }
                            }
                            />
                    </Col>

                    
                    <Col sm={4}>
                    <Label for="isoDev">ISO Device: </Label>
                    <Select
                            name="isoDev"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForYesNo}
                            value={this.state.data.isoDev}
                            onChange={
                                (isoDev) => {
                                this.setState({
                                    data: update(this.state.data, {
                                    $merge: { isoDev: isoDev ? (isoDev.value ? isoDev.value : null) : null }
                                    })
                                }, () => {
                                    this.handleChange();
                                });
                                }
                            }
                            />
                    </Col>
                    <Col sm={4}>
                    <Label for="safeCert">Safety Certification: </Label>
                    <Select
                            name="safeCert"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForYesNo}
                            value={this.state.data.safeCert}
                            onChange={
                                (safeCert) => {
                                this.setState({
                                    data: update(this.state.data, {
                                    $merge: { safeCert: safeCert ? (safeCert.value ? safeCert.value : null) : null }
                                    })
                                }, () => {
                                    this.handleChange();
                                });
                                }
                            }
                            />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Col sm={4}>
                    <Label for="pachinko">Pachinko </Label>
                    <Select
                            name="pachinko"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForYesNo}
                            value={this.state.data.pachinko}
                            onChange={
                                (pachinko) => {
                                this.setState({
                                    data: update(this.state.data, {
                                    $merge: { pachinko: pachinko ? (pachinko.value ? pachinko.value : null) : null }
                                    })
                                }, () => {
                                    this.handleChange();
                                });
                                }
                            }
                            />
                    </Col>
                    <Col sm={4}>
                    <Label for="roleAutoApprove">Role Auto Approve </Label>
                    <Select
                            name="roleAutoApprove"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForYesNo}
                            value={this.state.data.roleAutoApprove}
                            onChange={
                                (roleAutoApprove) => {
                                this.setState({
                                    data: update(this.state.data, {
                                    $merge: { roleAutoApprove: roleAutoApprove ? (roleAutoApprove.value ? roleAutoApprove.value : null) : null }
                                    })
                                }, () => {
                                    this.handleChange();
                                });
                                }
                            }
                            />
                    </Col>
                    
                    <Col sm={4}>
                    <Label for="numOfDays">Auto Number of Days</Label>
                    {this.state.data.roleAutoApprove === 'Y' ? (
                        <Input
                            name="numOfDays"
                            value={this.state.data.numOfDays ? this.state.data.numOfDays : '7'}
                            onChange={this.handleInputChange}>
                        </Input>
                    ) : (
                        <Input
                            disabled
                            name="numOfDays"
                            value={""}
                            onChange={this.handleInputChange}>
                        </Input>
                    )}
                        </Col>
                </FormGroup>

                <FormGroup row>
                    <Col sm={4}>
                    <Label for="pcnRequired"> PCN Required: </Label>
                    <Select
                            name="pcnRequired"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForYesNo}
                            value={this.state.data.pcnRequired}
                            onChange={
                                (pcnRequired) => {
                                this.setState({
                                    data: update(this.state.data, {
                                    $merge: { pcnRequired: pcnRequired ? (pcnRequired.value ? pcnRequired.value : null) : null }
                                    })
                                }, () => {
                                    this.handleChange();
                                });
                                }
                            }
                            />
                    </Col>

                    <Col sm={4}>
                    <Label for="manualSelection"> Manual Selection: </Label>
                    <Select
                            name="manualSelection"
                            componentClass="select"
                            placeholder={this.state.loadingOptions ? "Select..." : "Select..."}
                            isLoading={this.state.loadOptions}
                            disabled={this.state.loadOptions}
                            options={this.state.optionsForYesNo}
                            value={this.state.data.manualSelection ? this.state.data.manualSelection : 'N'}
                            onChange={
                                (manualSelection) => {
                                this.setState({
                                    data: update(this.state.data, {
                                    $merge: { manualSelection: manualSelection ? (manualSelection.value ? manualSelection.value : null) : null }
                                    })
                                }, () => {
                                    this.handleChange();
                                });
                                }
                            }
                            />
                    </Col>
                </FormGroup>

                <Link to="/admin/ccb/"><Button color="secondary" className="mr-1 pull-right">Cancel</Button></Link>
                <Button className="mr-1  pull-right" type="submit" color="primary" id="btn-ccb-save"  onClick={(event) => this.handleSubmit(event, true)}>
                <span aria-hidden="true" className="fa fa-save"></span> Save </Button>
                </Form>
                </div>
            </div>
        )
    }
}

export default withLayout(CCBForm);
