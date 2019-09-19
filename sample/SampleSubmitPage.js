import React from 'react'
import withLayout from 'js/app/models/withLayout'
import Address from 'js/app/views/sample/Address'
import Contact from 'js/app/views/sample/Contact'
import TiContact from 'js/app/views/sample/TiContact'
import ShipTo from 'js/app/views/sample/ShipTo'
import {Card, CardBody, CardHeader, Col, Form, Row, Badge} from "reactstrap";
import Order from "./Order";
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb"
import {FormValidator} from "js/universal/FormUtilities"
import FetchUtilities from "js/universal/FetchUtilities";
import Pair from "./Pair";
import ChangeLinkHelp from "js/app/models/ChangeLinkHelp"
import {Redirect, withRouter} from "react-router-dom";
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import Spinner from 'js/universal/spinner';
import { infoModal } from 'js/universal/Modals';

const blockedFiles = [
    "action", "apk", "app", "bat", "bin", "cmd",
    "com", "command", "cpl", "csh", "dll", "exe", "gadget",
    "inf", "ins", "inx", "ipa", "isu", "job", "jse",
    "ksh", "lnk", "msc", "msi", "msp", "mst", "osx",
    "out", "paf", "pif", "prg", "ps1", "reg", "rgs",
    "run", "scr", "sct", "shb", "shs", "u3p", "vb",
    "vbe", "vbs", "vbscript", "workflow", "ws", "wsf",
    "wsh", "oxe", "73k", "89k", "a6p", "ac", "acc", "acr",
    "actm", "ahk", "air", "app", "arscript", "as", "asb",
    "awk", "azw2", "beam", "btm", "cel", "celx", "chm",
    "cof", "crt", "dek", "dld", "dmc", "docm", "dotm",
    "dxl", "ear", "ebm", "ebs", "ebs2", "ecf", "eham",
    "elf", "es", "ex4", "exopc", "ezs", "fas", "fky", "fpi",
    "frs", "fxp", "gs", "ham", "hms", "hpf", "hta", "iim",
    "ipf", "isp", "jar", "js", "jsx", "kix", "lo", "ls",
    "mam", "mcr", "mel", "mpx", "mrc", "ms", "mxe", "nexe",
    "obs", "ore", "otm", "pex", "plx", "potm", "ppam", 
    "ppsm", "pptm", "prc", "pvd", "pwc", "pyc", "pyo",
    "qpx", "rbx", "rox", "rpj", "s2a", "sbs", "sca", "scar",
    "scb", "script", "smm", "spr", "tcp", "thm", "tlb", 
    "udf", "upx", "url", "vlx", "vpm", "wcm", "widget",
    "wiz", "wpk", "wpm", "xap", "xbap", "xlam", "xlm",
    "xlsm", "xltm", "xqt", "xys", "zl9"
];

class SampleSubmitPage extends React.Component {

    DEVICE_URL = "/api/v1/sampleRequest/device"
    SUBMIT_URL = "/api/v1/sampleRequest"
    ATTACH_URL = "/api/v1/sampleRequest/attachsvc/edit" //TODO: temp URL move to attachment service
    REQUESTOR_URL = "/api/v1/sampleRequest/requestor"
    ADDRESS_URL = "/api/v1/sampleRequest/address"

    state = {

        // stuff about the selected device record
        showSpinner: false,
        isLateSample: null,
        device: {},

        sample: {},

        // form stuff

        requestor: {},

        contact: {},

        order: {
            purchaseOrder: "",
            quantity: 10,
            comments: "",
            reason: "",
            deviceId: this.props.deviceId,
            isLateSample: ""
        },

        shippingContact: {
            firstName: "",
            lastName: "",
            phone: "",
            email: ""
        },

        shippingAddress: {
            shipTo: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            country: ""
        },

        shipTos: [
            {
                number: "0000130946",
                name: "CONTINENTAL AUTOMOTIVE GUADALAJARA",
                address1: "RFC: SVD000317AH4",
                address2: null,
                city: "GUADALAJARA",
                state: "JA",
                zip: "45640",
                country: "MX"
            }, {
                number: "0000142545",
                name: "CONTINENTAL BRASIL INDUSTRIA",
                address1: "AV. SENADOR ADOLF SCHINDLING, 131",
                address2: null,
                city: "GUARULHOS",
                state: null,
                zip: "07042-020",
                country: "BR"
            }, {
                number: "0000152431",
                name: "CONTINENTAL AUTOMOTIVE ROMANIA",
                address1: "SIEMENS STREET NR. 1",
                address2: null,
                city: "TIMISOARA",
                state: null,
                zip: "300704",
                country: "RO"
            }
        ],

        attachments: []

    }

