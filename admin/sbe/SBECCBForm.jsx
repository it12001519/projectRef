import React, { Component, } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import FetchUtilities from 'js/universal/FetchUtilities';
import FontAwesome from 'react-fontawesome';
import Spinner from 'js/universal/spinner';

const mccbURL = '/api/v1/ccb/ccb';
const sbeURL = '/api/v1/admin/sbe/';
const sbeDropdownURL = '/api/v1/admin/sbe/sbeList';
const sbe1DropdownURL = '/api/v1/admin/sbe/sbe1List';
const sbe2DropdownURL = '/api/v1/admin/sbe/sbe2List';

let headers = new Headers({
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
})

class SBECCBForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                sbe: (this.props.record && this.props.record['sbe']) || '',
                sbeId: (this.props.record && this.props.record['sbeId']) || '',
                sbe1: (this.props.record && this.props.record['sbe1']) || '',
                sbe1Id: (this.props.record && this.props.record['sbe1Id']) || '',
                sbe2: (this.props.record && this.props.record['sbe2']) || '',
                sbe2Id: (this.props.record && this.props.record['sbe2Id']) || '',
                ccbId: (this.props.record && this.props.record['ccbId']) || '',
            },
            showSpinner: false,
            mccbs: undefined,
            sbeList: undefined,
            sbe1List: undefined,
            sbe2List: undefined
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.confirmAlert = this.confirmAlert.bind(this);
        this.fetchSBEList = this.fetchSBEList.bind(this);
        this.fetchSBE1List = this.fetchSBE1List.bind(this);
        this.fetchSBE2List = this.fetchSBE2List.bind(this);
    }

    componentDidMount() {
        this.toggleSpinner();
        fetch(mccbURL, {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => {
                this.setState((previousState) => ({
                    data: {
                        ...previousState.data,
                        'ccbId': previousState.data['ccbId'] === '' ? json[0].id : previousState.data['ccbId']
                    }, mccbs: json
                }));
                if (!(!!this.props.record)) {
                    this.fetchSBEList();
                }
                this.toggleSpinner();
            })
            .catch(error => FetchUtilities.handleError(error));
    }

    fetchSBEList() {
        fetch(sbeDropdownURL, {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => {
                this.setState((previousState) => ({
                    data: {
                        ...previousState.data,
                        'sbeId': json[0].VALUE
                    }, sbeList: json
                }));
                this.fetchSBE1List(json[0].VALUE);
            })
            .catch(error => FetchUtilities.handleError(error));
    }

    fetchSBE1List(sbeId) {
        fetch(sbe1DropdownURL + "/" + sbeId, {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    sbe1List: json
                });
            })
            .catch(error => FetchUtilities.handleError(error));
    }

    fetchSBE2List(sbe1Id) {
        fetch(sbe2DropdownURL + "/" + sbe1Id, {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    sbe2List: json
                });
            })
            .catch(error => FetchUtilities.handleError(error));
    }

    // Handler for form change
    handleChange(e) {
        // Prevent legacy form post
        e.preventDefault();

        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // Set state using function to granularly modify data
        if (name === 'sbeId') {
            this.setState((previousState) => ({
                data: {
                    ...previousState.data,
                    'sbe1Id': '',
                    'sbe2Id': '',
                    [name]: value
                },
                sbe1List: undefined,
                sbe2List: undefined
            }));
            this.fetchSBE1List(value);
        } else if (name === 'sbe1Id') {
            this.setState((previousState) => ({
                data: {
                    ...previousState.data,
                    'sbe2Id': '',
                    [name]: value
                }, sbe2List: undefined
            }));
            this.fetchSBE2List(value);
        } else if (name === 'sbe2Id') {
            this.setState((previousState) => ({
                data: {
                    ...previousState.data,
                    [name]: value
                }
            }));
        } else {
            this.setState((previousState) => {
                return previousState.data = {
                    ...previousState.data,
                    [name]: value
                };
            });
        }
    }

    confirmAlert(message, isSuccess) {
        if (isSuccess) {
            this.props.onSubmit(message, true);
        } else {
            alert(message.message, message); // TODO: Replace with proper error message. ~ovpgonzales
        }
    }

    // Handler for form submit
    handleSubmit(e) {
        // Prevent legacy form post
        e.preventDefault();

        // Show the spinner
        this.toggleSpinner();

        // Set the form data to be submitted
        let formdata = {
            sbe: this.state.data.sbe,
            sbeId: this.state.data.sbeId,
            sbe1: this.state.data.sbe1,
            sbe1Id: this.state.data.sbe1Id,
            sbe2: this.state.data.sbe2,
            sbe2Id: this.state.data.sbe2Id,
            ccbId: this.state.data.ccbId
        };
        fetch(sbeURL,
            {
                method: 'POST',
                body: JSON.stringify(formdata),
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
                this.toggleSpinner();
                if (response.status === 200) {
                    this.confirmAlert('SBE Mapped added.', true);
                }
            })
            .catch((error) => {
                this.toggleSpinner();
                this.confirmAlert(error);
            });
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }


    render() {
        return (
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                <Form>
                    <FormGroup>
                        <Label for="sbe"> SBE: </Label>
                        {this.props.record && this.props.record['sbe'] ? (
                            <Input
                                name="sbe"
                                value={this.state.data.sbe}
                                onChange={this.handleChange}
                                type="text"
                                maxLength="100"
                                disabled
                                required />
                        ) : (
                                <div>
                                    {
                                        this.state.sbeList !== undefined ? (
                                            <Input
                                                name="sbeId"
                                                value={this.state.data.sbeId}
                                                onChange={this.handleChange}
                                                type="select"
                                                required >
                                                {
                                                    this.state.sbeList.map((item) => {
                                                        return <option key={item.VALUE} value={item.VALUE}>{item.LABEL}</option>
                                                    })

                                                }
                                            </Input>
                                        ) : <span>Loading...</span>
                                    }
                                </div>
                            )}

                    </FormGroup>
                    <FormGroup>
                        <Label for="sbe1"> SBE-1: </Label>
                        {this.props.record && this.props.record['sbe1'] ? (
                            <Input
                                name="sbe1"
                                value={this.state.data.sbe1}
                                onChange={this.handleChange}
                                type="text"
                                maxLength="100"
                                disabled
                                required />
                        ) : (
                                <div>
                                    {
                                        this.state.sbe1List !== undefined ? (
                                            <Input
                                                name="sbe1Id"
                                                value={this.state.data.sbe1Id}
                                                onChange={this.handleChange}
                                                type="select"
                                                required >
                                                <option></option>
                                                {
                                                    this.state.sbe1List.map((item) => {
                                                        return <option key={item.VALUE} value={item.VALUE}>{item.LABEL}</option>
                                                    })

                                                }
                                            </Input>
                                        ) : (
                                                <Input
                                                    name="sbe1Id"
                                                    value={this.state.data.sbe1Id}
                                                    onChange={this.handleChange}
                                                    type="select"
                                                    required >
                                                    <option></option>
                                                </Input>
                                            )
                                    }
                                </div>
                            )}
                    </FormGroup>
                    <FormGroup>
                        <Label for="sbe2"> SBE-2: </Label>
                        {this.props.record && this.props.record['sbe2'] ? (
                            <Input
                                name="sbe2"
                                value={this.state.data.sbe2}
                                onChange={this.handleChange}
                                type="text"
                                maxLength="100"
                                disabled
                                required />
                        ) : (
                                <div>
                                    {
                                        this.state.sbe2List !== undefined ? (
                                            <Input
                                                name="sbe2Id"
                                                value={this.state.data.sbe2Id}
                                                onChange={this.handleChange}
                                                type="select"
                                                required >
                                                <option></option>
                                                {
                                                    this.state.sbe2List.map((item) => {
                                                        return <option key={item.VALUE} value={item.VALUE}>{item.LABEL}</option>
                                                    })

                                                }
                                            </Input>
                                        ) : (
                                                <Input
                                                    name="sbe2Id"
                                                    value={this.state.data.sbe1Id}
                                                    onChange={this.handleChange}
                                                    type="select" 
                                                    required >
                                                    <option></option>
                                                </Input>
                                            )
                                    }
                                </div>
                            )}
                    </FormGroup>
                    <FormGroup>
                        <Label for="ccbId"> CCB: </Label>
                        {this.state.mccbs !== undefined ? (
                            <Input type="select" name="ccbId" id="ccbId" onChange={this.handleChange} value={this.state.data.ccbId}>
                                {
                                    this.state.mccbs.map((item) => {
                                        return <option key={item.id} value={item.id}>{item.name}</option>
                                    })

                                }

                            </Input>
                        ) : <span>Loading...</span>
                        }
                    </FormGroup>
                    <FormGroup style={{ textAlign: 'right' }}>
                        <Button type="submit" color="primary" className="mr-1" onClick={this.handleSubmit}><FontAwesome name="save" /> Submit </Button>
                        <Button onClick={() => this.props.toggle()} color="secondary" outline className="mr-1"> Cancel </Button>
                    </FormGroup>
                </Form>
            </div>

        )
    }
}


export default SBECCBForm;