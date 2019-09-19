import React from 'react'
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Container, NavLink, Row, } from 'reactstrap'
import Validator from 'validatorjs'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import FontAwesome from 'react-fontawesome'
import withLayout from 'js/app/models/withLayout'
import withLink from 'js/app/models/withLink'
import FetchUtilities from 'js/universal/FetchUtilities'

import { AttachmentDisplay, } from 'js/app/models/attachment'
import AttachmentField from 'js/app/models/AttachmentField'
import ChangeLinkHelp from 'js/app/models/ChangeLinkHelp'
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb'
import Pair from './Pair'
import Spinner from 'js/universal/spinner'
import { InfoModal, } from 'js/universal/Modals'
import { FormWidgetTextArea, } from 'js/universal/FormFieldWidgets'

let RouterNavLink = withLink(NavLink);

const ADMIN_ROLES = ['ChangeLink Admin', 'System Admin', 'Sample Admin', 'Sample Coordinator']

let rules = {
    orderReason: ['max:4000']
};
let messages = {
    'max': 'This field may not be greater than :max characters'
};

let SampleShowPage = withRouter(class extends React.Component {

    SAMPLE_READ_URL = "/api/v1/trksample";
    SAMPLE_WRITE_URL = "/api/v1/sampleRequest";
    SAMPLES_URL = "/samples";
    sampleNumber = this.props.match.params.sampleNumber;

    state = {
        sample: {},
        attributes: [],
        attachments: {}
    }

    constructor(props) {
        super(props)
        this.state = {
            sample: {},
            attributes: [],
            attachments: {},
            showSpinner: true,
            canUpdate: props.hasRole(ADMIN_ROLES),
            isEditMode: false,
            validity: [],
            errors: []
        }

        this.loadSampleData = this.loadSampleData.bind(this)
        this.enableEditMode = this.enableEditMode.bind(this)
        this.disableEditMode = this.disableEditMode.bind(this)
        this.onSave = this.onSave.bind(this)
        this.onChangeAttributes = this.onChangeAttributes.bind(this)
        this.validate = this.validate.bind(this)
        this.notify = this.notify.bind(this)
        this.closeNotifyModal = this.closeNotifyModal.bind(this)
    }

    loadSampleData() {
        const url = this.SAMPLE_READ_URL + '/findByNumber/' + this.props.match.params.sampleNumber

        fetch(url, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(result => result.json())
            .then(json => {
                let requestor = !!json.trkAttributes.find(a => a.key === 'REQUESTOR_USERID') ? json.trkAttributes.find(a => a.key === 'REQUESTOR_USERID').value : ''
                this.setState({
                    sample: json.trkSample,
                    attributes: json.trkAttributes,
                    canUpdate: requestor.toLowerCase() === this.props.userDetails.id.toLowerCase() || this.state.canUpdate
                })
            })
            .catch(err => FetchUtilities.handleError(err))
    }

    enableEditMode() {
        this.setState({
            isEditMode: true,
            readSample: JSON.parse(JSON.stringify(this.state.sample)),
            readAttributes: JSON.parse(JSON.stringify(this.state.attributes))
        })
    }

    disableEditMode() {
        this.setState({
            isEditMode: false,
            sample: JSON.parse(JSON.stringify(this.state.readSample)),
            attributes: JSON.parse(JSON.stringify(this.state.readAttributes))
        })
    }

    onSave() {

        if (this.validate()) {
            // Show the spinner
            this.setState({ showSpinner: true })

            const url = this.SAMPLE_WRITE_URL + '/' + this.props.match.params.sampleNumber

            let sampleForm = {
                fields: [
                    { key: 'ORDER_REASON', value: this.state.sample.orderReason }
                ]
            }
            fetch(url,
                {
                    method: 'POST',
                    body: JSON.stringify(sampleForm),
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }),
                    credentials: 'include',
                })
                .then(FetchUtilities.checkStatusWithSecurity)
                .then((response) => { return response.json() })
                .then((response) => {
                    if (response.error) {
                        this.setState({
                            notifyType: 'danger',
                            notifyText: `${response.message}: ${response.id}`,
                            isEditMode: false,
                            showSpinner: false
                        })
                    } else {
                        this.loadSampleData();
                        this.setState({ isEditMode: false, showSpinner: false })
                    }
                })
                .catch((error) => {
                    this.setState({
                        notifyType: 'danger',
                        notifyMessage: error.message ? error.message : 'System encountered an error while executing your transaction.',
                        isEditMode: false,
                        showSpinner: false
                    })
                });
        }
    }

    onChangeAttributes(name, value) {
        let results = [];
        let key = '';
        switch (name) {
            case 'orderReason': key = 'ORDER_REASON'; break;
            default: key = '';
        }
        let record = this.state.attributes.find(a => a.key === key) || {};
        if (record !== {}) {
            record.value = value;
            for (let row in this.state.attributes) {
                if (this.state.attributes[row].id === record.id) {
                    results.push(record);
                } else {
                    results.push(this.state.attributes[row]);
                }
            }
            // Set state using function to granularly modify data
            this.setState({ attributes: results });

            this.setState((previousState) => {
                previousState.sample = { ...previousState.sample, [name]: value };
                return previousState;
            });


            this.validate(); // Trigger validation
        }
    }

    validate() {
        let validation = new Validator(this.state.sample, rules, messages);
        validation.passes(); // Trigger validation

        let formValidity = {};
        let formErrors = {};
        for (let field in this.state.sample) {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
        }

        this.setState({
            validity: formValidity,
            errors: formErrors
        });

        return validation.passes();
    }

    // Handler for form button onSubmit for attachment
    notify(type, message) {
        this.setState({
            notifyType: type,
            notifyMessage: message
        });
    }

    closeNotifyModal() {
        this.setState({
            notifyType: undefined,
            notifyMessage: undefined
        });
    }

    componentDidMount() {
        this.loadSampleData()
        this.setState({ showSpinner: false })
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    render() {
        let crumbs = [
            { text: 'Home', to: "/" },
            { text: this.state.sample.pcnNumber, to: "/pcn/" + this.state.sample.pcnNumber },
            { text: this.sampleNumber, active: true }
        ]

        let notify = {}
        if (this.state.notifyType !== undefined) {
            if (this.state.notifyType === 'warning') {
                notify = { color: 'warning', icon: 'exclamation-circle', title: 'Alert' }
            } else if (this.state.notifyType === 'danger') {
                notify = { color: 'danger', icon: 'exclamation-circle', title: 'Error' }
            } else {
                notify = { color: 'info', icon: 'info-circle', title: 'Notice' }
            }
        }

        if (this.state.sample !== undefined) {
            return (
                <Container fluid>
                    <Spinner showSpinner={this.state.showSpinner} />

                    <Row className="mb-2">
                        <Col className="pl-0">
                            <ChangeLinkBreadcrumb crumbs={crumbs} className='float-left' />

                            {
                                this.state.canUpdate
                                    ? this.state.isEditMode
                                    ? (
                                        <span className='float-right'>
                                                <Button color="primary" className="mr-1" onClick={this.onSave}><FontAwesome name="save" />{' '}Save Changes</Button>
                                                <Button color="secondary" outline className="mr-1" onClick={this.disableEditMode}>Cancel</Button>
                                            </span>
                                    )
                                    : (
                                        <span className='float-right'>
                                                <Button color="primary" className="mr-1" onClick={this.enableEditMode}><FontAwesome name="pencil" />{' '}Edit</Button>
                                            </span>
                                    )
                                    : undefined
                            }
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <SampleInfo {...this.state} />
                        </Col>

                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <Requester {...this.state} />
                        </Col>

                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <TIContact {...this.state} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <Order {...this.state} onChange={this.onChangeAttributes} />
                        </Col>

                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <ShippingContact {...this.state} />
                        </Col>

                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <ShippingAddress {...this.state} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <Dates {...this.state} />
                        </Col>

                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <BOMTraveler {...this.state} />
                        </Col>

                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <Build {...this.state} />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <Store {...this.state} />
                        </Col>

                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <Ship {...this.state} />
                        </Col>

                        <Col md={4} sm={12} className="pl-0 mb-3">
                            <Comments {...this.state} />
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <AttachmentCard pcnNumber={this.state.sample.pcnNumber} sampleNumber={this.props.match.params.sampleNumber}
                                            notify={this.notify} canUpdate={this.state.canUpdate} />
                        </Col>
                    </Row>

                    {
                        this.state.notifyType !== undefined
                            ? <InfoModal show
                                         icon={notify.icon}
                                         color={notify.color}
                                         title={notify.title}
                                         message={this.state.notifyMessage}
                                         handleClose={this.closeNotifyModal}
                            />
                            : undefined
                    }
                </Container>
            )
        } else {
            return (
                <Container fluid>
                    <Row style={{ margin: 0 }}>
                        <Col mr="0" xs="0"><ChangeLinkBreadcrumb crumbs={crumbs} /> </Col>
                    </Row>
                    <Row className="pl-3 pt-5">
                        <Spinner showSpinner hasOverlay={false} />
                    </Row>
                </Container>
            )
        }
    }
})

