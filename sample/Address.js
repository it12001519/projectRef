import React from 'react'
import Required from "js/universal/Required";
import {Card, CardBody, CardHeader, Col, FormGroup, Input, Label} from "reactstrap";
import ChangeLinkHelp from "js/app/models/ChangeLinkHelp"

class Address extends React.Component {

    static defaultProps = {
        required: true,
    }

    render() {

        let {address, section, onUpdate} = this.props

        const disabled = (address.shipTo != null && address.shipTo !== '')

        const required = (address.shipTo !== '') ? false : this.props.required || false;

        return (

            <div className={this.props.className}>

                <Card>
                    <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                        {this.props.title}
                        <ChangeLinkHelp text={this.props.footer}/>
                    </CardHeader>

                    <CardBody>

                        {this.props.children}

                        <FormGroup row>

                            <Col>
                                <Label className="col-form-label">
                                    <Required required={required}>Address 1</Required>
                                </Label>
                                <Input
                                    bsSize="sm"
                                    id="address1"
                                    name="address1"
                                    maxLength="256"
                                    value={address.address1}
                                    onChange={e => onUpdate(section, "address1", e.target.value)}
                                    disabled={disabled}
                                    required={required}
                                />
                            </Col>

                        </FormGroup>

                        <FormGroup row>

                            <Col>
                                <Label className="col-form-label">
                                    <Required required={false}>Address 2</Required>
                                </Label>
                                <Input
                                    bsSize="sm"
                                    id="address2"
                                    name="address2"
                                    maxLength="256"
                                    value={address.address2}
                                    onChange={e => onUpdate(section, "address2", e.target.value)}
                                    disabled={disabled}
                                />
                            </Col>

                        </FormGroup>

                        <FormGroup row>

                            <Col md={6}>
                                <Label className="col-form-label">
                                    <Required required={required}>City</Required>
                                </Label>
                                <Input
                                    bsSize="sm"
                                    id="city"
                                    name="city"
                                    maxLength="256"
                                    value={address.city}
                                    onChange={e => onUpdate(section, "city", e.target.value)}
                                    disabled={disabled}
                                    required={required}
                                />
                            </Col>

                            <Col md={6}>
                                <Label className="col-form-label">
                                    <Required required={required}>State / Province</Required>
                                </Label>
                                <Input
                                    bsSize="sm"
                                    id="state"
                                    name="state"
                                    maxLength="256"
                                    value={address.state}
                                    onChange={e => onUpdate(section, "state", e.target.value)}
                                    disabled={disabled}
                                    required={required}
                                />
                            </Col>

                        </FormGroup>

                        <FormGroup row>

                            <Col md={6}>
                                <Label className="col-form-label">
                                    <Required required={required}>Zip Code</Required>
                                </Label>
                                <Input
                                    bsSize="sm"
                                    id="zip"
                                    name="zip"
                                    maxLength="256"
                                    value={address.zip}
                                    onChange={e => onUpdate(section, "zip", e.target.value)}
                                    disabled={disabled}
                                    required
                                />
                            </Col>

                            <Col md={6}>
                                <Label className="col-form-label">
                                    <Required required={required}>Country / Region</Required>
                                </Label>
                                <Input
                                    bsSize="sm"
                                    id="country"
                                    name="country"
                                    maxLength="256"
                                    value={address.country}
                                    onChange={e => onUpdate(section, "country", e.target.value)}
                                    disabled={disabled}
                                    required={required}
                                />
                            </Col>

                        </FormGroup>

                    </CardBody>

                </Card>

            </div>
        )
    }
}

export default Address
