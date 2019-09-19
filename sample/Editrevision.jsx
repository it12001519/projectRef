import React, { Component, } from 'react';
import { Row, Col, Alert, Button, Form, FormFeedback, FormGroup, FormText, Input, Label } from 'reactstrap';
import FetchUtilities from 'js/universal/FetchUtilities';
import { FormValidator } from 'js/universal/FormUtilities';
import { FormWidgetText, } from 'js/universal/FormFieldWidgets';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'whatwg-fetch';
import Validator from 'validatorjs';
import Required from "js/universal/Required";
import Spinner from "js/universal/spinner";

let rules_min = {
    dateNotif: ['required'],
    dateExpir: ['required']

};
let rules_all = {
    teaser: ['required', 'max:140'],
    startDttm: ['date', 'before_or_equal:endDttm'],
    endDttm: ['date', 'after_or_equal:startDttm']
};
let messages = {
    'required': 'This field is required',
    // 'before_or_equal.startDttm': 'Start date should be before or the same as the end date',
    //'after_or_equal.endDttm': 'End date should be after or the same as the start date'
};

// TODO: This form needs better validation logic. ~ovpgonzales
class Editrevision extends Component {

    // Default props
    static defaultProps = {
        data: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            data: props.data,
            items: [],
            userid: ' ',
            type: ' ',
            selected: 'no',
            validity: {},
            errors: {},
            options: [],
            revisionTypes: [],
            showSpinner: false
        };

    }

    componentDidMount() {

        fetch('/api/v1/revisiontype',
            {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                credentials: 'include',
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then(json => this.setState({ revisionTypes: json }))
            .catch(error => FetchUtilities.handleError(error));
    };

    toggleSpinner = () => {
        this.setState({ showSpinner: !this.state.showSpinner });
    };

    validateAndSaveChange = (name, value) => {
        // Since we may be comparing this field to other fields, use the full form instead of just the one field
        let validation;
        if (((this.state.data.startDttm !== null && name === 'endDttm') ||
            (this.state.data.endDttm !== null && name === 'startDttm'))
            && value !== null) {
            validation = new Validator({ ...this.state.data, [name]: value }, rules_all, messages);
        } else {
            validation = new Validator({ ...this.state.data, [name]: value }, rules_min, messages);
        }
        validation.passes(); // Trigger validation

        // Set state using function to granularly modify data
        this.setState((previousState) => {
            previousState.data = { ...previousState.data, [name]: value };
            previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
            previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };

            // Special rule: always update validation of start and end dates
            previousState.validity = { ...previousState.validity, 'startDttm': !validation.errors.has('startDttm') };
            previousState.validity = { ...previousState.validity, 'endDttm': !validation.errors.has('endDttm') };
            previousState.errors = { ...previousState.errors, 'startDttm': validation.errors.has('startDttm') ? validation.errors.first('startDttm') : null };
            previousState.errors = { ...previousState.errors, 'endDttm': validation.errors.has('endDttm') ? validation.errors.first('endDttm') : null };

            return previousState;
        });
    };

    // Handler for form cancel
    handleCancel = () => {
        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
    };

    validate = () => {
        let validation = new Validator(this.state.data, rules_min, messages);
        validation.passes(); // Trigger validation

        let formValidity = {};
        let formErrors = {};

        Object.keys(this.state.data).forEach(field => {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
        });

        this.setState({
            validity: formValidity,
            errors: formErrors,
            //messages:'required dude!!'
        });

        return validation.passes();
    };

    handleSubmit = (e) => {

        e.preventDefault();

        if (this.validate()) {

            let url9 = "/api/v1/pcnRevisionsDao?id=" + this.state.data.id
            const body = {
                id: this.state.data.id,
                comments: this.state.data.comments,
                pcnNumber: this.state.data.pcnNumber,
                dateExpir: this.state.data.dateExpir,
                sampleType: this.state.data.sampleType,
                lastDayShip: this.state.data.lastDayShip,
                lastDayOrder: this.state.data.lastDayOrder,
                dateNotif: this.state.data.dateNotif,
                type: this.state.data.sampleType

            }

            if (isNaN(this.state.data.dateExpir)) {
                alert("Days to Expire has to be a number")
                return false
            }

            this.toggleSpinner();

            fetch(url9, {
                method: 'post',
                body: JSON.stringify(body),
                credentials: 'include',
                headers: {
                    'content-type': 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            })
                .then(response => {
                    this.toggleSpinner();
                    return response;
                }
                )
                .then(FetchUtilities.checkStatusWithSecurity)
                //    .then(response => response.json())
                //.then(FetchUtilities.checkStatusWithSecurity)
                .then((response) => {
                    // this.toggleSpinner();
                    if (response.status === 200) {
                        // this.handleCancel();
                        window.location.reload(true)
                    } else {
                        // Handle validation errors
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
                }
                )
                .then((json) => this.setState({ data: json }))
                .catch(error => FetchUtilities.handleError(error))

            //  this.handleCancel();
            //  window.location.reload(true)
        } else {
            this.setState({

                messages: 'This field is required'
            });
        }

    };


    // Handler for form delete
    handleDelete = (e) => {
        // Prevent legacy form post
        e.preventDefault();

        //const userid = document.sub.userid.value;
        const descr = document.sub.descr.value;
        const t = document.getElementById("type");
        const type = t.options[t.selectedIndex].value;

        const url = "/api/v1/deleteDiaryDao";
        const body = {
            descr: descr,
            type: type,
            change: 12345
        };

        fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(() => this.props.onSubmit && this.props.onSubmit({}, true))
            .catch(function (error) {
                FetchUtilities.handleError(error);
            });

    };


    handleChange = (e) => {
        // Prevent legacy form post
        e.preventDefault();

        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // Validate
        FormValidator.validateForm(e);

        // Set state using function to granularly modify data
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        });
    };

    render() {
        return <div>
            <Spinner overlay={true} showSpinner={this.state.showSpinner} />

            <Form autoComplete="off" noValidate name="rev" onSubmit={this.handleSubmit}>

                <Row>
                    <Col>
                        <FormWidgetText label='PCN Number' name='pcnNumber' value={this.state.data.pcnNumber}
                            required disabled onChange={this.handleChange} maxLength="7" />
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <FormGroup>
                            <Label for="sampleType">Revision Type</Label>
                            <Input type="select" name="sampleType" id="sampleType"
                                value={this.state.data.sampleType}
                                onChange={this.handleChange}>
                                {this.state.revisionTypes.map((r, n) => <option key={n} value={r}>{r}</option>)}
                            </Input>
                        </FormGroup>
                    </Col>
                </Row>

                <Row>
                    <Col xs={12} sm={6}>
                        <FormGroup>
                            <Label for="startDttm">Last Day To Ship</Label>
                            <DatePicker
                                name="startDttm"
                                id="inputStartDttm"
                                dateFormat="MM/DD/YYYY"
                                selected={this.state.data.lastDayShip ? moment(this.state.data.lastDayShip) : undefined}
                                todayButton={"Today"}
                                placeholderText="MM/DD/YYYY"
                                className="form-control"
                                onChange={(value) => this.validateAndSaveChange('lastDayShip', value)}
                                selectsStart
                                startDate={this.state.data.lastDayShip ? moment(this.state.data.lastDayShip) : undefined}
                                endDate={this.state.data.lastDayShip ? moment(this.state.data.lastDayShip) : undefined} />
                            <FormText color="muted">All date and time are in CST</FormText>
                        </FormGroup>
                    </Col>
                    <Col xs={12} sm={6}>
                        <FormGroup>
                            <Label for="startDttm">Last Day To Order</Label>
                            <DatePicker
                                name="startDttm"
                                id="inputStartDttm"
                                dateFormat="MM/DD/YYYY"
                                selected={this.state.data.lastDayOrder ? moment(this.state.data.lastDayOrder) : undefined}
                                todayButton={"Today"}
                                placeholderText="MM/DD/YYYY"
                                className="form-control"
                                onChange={(value) => this.validateAndSaveChange('lastDayOrder', value)}
                                selectsStart
                                startDate={this.state.data.lastDayOrder ? moment(this.state.data.lastDayOrder) : undefined}
                                endDate={this.state.data.lastDayOrder ? moment(this.state.data.lastDayOrder) : undefined} />
                            <FormText color="muted">All date and time are in CST</FormText>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} sm={6}>
                        <FormGroup>
                            <Label for="dateNotif"><Required required>Notification Date</Required></Label>
                            <DatePicker
                                name="dateNotif"
                                id="dateNotif"
                                dateFormat="MM/DD/YYYY"
                                selected={this.state.data.dateNotif ? moment(this.state.data.dateNotif) : undefined}
                                todayButton={"Today"}
                                placeholderText="MM/DD/YYYY"
                                className="form-control"
                                onChange={(value) => this.validateAndSaveChange('dateNotif', value)}
                                selectsStart
                                startDate={this.state.data.dateNotif ? moment(this.state.data.dateNotif) : undefined}
                                endDate={this.state.data.dateNotif ? moment(this.state.data.dateNotif) : undefined} />
                            <FormText color="muted">All date and time are in CST</FormText>
                            <font color='red'> {this.state.messages}</font>
                        </FormGroup>
                    </Col>
                    <Col xs={12} sm={6}>
                        <FormGroup>
                            <Label><Required required>Days to expire</Required></Label>
                            <input type='text' maxLength='3' pattern="^[0-9]*$"
                                onChange={this.handleChange}
                                className='form-control'
                                name="dateExpir"
                                id="dateExpir"
                                value={this.state.data.dateExpir}
                            />
                            <font color='red'> {this.state.messages}</font>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label for="dateExpiration">Expiration Date</Label>
                            <Input
                                name="dateExpiration"
                                value={this.state.data.dateExpiration}
                                type="text"
                                disabled
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Label for="userid">File Name</Label>
                            <Input
                                name="fileName"
                                value={this.state.data.fileName}
                                onChange={this.handleChange}
                                type="text"
                                maxLength="70"
                                required
                                disabled
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <FormGroup>
                    <Label for="comments">Comments</Label>
                    <Input
                        name="comments"
                        value={this.state.data.comments}
                        onChange={this.handleChange}
                        type="textarea" pattern="\d*" maxLength="200"
                        required />
                    <FormFeedback>Text max length = 200</FormFeedback>
                </FormGroup>

                <Alert color="primary">
                    Saving changes refreshes the PCN's data. For large PCNs, this may take a few minutes.
                </Alert>

                <span className='float-right'>
                    {/* Can optionally use onClick, but will not have default "form" submit-on-enter behavior */}
                    {/* <Button color="primary" onClick={this.handleSubmit} className="mr-1">Submit</Button> */}
                    <Button type="submit" color="primary" className="mr-1">Save</Button>
                    <Button onClick={this.handleCancel} color="secondary" outline className="mr-1">Close</Button>
                    {/*<Button onClick={() => { if (window.confirm('Are you sure you want to cancel?')) this.handleDelete() }} color="danger" className="mr-1">Delete</Button>*/}
                </span>
            </Form>

        </div>
    }
}

export default Editrevision;