class SampleInfo extends React.Component {
    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Sample Information
                    <ChangeLinkHelp text="Information about the Sample" />
                </CardHeader>
                <CardBody>
                    <Pair name="Sample Number" value={this.props.sample.sampleNumber || ''} />
                    <Pair name="Sample Status" value={this.props.sample.status || ''} />
                    <Pair name="PCN Number" value={this.props.sample.pcnNumber || ''} />
                    <Pair name="Customer Name" value={this.props.sample.customerName || ''} />
                    <Pair name="Customer Number" value={this.props.sample.customerNumber || ''} />
                    <Pair name="Part Type" value={this.props.sample.partType || ''} />
                    <Pair name="Requested Quantity" value={this.props.sample.quantity || ''} />
                    <Pair name="SWR Numbers" value={this.props.sample.swrList || ''} />
                    <Pair name="Task Numbers" value={this.props.sample.taskList || ''} />
                    <Pair name="X-Chain" value={this.props.sample.xChain || ''} />
                    <Pair name="CSO" value={this.props.sample.cso || ''} />
                    <Pair name="ASO" value={this.props.sample.aso || ''} />
                    <Pair name="Coordinator" value={this.props.sample.coordinatorName || ''} />
                    <Pair name="Late Sample" value={this.props.sample.lateSampleRequest === null ? '' : this.props.sample.lateSampleRequest === 'Y' ? 'Yes' : 'No'} />
                    <Pair name="Courtesy Sample" value={this.props.sample.courtesySample || ''} />
                    <Pair name="PIM Hold" value={this.props.sample.pimHold === null ? '' : this.props.sample.pimHold === 'Y' ? 'Yes' : 'No'} />
                </CardBody>
            </Card>
        )
    }
}