    // Toggles the visibility of the spinner
    toggleSpinner() {
        this.setState({
            showSpinner: !this.state.showSpinner
        });
    }

    componentDidMount() {
        // lookup the device details
        const url = this.DEVICE_URL + '/' + this.props.match.params.deviceId

        fetch(url, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(res => res.json())
            .then(json => this.setState({device: json}))
            .then(() => this.checkIfLateSample())
            .then(() => this.fetchAddresses())
            .then(() => this.isValidSample())
            .catch(err => FetchUtilities.handleError(err));

        // lookup the requester data (the currently logged in user)

        const body = {
            search: this.props.userDetails.id,
            fetchId: 1
        }

        fetch('/api/v1/ldap/lookup', {
            method: 'post',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(body)
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(res => res.json())
            .then(json => {
                if (json.items.length > 0) {
                    this.setState({
                        requestor: {
                            userid: json.items[0].userid,
                            username: json.items[0].username,
                            email: json.items[0].email,
                            phone: json.items[0].phone
                        }
                    })
                }
            })
            .catch(err => FetchUtilities.handleError(err));

        // get ship-to addresses
    }

    checkIfLateSample() {
        fetch('/api/v1/sampleRequest/isLateSample/' + this.state.device.deviceId + '/' 
               + this.state.device.partId + '/' + this.state.device.revisionId, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(res => res.text())
            .then((text => this.setState({isLateSample: text})))
            .then(() => this.fetchAddresses())
            .catch(err => FetchUtilities.handleError(err));
    }

    getMaxQuantity() {
        fetch('/api/v1/sampleRequest/checkOrderQuantity' + 
        "?deviceCustomerName=" + encodeURIComponent(this.state.device.deviceCustomerName) + 
        "&deviceCustomerNumber=" + this.state.device.deviceCustomerNumber + 
        "&deviceCategory=" + this.state.device.deviceCategory + 
        "&partSbe=" + this.state.device.partSbe + 
        "&partSbe1=" + this.state.device.partSbe1 + 
        "&partSbe2=" + this.state.device.partSbe2 + 
        "&partNiche=" + this.state.device.partNiche, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({maxQuantity: JSON.stringify(json)}))
            .then(() => this.checkIfLateSample())
            .catch(error => FetchUtilities.handleError(error))
    }

    isValidSample = () => {
        FetchUtilities.fetchGet('/api/v1/sampleRequest/isValidSample' +
            "?pcnNumber=" + this.state.device.pcnNumber +
            "&deviceId=" + this.state.device.deviceId +
            "&deviceCustomerNumber=" + this.state.device.deviceCustomerNumber +
            "&deviceCustomerName=" + encodeURIComponent(this.state.device.deviceCustomerName) +
            "&partId=" + this.state.device.partId, 
            (httpStatus, response) => {
                this.setState({
                    isValidSample: response
                })
            })
    }

    fetchAddresses = () => {

        const url = this.ADDRESS_URL +
            "?soldtoNumber=" +
            this.state.device.deviceCustomerNumber +
            "&wwNumber=" +
            this.state.device.deviceWwidNumber;

        fetch(url, {
            method: 'post',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(res => res.json())
            .then(json => this.setState({shipTos: json}))
    }

    handleChange = (section, field, value) => {
        if(section === 'order' && field === 'quantity') {
            this.getMaxQuantity();
        } 
        if(section === 'order' && field === 'reason') {
            this.checkIfLateSample();
        }
        this.setState((previousState) => {
            return previousState[section] = {...previousState[section], [field]: value};
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();

        // Validate the form data
        if (parseInt(this.state.maxQuantity,10) < parseInt(this.state.order.quantity,10)) {
            this.setState({ validQuantity: 'invalid' })
            return
        } else {
            this.setState({ validQuantity:'valid' })
        }

        if(this.state.isValidSample === 1) {
            if(FormValidator.validate(e)) {
                this.toggleSpinner();
                
                // Submit the form
                let body = {
                    deviceId: this.props.match.params.deviceId,
                    requestor: this.state.requestor,
                    contact: this.state.contact,
                    order: this.state.order,
                    shippingContact: this.state.shippingContact,
                    shippingAddress: this.state.shippingAddress,
                    device: this.state.device
                }
                fetch(this.SUBMIT_URL + "/create", {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }),
                    credentials: 'include',
                    body: JSON.stringify(body)
                })
                .then(FetchUtilities.checkStatusWithSecurity)
                .then(response => response.json())
                .then(json => {
                    this.saveAttachments(json);
                })
                .catch(error => FetchUtilities.handleError(error))
            }
        } else {
            let message = 'There is already an existing sample for ' + this.state.device.deviceCustomerName + ' in PCN ' + this.state.device.pcnNumber + ' for orderable material ' + this.state.device.partOrderableMaterial +
            '. You can no longer submit a sample request.'
            infoModal(message);
        }
    }

    saveAttachments(data) {
        
        if (this.state.attachments && this.state.attachments.length > 0) {
    
          var query = {
            LOCATION: 'Samples', //page of the module
            CLASSIFICATION: data.sampleNumber,
            APP_CONTEXT: this.state.device.pcnNumber, //PCN Number
            ATTACH_CONTEXT: data.sampleNumber,
            DESCRIPTION: ''
          };
    
          //
          let attachments = new FormData();
          this.state.attachments.forEach((file) => {
            attachments.append(file.name, file);
          });
          fetch(`/attachsvc/upload?` +
            Object.keys(query)
            .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(query[key]))
            .join('&')
            .replace(/%20/g, '+'),{
              method: 'POST',
              body: attachments,
              credentials: 'include'
            })
            .then((response) => {
              if (!response.ok)
                throw new Error({})
            });
        }
        this.setState({sample: data});        
    }
    
    removeAttachment(i) {
    let newArr = []
    this.state.attachments.map((item, j) => {
        if (j !== i) {
        newArr.push(this.state.attachments[j])
        return this.state.attachments[j]
        } else {
        return undefined
        }
    })
    this.setState((previousState) => {
        previousState = { ...previousState, 'attachments': newArr };
        previousState.values = { ...previousState.values, 'attachments': newArr.length > 0 ? 'value' : undefined };
        return previousState;
    });
    }
    // updateAttachInfo() {
    //     //TODO: TEMP solution update temp to Samples number from here
    //     let formdata = {
    //         deviceId: this.state.sample.deviceId,
    //         sampleNumber: this.state.sample.sampleNumber,
    //         pcnId: this.state.sample.pcnId
    //     };

    //     fetch(this.ATTACH_URL, {
    //         method: 'POST',
    //         headers: new Headers({
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json',
    //         }),
    //         credentials: 'include',
    //         body: JSON.stringify(formdata)
    //     })
    //         .then(FetchUtilities.checkStatusWithSecurity)
    //         .then(response => response.json())
    //         .then(json => this.setState({sample: json}))
    //         .catch(error => FetchUtilities.handleError(error))
    // }

    render() {
         let dropzoneStyle = {
            width: "100% !important",
            height: "65px !important",
            border: "2px dashed #aaa",
            textAlign: "center",
            paddingTop: "20px",
            fontSize: "13px"
        }
        let listCss = {
            listStyle : 'none',
            paddingLeft: '1em'
        }
        if (typeof this.state.sample.id !== "undefined") {
            let url = "/sample/" + this.state.sample.sampleNumber
            // this.updateAttachInfo(this.state);
            return <Redirect to={url}/>
        } else {
            const crumbs = [
                {
                    text: 'Home',
                    to: "/"
                }, {
                    text: 'PCN',
                    to: "/pcn/" + this.state.device.pcnNumber + "/approval-matrix"
                }, {
                    text: 'Submit Sample',
                    active: true
                }
            ]

            return (

                <div>

                    <ChangeLinkBreadcrumb crumbs={crumbs}/>

                    <h3>Submit Request</h3>

                    <Form onSubmit={this.handleSubmit} autoComplete="off" noValidate>
                    <Spinner showSpinner={this.state.showSpinner} />
                        <Row className="pl-3">

                            <Col md={4} sm={12} className="pl-0 mb-3">
                                <Device {...this.state.device}/>
                            </Col>

                            <Col md={4} sm={12} className="pl-0 mb-3">
                                <Customer {...this.state.device} />
                            </Col>

                            <Col md={4} sm={12} className="pl-0 mb-3">
                                <Details {...this.state.device} />
                            </Col>

                        </Row>

                        <Row className="pl-3">

                            <Col className="pl-0 mb-3">
                                <TiContact
                                    title="TI Requestor"
                                    required={true}
                                    helpText="This is the TI employee who is submitting the request."
                                    contact={this.state.requestor}
                                    section="requestor"
                                    onUpdate={this.handleChange}
                                    mode="readonly"
                                />
                            </Col>

                            <Col className="pl-0 mb-3">
                                <TiContact
                                    title="TI Contact"
                                    required={false}
                                    helpText="This is the TI employee to contact for any additional details about this request."
                                    contact={this.state.contact}
                                    section="contact"
                                    onUpdate={this.handleChange}
                                    mode="searchonly"
                                />
                            </Col>

                        </Row>

                        <Row className="pl-3">

                            <Col className="pl-0 pr-0">

                                <Order className="mr-3 mb-3"
                                       order={this.state.order}
                                       maxQuantity={this.state.maxQuantity}
                                       section="order"
                                       onUpdate={this.handleChange}
                                       isLateSample={this.state.isLateSample}
                                />
                                {
                                    // <Attachments className="mr-3 mb-3"
                                    //     device={this.props.match.params.deviceId}
                                    // />
                                    <Card className={this.props.className}>
                                        <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                                            Attachments
                                            <ChangeLinkHelp text="Attach any files needed to support or justify the sample request"/>
                                        </CardHeader>
                                        <CardBody>
                                            <Dropzone name="uploadFile"
                                            style={dropzoneStyle}
                                            // accept={acceptedFileTypes}
                                            onDrop={(files) => {
                                                let accepted = [];
                                                let rejected = [];
                                                for(let i in files){
                                                let fileName = files[i].name
                                                let fileExt = fileName.split('.').pop();
                                                if(blockedFiles.includes(fileExt.toLocaleLowerCase())){
                                                    rejected.push(files[i]);
                                                }else{
                                                    accepted.push(files[i]);
                                                }       
                                                }
                                                this.setState((previousState) => {
                                                previousState = { ...previousState, attachments: this.state.attachments.concat(accepted) };
                                                previousState.values = { ...previousState.values, attachments: 'value' };
                                                previousState.validity = { ...previousState.validity, attachments: true };
                                                return previousState;
                                                });
                                            }}>
                                            <p><FontAwesome name="cloud-upload" />{' '}Drop files to attach, or <a href="#" onClick={(event) => { event.preventDefault() }}>browse</a>.</p>
                                            </Dropzone>
                                            {
                                                this.state.attachments !== undefined && this.state.attachments.length > 0
                                                ? (
                                                <ul style={listCss}>
                                                    {
                                                    this.state.attachments.map((f, i) => {
                                                        return (
                                                        <li key={f.name} className="fileList">
                                                            <FontAwesome name="times-circle" onClick={() => this.removeAttachment(i)} />
                                                            {' '}{f.name}{' '}
                                                            <Badge color="dark" pill>{f.size} Bytes</Badge>
                                                        </li>
                                                        )
                                                    })
                                                    }
                                                </ul>
                                                ) : undefined
                                            }
                                        </CardBody>
                                    </Card>   
                                }
                            </Col>

                            <Col className="pl-0 pr-0">

                                <Contact className="mr-3 mb-3"
                                         title="Shipping Contact"
                                         required={true}
                                         footer="Enter information about the person who will receieve the samples."
                                         contact={this.state.shippingContact}
                                         section="shippingContact"
                                         onUpdate={this.handleChange}
                                />

                                <Address className="mr-3 mb-3"
                                         title="Shipping Address"
                                         footer="Enter the address of where the samples will be shipped."
                                         address={this.state.shippingAddress}
                                         section="shippingAddress"
                                         onUpdate={this.handleChange}
                                >
                                    <ShipTo
                                        shipTos={this.state.shipTos}
                                        address={this.state.shippingAddress}
                                        section="shippingAddress"
                                        onUpdate={this.handleChange}
                                    />
                                </Address>

                                {/* <AttachmentMultiple className="mr-3 mb-3"/> */}

                            </Col>

                        </Row>

                        <Row>

                            <Col xs={12} className="pl-0 mb-3">
                                <button
                                    className="btn btn-large btn-warning pull-right"
                                    type="submit">
                                    Submit
                                </button>
                            </Col>

                        </Row>

                    </Form>

                </div>
            )
        }
    }
}

class Device extends React.Component {

    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Device
                    <ChangeLinkHelp text="Data about the part being sampled, and the replacement part (if applicable)"/>
                </CardHeader>
                <CardBody>
                    <Pair name="PCN Number" value={this.props.pcnNumber}/>
                    <Pair name="Orderable Material" value={this.props.partOrderableMaterial}/>
                    <Pair name="SAP Material" value={this.props.partSapMaterial}/>
                    <Pair name="Spec Device" value={this.props.partSpecDevice}/>
                    <Pair name="Customer Part Number" value={this.props.deviceCustomerPartNumber}/>
                    <Pair name="Changed To Orderable Material" value={this.props.changedOrderableMaterial}/>
                    <Pair name="Changed To SAP Material" value={this.props.changedSapMaterial}/>
                    <Pair name="Changed To Spec Device" value={this.props.changedSpecDevice}/>
                </CardBody>
            </Card>
        )
    }
}

class Customer extends React.Component {

    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Customer
                    <ChangeLinkHelp text="Data about the customer hierarchy, and end customer (if applicable)"/>
                </CardHeader>
                <CardBody>
                    <Pair name="Customer Name" value={this.props.deviceCustomerName}/>
                    <Pair name="Customer Number" value={this.props.deviceCustomerNumber}/>
                    <Pair name="WW Customer Name" value={this.props.deviceWwidName}/>
                    <Pair name="WW Customer Number" value={this.props.deviceWwidNumber}/>
                    <Pair name="End Customer Name" value={this.props.deviceEndCustomerName}/>
                    <Pair name="End Customer Number" value={this.props.deviceEndCustomerNumber}/>
                    <Pair name="" value="" divisor="&nbsp;"/>
                </CardBody>
            </Card>
        )
    }
}

class Details extends React.Component {

    render() {
        return (
            <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Details
                    <ChangeLinkHelp text="This card shows some of the details about the selected part"/>
                </CardHeader>
                <CardBody>
                    <Pair name="Region" value={this.props.deviceRegion}/>
                    <Pair name="Pin" value={this.props.partPin}/>
                    <Pair name="Package" value={this.props.partPkg}/>
                    <Pair name="SBE" value={this.props.partSbe}/>
                    <Pair name="SBE 1" value={this.props.partSbe1}/>
                    <Pair name="SBE 2" value={this.props.partSbe2}/>
                    <Pair name="Niche" value={this.props.partNiche}/>
                    <Pair name="Industry Sector" value={this.props.partIndustrySector}/>
                    <Pair name="" value="" divisor="&nbsp;"/>
                </CardBody>
            </Card>
        )
    }
}

export default withLayout(withRouter(SampleSubmitPage))
