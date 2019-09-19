import React, { Component, } from 'react';
import { Row, Col, Form, FormGroup, FormFeedback, Input, Label, Alert } from 'reactstrap';
import styled from 'styled-components';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import ScrollToTop from 'js/universal/ScrollToTop';
import Spinner from 'js/universal/spinner';

const TASK_URL_PREFIX = '/api/v1/task/'

class TaskDetailTab extends Component {

    constructor(props) {
        super(props);
        this.state = {
            detailData: undefined,
            dashboardVisibility: true,
            showSpinner: true
        }
    }

    componentWillMount() {

        this.setState({ showSpinner: true });

        let fetchURL = TASK_URL_PREFIX + "details/" + this.props.taskNumber; // API

        // Fetch the detail data
        fetch(fetchURL, { credentials: 'include', headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
                }) 
            })
            .then(FetchUtilities.checkStatus)
            .then((response) => { return response.json() })
            .then((json) => { this.setState({ detailData: json }) })
            .catch((ex) => { this.setState({ detailData: null }); throw ex });
    }

    componentDidMount() {

        this.setState({ showSpinner: false });
    }


    render() {
        if (this.state.detailData === undefined) {
            return (
                <div className={this.props.className}>
                    <Spinner showSpinner />
                </div>
            )
        } else if (this.state.detailData === null) {
            return (

                <div className={this.props.className}>
                    <Alert color="danger">
                        <h4>{`TASK Number ${this.detailData.taskNumber} not found`}</h4>
                    </Alert>
                </div>
            )
        } else {
            return (

                <div className={this.props.className}>
                    <Spinner showSpinner={this.state.showSpinner} />
                    <Form autoComplete="off" id="formAttributes" noValidate>
                        <Row>
                            <Col sm={12} md={6}>
                                <FormGroup>
                                    <Label for="name">Task Name</Label>
                                    <Input type="text"
                                        name="name"
                                        value={this.state.detailData.name ? this.state.detailData.name : ''}
                                        readOnly />
                                    <FormFeedback></FormFeedback>
                                </FormGroup>
                            </Col>


                            <Col sm={12} md={6}>
                                <FormGroup>
                                    <Label for="state">State</Label>
                                    <Input type="text"
                                        value={this.state.detailData.state ? this.state.detailData.state : ''}
                                        readOnly />
                                    <FormFeedback></FormFeedback>
                                </FormGroup>
                            </Col>

                            <Col sm={12} md={6}>
                                <FormGroup>
                                    <Label for="owner">Owner</Label>
                                    <Input type="text"
                                        value={this.state.detailData.owner ? this.state.detailData.owner : ''}
                                        readOnly />
                                    <FormFeedback></FormFeedback>
                                </FormGroup>
                            </Col>

                            <Col sm={12} md={3}>
                                <FormGroup>
                                    <Label for="dateOpened">Date Opened</Label>
                                    <Input type="text"
                                        value={this.state.detailData.dateOpened ? this.state.detailData.dateOpened : ''}
                                        readOnly />
                                    <FormFeedback></FormFeedback>
                                </FormGroup>
                            </Col>

                            <Col sm={12} md={3}>
                                <FormGroup>
                                    <Label for="dateCompleted">Date Completed</Label>
                                    <Input type="text"
                                        value={this.state.detailData.dateCompleted ? this.state.detailData.dateCompleted : ''}
                                        readOnly />
                                    <FormFeedback></FormFeedback>
                                </FormGroup>
                            </Col>

                            <Col sm={12} md={6}>
                                <FormGroup>
                                    <Label for="description">Description</Label>
                                    <Input type="textarea"
                                        name="description"
                                        value={this.state.detailData.description ? this.state.detailData.description : ''}
                                        readOnly />
                                    <FormFeedback></FormFeedback>
                                </FormGroup>
                            </Col>

                            <Col sm={12} md={6}>
                                <FormGroup>
                                    <Label for="customers">Customers</Label>
                                    <Input type="textarea"
                                        name="customers"
                                        value={this.state.detailData.customers ? this.state.detailData.customers : ''}
                                        readOnly />
                                    <FormFeedback></FormFeedback>
                                </FormGroup>
                            </Col>

                            <Col sm={12} md={6}>
                                <FormGroup>
                                    <Label for="comments">Comments</Label>
                                    <Input type="textarea"
                                        name="comments"
                                        value={this.state.detailData.comments ? this.state.detailData.comments : ''}
                                        readOnly />
                                    <FormFeedback></FormFeedback>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <hr />
                            </Col>
                        </Row>

                    </Form>

                    <ScrollToTop placement="right" color="primary" />
                </div>
            );
        }
    }

}

export default styled(TaskDetailTab)`
`;