class Requester extends React.Component {
    render() {

        let requesterUserid = this.props.attributes.find(a => a.key === 'REQUESTOR_USERID') || { value: null };
        let requesterName = this.props.attributes.find(a => a.key === 'REQUESTOR_NAME') || { value: null };
        let requesterEmail = this.props.attributes.find(a => a.key === 'REQUESTOR_EMAIL') || { value: null };
        const requesterPhone = this.props.attributes.find(a => a.key === 'REQUESTOR_PHONE') || { value: null };
        const region = this.props.sample.requesterRegion || '';
        const country = this.props.sample.requesterCountry || '';

        if (null == requesterUserid.value) {
            requesterUserid.value = this.props.sample.requester
        }

        if (null == requesterName.value) {
            requesterName.value = this.props.sample.requester
        }

        if (null == requesterEmail.value) {
            requesterEmail.value = this.props.sample.requesterEmail
        }

        return (

            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Requester
                    <ChangeLinkHelp text="Requester Details" />
                </CardHeader>
                <CardBody>
                    <Pair name="Employee ID" value={requesterUserid.value} />
                    <Pair name="Name" value={requesterName.value} />
                    <Pair name="Email" value={requesterEmail.value} />
                    <Pair name="Phone" value={requesterPhone.value} />
                    <Pair name="Region" value={region} />
                    <Pair name="Country" value={country} />
                </CardBody>
            </Card>
        )
    }
}

