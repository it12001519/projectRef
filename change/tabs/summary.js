import React, { Component, } from 'react';
import {
    Row, Col, Button, Card, CardColumns, CardHeader, CardBody, CardFooter,
    Form, FormGroup, FormFeedback, FormText, CustomInput, Input, Label, Table, UncontrolledCollapse
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import DatePicker from 'react-datepicker';
import {Link} from 'react-router-dom';

import styled from 'styled-components';

import ChangeGroup from '../ChangeGroup';
import ScrollToTop from 'js/universal/ScrollToTop';

const ATTR_DATA = {};
const CHGGRP_DATA = [
    {
        groupName: 'Assembly',
        checked: 3,
        typeList: [
            'Assembly site',
            'Changes to control plan parameters that are defined with a characteristic of Criticl or Customer which are not listed',
            'Direct material supplier',
            'Direct material supplier location'
        ]
    },
    {
        groupName: 'Datasheet',
        typeList: [
            'Type 1',
            'Type 2'
        ]
    },
    {
        groupName: 'Design',
        checked: 1,
        typeList: [
            'Type 1',
            'Type 2'
        ]
    },
    {
        groupName: 'Test',
        typeList: [
            'Type 1',
            'Type 2'
        ]
    },
    {
        groupName: 'Packing / Shipping',
        typeList: [
            'Type 1',
            'Type 2'
        ]
    },
    {
        groupName: 'Product Obsolescence',
        typeList: [
            'Type 1',
            'Type 2'
        ]
    },
    {
        groupName: 'Wafer Fab',
        typeList: [
            'Type 1',
            'Type 2'
        ]
    }
];

class SummaryTab extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: ATTR_DATA,
            changegroup: CHGGRP_DATA,
            showScrollUp: false
        }

        this.handleScroll = this.handleScroll.bind(this);
    }

    handleScroll() {
        var winHeight = window.innerHeight;
        var value = document.body.scrollTop;
        
        this.setState({
            showScrollUp: value >= winHeight
        });
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    render() {
        return (
            <div className={this.props.className}>
                <Form autoComplete="off" id="formAttributes" noValidate>
                    <Row>
                        <Col>
                            <Button color="secondary" className="mr-1"><FontAwesome name="clone" />{' '}Copy</Button>
                            <Button color="primary" className="mr-1"><FontAwesome name="save" />{' '}Save</Button>
                            <Button color="primary" className="mr-1"><FontAwesome name="check" />{' '}Submit</Button>
                            <Button color="secondary" outline className="mr-1 float-right">Reset</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <hr />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={6}>
                            <FormGroup>
                                <Label for="changeTitle">Change Title</Label>
                                <Input type="text" required />
                                <FormFeedback>Change Title is required</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col sm={12} md={6}>
                            <FormGroup>
                                <Label for="changeTitle">Project Name</Label>
                                <Input type="select">
                                    <option>Project A</option>
                                    <option>Project B</option>
                                    <option>Project C</option>
                                    <option>Project Z</option>
                                </Input>
                                <FormFeedback></FormFeedback>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={6}>
                            <FormGroup>
                                <Label for="changeOwner">Change Owner</Label>
                                <Input type="text" />
                                <FormFeedback></FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Label for="changeDescription">Change Description</Label>
                                <Input type="textarea" required />
                                <FormFeedback>Change Description is required</FormFeedback>
                            </FormGroup>
                            <Row>
                                <Col sm={12} md={6}>
                                    <FormGroup>
                                        <Label for="legacyFrom">Legacy From</Label>
                                        <Input type="text" value="Legacy Only" readOnly />
                                        <FormFeedback></FormFeedback>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={6}>
                                    <FormGroup>
                                        <Label for="legacyTo">Legacy To</Label>
                                        <Input type="text" value="Legacy Only" readOnly />
                                        <FormFeedback></FormFeedback>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <FormGroup>
                                <Label for="changeComments">Change Comments</Label>
                                <Input type="textarea" />
                                <FormFeedback></FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col sm={12} md={6}>
                            <FormGroup>
                                <Label for="sbeStructure" id="lblSbeStructure"><Link to="#">SBE Structure</Link></Label>
                                <UncontrolledCollapse toggler="#lblSbeStructure">
                                    <Card>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>SBE</th>
                                                    <th>SBE-1</th>
                                                    <th>SBE-2</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>HPA</td>
                                                    <td>MHR</td>
                                                    <td>HIREL</td>
                                                </tr>
                                                <tr>
                                                    <td>HVAL</td>
                                                    <td>MSA</td>
                                                    <td>MSA-ASC</td>
                                                </tr>
                                                <tr>
                                                    <td>HVAL</td>
                                                    <td>SLL</td>
                                                    <td>SLL-AUTOMOTIVE</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card>
                                </UncontrolledCollapse>
                            </FormGroup>
                            <Row>
                                <Col sm={12} md={6}>
                                    <FormGroup>
                                        <Label for="changeTitle">Supply Impact</Label>
                                        <Input type="select">
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                            <option>PoNR - Point of No Return</option>
                                        </Input>
                                        <FormFeedback></FormFeedback>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={6}>
                                    <FormGroup title="Point of No Return Date">
                                        <Label for="inputDropDeadDate">PoNR Date</Label>
                                        <DatePicker
                                            name="dropDeadDate"
                                            id="inputDropDeadDate"
                                            dateFormat="YYYY-MM-DD"
                                            placeholderText="YYYY-MM-DD"
                                            className="form-control" />
                                        <FormText color="muted">All date and time are in CST</FormText>
                                        <FormFeedback></FormFeedback>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <FormGroup>
                                <Label for="benefit">Reason/Benefit for Change</Label>
                                <Input type="textarea" required />
                                <FormFeedback></FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Label for="changeTitle">Primary Purpose Category</Label>
                                <Input type="select">
                                    <option>Capacity</option>
                                    <option>Cost</option>
                                    <option>Customer Request</option>
                                    <option>Dual Source</option>
                                    <option>Factory Close</option>
                                </Input>
                                <FormFeedback></FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Label for="changeTitle">EOL Justification</Label>
                                <Input type="select">
                                    <option>Equipment EOL</option>
                                    <option>Low Volume</option>
                                    <option>Package EOL</option>
                                    <option>Process EOL</option>
                                    <option>Quality EOL</option>
                                    <option>Site Shutdown</option>
                                    <option>Supplier EOL</option>
                                </Input>
                                <FormFeedback></FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Label for="changeTitle">Annual Cost Savings</Label>
                                <Input type="number" required />
                                <FormFeedback></FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Label for="requiresQuals">Requires Quals</Label>
                                <div>
                                    <CustomInput type="radio" id="requiresQuals1" name="requiresQuals" label="Yes" inline />
                                    <CustomInput type="radio" id="requiresQuals2" name="requiresQuals" label="No" inline />
                                </div>
                                <FormFeedback></FormFeedback>
                            </FormGroup>
                        </Col>
                    </Row>

                <Row>
                    <Col>
                        <hr />
                    </Col>
                </Row>

                <ChangeGroup data={this.state.changegroup} className="mb-3" />

                    <Row>
                        <Col>
                            <Card>
                                <CardHeader tag="h6" className="text-white bg-dark p-1">
                                    Assembly
                                </CardHeader>
                                <CardBody>
                                    <CardColumns>
                                        <Card>
                                            <CardHeader>Assembly Site</CardHeader>
                                            <CardBody>
                                                <FormGroup>
                                                    <Label for="changeTitle">New Assembly Site</Label>
                                                    <Input type="select">
                                                        <option>Option A</option>
                                                        <option>Option B</option>
                                                        <option>Option C</option>
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <div>
                                                        <CustomInput type="radio" id="xampleCustomInline" name="a" label="Alternate Site" inline />
                                                        <CustomInput type="radio" id="xampleCustomInline2" name="a" label="Transfer Site" inline />
                                                    </div>
                                                </FormGroup>
                                            </CardBody>
                                        </Card>

                                        <Card>
                                            <CardHeader>Changes to control plan parameters that are defined with a characteristic of Critical or Customer which are not listed elsewhere in Table 1</CardHeader>
                                            <CardBody>
                                                <FormGroup>
                                                    <Label for="changeTitle">P/N Change</Label>
                                                    <div>
                                                        <CustomInput type="radio" id="exampleCustomInline" name="b" label="Yes" inline />
                                                        <CustomInput type="radio" id="exampleCustomInline2" name="b" label="No" inline />
                                                    </div>
                                                </FormGroup>
                                                <FormGroup>
                                                    {/* <Label for="changeTitle">If yes, will both be supported?</Label> */}
                                                    <div>
                                                        <CustomInput type="checkbox" id="exampleCustomInline2" name="c" label="Both will be supported" inline />
                                                    </div>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="legacyTo">Control Plan Parameter From</Label>
                                                    <Input type="text" value="" />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="legacyTo">Control Plan Parameter To</Label>
                                                    <Input type="text" value="" />
                                                </FormGroup>
                                            </CardBody>
                                        </Card>

                                        <Card>
                                            <CardHeader>Direct material supplier</CardHeader>
                                            <CardBody>
                                                <FormGroup>
                                                    <Label for="legacyTo">Supplier Name From</Label>
                                                    <Input type="text" value="" />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="legacyTo">Supplier Name To</Label>
                                                    <Input type="text" value="" />
                                                </FormGroup>
                                            </CardBody>
                                            <CardFooter><FontAwesome name="info-circle" />{' '}<b>Note:</b> If material is changing please select appropriate Change Type.</CardFooter>
                                        </Card>
                                    </CardColumns>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col>
                            <Card>
                                <CardHeader tag="h6" className="text-white bg-dark p-1">
                                    Design
                                </CardHeader>
                                <CardBody>
                                    <CardColumns>

                                        <Card>
                                            <CardHeader>Risk to Supply</CardHeader>
                                            <CardBody>
                                                <FormGroup>
                                                    <div>
                                                        <CustomInput type="checkbox" id="exampleCustomInline21" name="d" label="Change has impact to customer delivery (example: severe capacity impact)" />
                                                        <CustomInput type="checkbox" id="exampleCustomInline22" name="d" label="FMEA severity 8 or higher (per QSS 024-009)" />
                                                        <CustomInput type="checkbox" id="exampleCustomInline23" name="d" label="Change to fit, form, function, performance or adversely affect product quality or reliability based upon evaluations, qualifications, modeling or analysis" />
                                                        <CustomInput type="checkbox" id="exampleCustomInline24" name="d" label="Different supplier which is not used at any TI site on a similar process technology or package" />
                                                    </div>
                                                </FormGroup>
                                            </CardBody>
                                            <CardFooter><FontAwesome name="info-circle" />{' '}<b>Note:</b> Risk to Supply will only display if  a change type is selected that enables  these questions.
</CardFooter>
                                        </Card>
                                    </CardColumns>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Form>

                <ScrollToTop placement="right" color="primary" />
            </div>
        );
    }
}

export default styled(SummaryTab)`
`;
