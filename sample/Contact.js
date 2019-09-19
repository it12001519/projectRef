import Required from "js/universal/Required";
import React from "react";
import {Card, CardBody, CardHeader, Col, FormGroup, Input, Label} from "reactstrap";
import ChangeLinkHelp from "js/app/models/ChangeLinkHelp"

class Contact extends React.Component {

    static defaultProps = {
        required: true
    }

    render() {

        const {contact, section, onUpdate, required} = this.props

        return (

            <Card className={this.props.className}>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    {this.props.title}
                    <ChangeLinkHelp text={this.props.footer}/>
                </CardHeader>

                <CardBody>

                    <FormGroup row>

                        <Col md={6}>
                            <Label className="col-form-label">
                                <Required required={this.props.required}>First Name</Required>
                            </Label>
                            <Input
                                bsSize="sm"
                                id="firstName"
                                name="firstName"
                                maxLength="256"
                                value={contact.firstName}
                                onChange={e => onUpdate(section, "firstName", e.target.value)}
                                required={required}
                            />
                        </Col>

                        <Col md={6}>
                            <Label className="col-form-label">
                                <Required required={this.props.required}>Last Name</Required>
                            </Label>
                            <Input
                                bsSize="sm"
                                id="lastName"
                                name="lastName"
                                maxLength="256"
                                value={contact.lastName}
                                onChange={e => onUpdate(section, "lastName", e.target.value)}
                                required={required}
                            />

                        </Col>

                    </FormGroup>

                    <FormGroup row>

                        <Col md={6}>
                            <Label className="col-form-label">
                                <Required required={this.props.required}>Phone</Required>
                            </Label>
                            <Input
                                bsSize="sm"
                                id="phone"
                                name="phone"
                                maxLength="256"
                                value={contact.phone}
                                onChange={e => onUpdate(section, "phone", e.target.value)}
                                required={required}
                            />
                        </Col>

                        <Col md={6}>
                            <Label className="col-form-label">
                                <Required required={this.props.required}>EMail</Required>
                            </Label>
                            <Input
                                bsSize="sm"
                                id="email"
                                name="email"
                                maxLength="256"
                                value={contact.email}
                                onChange={e => onUpdate(section, "email", e.target.value)}
                                required={required}
                            />
                        </Col>

                    </FormGroup>

                </CardBody>

            </Card>
        )

    }
}

export default Contact