class TIContact extends React.Component {
    render() {

        const contactUserid = this.props.attributes.find(a => a.key === 'CONTACT_USERID') || {};
        const contactName = this.props.attributes.find(a => a.key === 'CONTACT_NAME') || {};
        const contactEmail = this.props.attributes.find(a => a.key === 'CONTACT_EMAIL') || {};
        const contactPhone = this.props.attributes.find(a => a.key === 'CONTACT_PHONE') || {};

        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    TI Contact
                    <ChangeLinkHelp text="TI Contact" />
                </CardHeader>
                <CardBody>
                    <Pair name="Employee ID" value={contactUserid.value} />
                    <Pair name="Name" value={contactName.value} />
                    <Pair name="Email" value={contactEmail.value} />
                    <Pair name="Phone" value={contactPhone.value} />
                    <Pair name="TSR" value={this.props.sample.tsr || ''} />
                </CardBody>
            </Card>
        )
    }
}

let Order = styled(class extends React.Component {

    render() {
        const orderQuantity = this.props.attributes.find(a => a.key === 'ORDER_QUANTITY') || {};
        const orderPurchaseNumber = this.props.attributes.find(a => a.key === 'ORDER_PURCHASE_NUMBER') || {};
        const orderComment = this.props.attributes.find(a => a.key === 'ORDER_COMMENT') || {};
        const orderReason = this.props.attributes.find(a => a.key === 'ORDER_REASON') || {};

        return (
            <Card className={this.props.className}>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Order
                    <ChangeLinkHelp text="Order details" />
                </CardHeader>
                {
                    this.props.isEditMode
                        ? (
                            <CardBody>
                                <Pair name="PO Number Instructions" value={orderPurchaseNumber.value} />
                                <Pair name="Comment" value={orderComment.value} />
                                <Pair name="Order Quantity" value={orderQuantity.value} />
                                <hr />
                                <FormWidgetTextArea label='Reason' name='orderReason' value={orderReason.value}
                                                    onChange={this.props.onChange}
                                                    invalid={!this.props.validity.orderReason} validationMessage={this.props.errors.orderReason} />
                            </CardBody>
                        ) : (
                            <CardBody>
                                <Pair name="PO Number Instructions" value={orderPurchaseNumber.value} />
                                <Pair name="Comment" value={orderComment.value} />
                                <Pair name="Order Quantity" value={orderQuantity.value} />
                                <Pair name="Reason" value={orderReason.value} />
                            </CardBody>
                        )
                }
            </Card>
        )
    }
}) `label { font-weight: bold }`

class ShippingContact extends React.Component {

    render() {

        const shippingContactFirstname = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_FIRSTNAME') || {};
        const shippingContactLastname = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_LASTNAME') || {};
        const shippingContactPhone = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_PHONE') || {};
        const shippingContactEmail = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_EMAIL') || {};

        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Shipping Contact
                    <ChangeLinkHelp text="Contact information for Shipping" />
                </CardHeader>
                <CardBody>
                    <Pair name="First Name" value={shippingContactFirstname.value} />
                    <Pair name="Last Name" value={shippingContactLastname.value} />
                    <Pair name="Phone Number" value={shippingContactPhone.value} />
                    <Pair name="Email" value={shippingContactEmail.value} />
                </CardBody>
            </Card>
        )
    }
}

class ShippingAddress extends React.Component {

