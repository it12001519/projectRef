import React from 'react'
import {Card, CardBody, CardHeader, Col, FormGroup, FormText, Input, Label} from "reactstrap"
import Required from "js/universal/Required"
import ChangeLinkHelp from "js/app/models/ChangeLinkHelp"

class Order extends React.Component {

    render() {
        
        const {maxQuantity, device, order, section, onUpdate, isLateSample} = this.props
        var maxQuan = parseInt(this.props.maxQuantity, 10);
        var orderQuan = parseInt(this.props.order.quantity, 10);

        return (
            <Card className={this.props.className}>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Sample Request Order
                    <ChangeLinkHelp text="Enter the details for your sample request"/>
                </CardHeader>
                <CardBody>

                    <FormGroup row>
                        <Col md={5}>
                            <Label htmlFor="quantity" className="col-form-label">
                                <Required required={this.props.required}>Quantity</Required>
                            </Label>
                            <div><Input
                                type="number"
                                bsSize="sm"
                                id="quantity"
                                name="quantity"
                                value={order.quantity}
                                style={maxQuan < orderQuan || order.quantity === "" ? ({ borderColor: 'red'}) : ({ borderColor: 'green'})}
                                onChange={e => onUpdate(section, "quantity", e.target.value)}
                                required
                            />
                            {maxQuan < orderQuan ? (
                                <FormText>
                                    Maximum quantity has been exceeded.
                                </FormText>
                            ) : (
                                undefined
                            )}
                            
                            </div>
                        </Col>
                    </FormGroup>

                    <FormGroup row>

                    <Col md={12}>
                            <Label htmlFor="purchaseOrder" className="col-form-label">
                                PO Number Instructions
                            </Label>
                            <Input
                                type="textarea"
                                rows="3"
                                id="purchaseOrder"
                                name="purchaseOrder"
                                maxLength="400"
                                value={order.purchaseOrder}
                                onChange={e => onUpdate(section, "purchaseOrder", e.target.value)}
                            />
                            <FormText color="muted">
                                For special shipping information
                            </FormText>
                        </Col>

                        <Col md={12}>
                            <Label htmlFor="comments" className="col-form-label">
                                <Required required={false}>Comments</Required>
                            </Label>
                            <Input
                                type="textarea"
                                rows="3"
                                id="comments"
                                name="comments"
                                maxLength="400"
                                value={order.comments}
                                onChange={e => onUpdate(section, "comments", e.target.value)}
                            />

                        </Col>

                    </FormGroup>

                        <FormGroup row>
                        <Col md={12}>
                            <Label htmlFor="reason" className="col-form-label">
                                {isLateSample === 'N' ? (
                                    <Required required={false}>Reason</Required>
                                ) : (
                                    <Required required>Reason</Required>
                                )
                                }
                            </Label>
                            <Input
                                type="textarea"
                                rows="3"
                                id="reason"
                                name="reason"
                                maxLength="400"
                                value={order.reason}
                                onChange={e => onUpdate(section, "reason", e.target.value)}
                                required={isLateSample === 'Y' ? true : false}
                            />
                            {isLateSample === 'Y' || isLateSample === '' ? (
                                <FormText color="muted"> 
                                    This is a late sample request. The sample request window has closed for this PCN. 
                                    Additional sample requests will delay the implementation of the PCN. 
                                    Please provide a justification of why your request should be supported.
                                </FormText>
                            ) : undefined
                            }
                        </Col>
                    </FormGroup>

                </CardBody>

            </Card>
        )
    }
}

export default Order
