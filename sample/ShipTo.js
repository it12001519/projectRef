import React from 'react'
import {Col, FormGroup, Label, Input} from "reactstrap";
import Required from "js/universal/Required";

class ShipTo extends React.Component {

    static defaultProps = {
        required: false,
        shipTos: []
    }

    handleChange = (e) => {
        const {shipTos, section, onUpdate} = this.props

        // set the shippingAddress shipTo
        const number = e.target.value
        onUpdate(section, 'shipTo', number)

        // update the form to use the shipTo address data

        const shipTo = shipTos.find(s => s.custNumber === number);

        if (shipTo) {
            onUpdate(section, 'address1', shipTo.address1 || '')
            onUpdate(section, 'address2', shipTo.address2 || '')
            onUpdate(section, 'city', shipTo.city || '')
            onUpdate(section, 'state', shipTo.state || '')
            onUpdate(section, 'zip', shipTo.zip || '')
            onUpdate(section, 'country', shipTo.country || '')
        }

    }

    render() {
        const {address, shipTos} = this.props

        const options = shipTos.map((s) => <option key={s.custNumber} value={s.custNumber}>{s.custNumber} - {s.name}</option>)

        return (
            <FormGroup row className={this.props.className}>
                <Col md={3}>
                    <Label className="col-form-label">
                        <Required required={this.props.required}>SAP Customer Addresses</Required>
                    </Label>
                </Col>
                <Col md={9}>
                    <Input type="select"
                        name="shipTo"
                        value={address.shipTo}
                        onChange={this.handleChange}
                    >
                        <option value="">none - enter address below</option>
                        {options}
                    </Input>
                </Col>
            </FormGroup>
        )
    }

}

export default ShipTo