    render() {

        const soldto = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_ADDRESS_SOLDTO') || {};
        const line1 = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_ADDRESS_LINE1') || {};
        const line2 = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_ADDRESS_LINE2') || {};
        const city = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_ADDRESS_CITY') || {};
        const state = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_ADDRESS_STATE') || {};
        const zip = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_ADDRESS_ZIP') || {};
        const country = this.props.attributes.find(a => a.key === 'SHIPPING_CONTACT_ADDRESS_COUNTRY') || {};

        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Shipping Address
                    <ChangeLinkHelp text="Address of Shipping" />
                </CardHeader>
                <CardBody>
                    <Pair name="Ship To" value={soldto.value} />
                    <Pair name="Address 1" value={line1.value} />
                    <Pair name="Address 2" value={line2.value} />
                    <Pair name="City" value={city.value} />
                    <Pair name="State" value={state.value} />
                    <Pair name="Zip" value={zip.value} />
                    <Pair name="Country" value={country.value} />
                    <Pair name="Shipping Instructions" value={this.props.sample.shippingInstructions || ''} />
                </CardBody>
            </Card>
        )
    }
}

class Dates extends React.Component {
    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Dates
                    <ChangeLinkHelp text="Dates" />
                </CardHeader>
                <CardBody>
                    <Pair name="Cancelled" value={this.props.sample.dateCanceled || ''} />
                    <Pair name="Requested Deliver" value={this.props.sample.dateRequestedDeliver || ''} />
                    <Pair name="Expected Approval" value={this.props.sample.dateExpectedApproval || ''} />
                    <Pair name="Follow-up Email" value={this.props.sample.dateFollowupEmail || ''} />
                    <Pair name="Feedback" value={this.props.sample.dateFeedback || ''} />
                    <Pair name="Approval" value={this.props.sample.dateApproval || ''} />
                    <Pair name="Rejected" value={this.props.sample.dateRejected || ''} />
                    <Pair name="Estimated Final Approval" value={this.props.sample.dateEstimatedFinalApproval || ''} />
                    <Pair name="Estimated Conversion" value={this.props.sample.dateEstimatedConversion || ''} />
                    <Pair name="Date Shipped" value={this.props.sample.dateShip || ''} />
                    <Pair name="Estimated Ship" value={this.props.sample.dateEstimatedShip || ''} />
                    <Pair name="Date Email to Requester" value={this.props.sample.dateEmailToRequestor || ''} />
                </CardBody>
            </Card>
        )
    }
}

class BOMTraveler extends React.Component {
    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    BOM &amp; Traveler
                    <ChangeLinkHelp text="BOM and Traveler" />
                </CardHeader>
                <CardBody>
                    <Pair name="Material Master Setup" value={this.props.sample.materialMasterSetup === null ? '' : this.props.sample.materialMasterSetup === 'Y' ? 'Yes' : 'No'} />
                    <Pair name="Substrate" value={this.props.sample.substrate || ''} />
                    <Pair name="New Substrate" value={this.props.sample.newSubstrate || ''} />
                    <Pair name="Die Name" value={this.props.sample.dieName || ''} />
                    <Pair name="Die Quantity" value={this.props.sample.dieQuantity || ''} />
                    <Pair name="Assy Flow" value={this.props.sample.assyFlow || ''} />
                    <Pair name="Test Flow" value={this.props.sample.testFlow || ''} />
                    <Pair name="eForm" value={this.props.sample.eForm || ''} />
                </CardBody>
            </Card>
        )
    }
}

class Build extends React.Component {
    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Build
                    <ChangeLinkHelp text="Build" />
                </CardHeader>
                <CardBody>
                    <Pair name="SWR Number" value={this.props.sample.swrnumber || ''} />
                    <Pair name="Bump SWR Number" value={this.props.sample.bumpswrnumber || ''} />
                    <Pair name="Probe SWR Number" value={this.props.sample.probeswrnumber || ''} />
                    <Pair name="Assy SWR Number" value={this.props.sample.assyswrnumber || ''} />
                    <Pair name="Fab Lot Number" value={this.props.sample.fabLotNumber || ''} />
                    <Pair name="A/T Lot Number" value={this.props.sample.atLotNumber || ''} />
                    <Pair name="Facility Assy" value={this.props.sample.facilityAssy || ''} />
                    <Pair name="Facility Test" value={this.props.sample.facilityTest || ''} />
                    <Pair name="Start Quantity" value={this.props.sample.startQuantity || ''} />
                    <Pair name="Order Entered" value={this.props.sample.orderEntered === null ? '' : this.props.sample.orderEntered === 'Y' ? 'Yes' : 'No'} />
                    <Pair name="Generic" value={this.props.sample.generic || ''} />
                    <Pair name="Ordered to A/T" value={this.props.sample.orderedToat === null ? '' : this.props.sample.orderedToat === 'Y' ? 'Yes' : 'No'} />
                    <Pair name="Assy Site" value={this.props.sample.asySite || ''} />
                </CardBody>
            </Card>
        )
    }
}

class Store extends React.Component {
    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Store
                    <ChangeLinkHelp text="Store" />
                </CardHeader>
                <CardBody>
                    <Pair name="Received Into PDC" value={this.props.sample.receivedIntopdc === null ? '' : this.props.sample.receivedIntopdc === 'Y' ? 'Yes' : 'No'} />
                    <Pair name="Lot Trace Code" value={this.props.sample.ltc || ''} />
                    <Pair name="PDC" value={this.props.sample.pdc || ''} />
                    <Pair name="Storage Location" value={this.props.sample.sloc || ''} />
                </CardBody>
            </Card>
        )
    }
}

class Ship extends React.Component {
    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Ship
                    <ChangeLinkHelp text="Ship" />
                </CardHeader>
                <CardBody>
                    <Pair name="SWR Shipped" value={this.props.sample.swrShipped === null ? '' : this.props.sample.swrShipped === 'Y' ? 'Yes' : 'No'} />
                    <Pair name="SWR Final Quantity" value={this.props.sample.swrFinalQuantity || ''} />
                    <Pair name="Shipped Device" value={this.props.sample.shippedDevice || ''} />
                    <Pair name="Shipped Quantity" value={this.props.sample.shippedQuantity || ''} />
                    <Pair name="Delivery Note" value={this.props.sample.deliveryNote || ''} />
                    <Pair name="Ship Request" value={this.props.sample.shipRequest || ''} />
                </CardBody>
            </Card>
        )
    }
}

class Comments extends React.Component {
    render() {
        return (
            <Card className={this.props.className}>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Comments
                    <ChangeLinkHelp text="Comments" />
                </CardHeader>
                <CardBody>
                    <Pair name="Comments" value={this.props.sample.comments || 'No comments.'} />
                </CardBody>
            </Card>
        )
    }
}

class AttachmentCard extends React.Component {

    state = {
        canUpdate: false,
        pcnNumber: this.props.pcnNumber
    }

    handleSubmit(message, isSuccess) {
        if (isSuccess) {
            var m = new Date().getMilliseconds();
            this.setState({
                key: 'tbl-files-' + m, // Refresh the table
                formVisible: false // close form
            });
            this.props.notify('success', message)
        } else {
            this.setState({
                formVisible: false // close form
            });
            this.props.notify('error', message)
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ canUpdate: nextProps.canUpdate });
        this.setState({ pcnNumber: nextProps.pcnNumber })
    }

    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Attachments
                    <ChangeLinkHelp text="Attachments" />
                </CardHeader>
                <CardBody>
                    {
                        this.state.canUpdate && this.state.pcnNumber
                            ? (
                                <div>
                                    <AttachmentField
                                        id={this.props.sampleNumber}
                                        loc='Samples'
                                        classification={this.props.sampleNumber}
                                        context={this.state.pcnNumber}
                                        onCancel={() => this.setState({ formVisible: false })}
                                        onSubmit={this.handleSubmit.bind(this)}
                                    />
                                    <AttachmentDisplay
                                        id={this.props.sampleNumber}
                                        loc='Samples'
                                        context={this.state.pcnNumber}
                                        classification={this.props.sampleNumber}
                                        key={this.state.key}
                                        hideEdit={true}
                                    />
                                </div>
                            )
                            : (
                                <AttachmentDisplay
                                    id={this.props.sampleNumber}
                                    loc='Samples'
                                    context={this.state.pcnNumber}
                                    classification={this.props.sampleNumber}
                                    key={this.state.key}
                                    hideEdit={false}
                                />
                            )
                    }
                </CardBody>
            </Card>
        );
    }
}

export default withLayout(withRouter(SampleShowPage))
