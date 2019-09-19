import React from 'react'
import withLayout from "js/app/models/withLayout";
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";
import {Button, CardColumns, Card, CardBody, Form, Label, } from "reactstrap";
import Spinner from 'js/universal/spinner/';
import FetchUtilities from "js/universal/FetchUtilities";
import {SearchPCN} from "js/app/models/TrkLookUp";

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin'];

class TrackerBatchJobs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updateApprovalPcnNumber: "",
            refreshRevisionsPcnNumber: "",
            loading: 0,
            canUpdate: props.hasRole(ADMIN_ROLES)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    handleChangeRefreshPcnNumber = (e) => {
        this.setState({updateApprovalPcnNumber: e.pcn_number || ""})
    };

    handleChangeRevisionPcnNumber = (e) => {
        this.setState({refreshRevisionsPcnNumber: e.pcn_number || ""})
    };

    startLoading = () => {
        this.setState(state => {
            return {loading: state.loading + 1}
        })
    };

    stopLoading = () => {
        this.setState(state => {
            return {loading: state.loading - 1}
        })
    };

    call = (e, url) => {
        e.preventDefault();

        this.startLoading();

        return fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(response => {
                this.stopLoading();
                return response;
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => {
                if (response.status === 404) {
                    alert('the pcn was not found.');
                    return Promise.reject("response not found.")
                } else {
                    return response;
                }
            })
    };

    handlePullPcns = (e) => {
        this.call(e, "/scheduled/v1/trkbatch/pullpcns/")
            .then(response => response.json())
            .then(json => {
                const csv = json.map(p => p.pcnNumber).sort().join(', ');
                const message = `Pull PCNs complete. ${json.length} new PCN(s) were loaded.\n${csv}`;
                alert(message);
            })
            .catch(ex => FetchUtilities.handleError(ex))
    };

    handlePullDevices = (e) => {
        this.call(e, "/scheduled/v1/trkbatch/pulldevices/")
            .then(() => alert('complete'))
            .catch(ex => FetchUtilities.handleError(ex))
    };

    updatePcnStatuses = (e) => {
        this.call(e, "/scheduled/v1/trkbatch/updatePcnStatuses/")
            .then(() => alert('complete'))
            .catch(ex => FetchUtilities.handleError(ex))
    };

    handleApprovePcn = (e) => {
        this.call(e, `/scheduled/v1/trkbatch/approvepcnnumber?number=${this.state.updateApprovalPcnNumber}`)
            .then(response => response.json())
            .then(json => alert(json.status))
            .catch(ex => FetchUtilities.handleError(ex))
    };

    updateParts = (e) => {
        this.call(e, "/scheduled/v1/trkbatch/refreshParts/")
            .then(() => alert('complete'))
            .catch(ex => FetchUtilities.handleError(ex))
    };

    refreshWaitExpiration = (e) => {
        this.call(e, "/scheduled/v1/trkbatch/refreshNonExpired/")
            .then(() => alert('complete'))
            .catch(ex => FetchUtilities.handleError(ex))
    };

    refreshFulfilledSample = (e) => {
        this.call(e, "/scheduled/v1/trkbatch/refreshFullfilledSamples/")
            .then(() => alert('complete'))
            .catch(ex => FetchUtilities.handleError(ex))
    };

    refreshSentData = (e) => {
        this.call(e, "/scheduled/v1/trkbatch/refreshSentData/")
            .then(() => alert('complete'))
            .catch(ex => FetchUtilities.handleError(ex))
    };

    refreshExtendedEvaluation = (e) => {
        this.call(e, "/scheduled/v1/trkbatch/refreshExtendedEval/")
            .then(() => alert('complete'))
            .catch(ex => FetchUtilities.handleError(ex))
    };

    refreshRevisions = (e) => {
        this.call(e, `/scheduled/v1/trkbatch/refreshRevision?number=${this.state.refreshRevisionsPcnNumber}`)
            .then(response => response.json())
            .then(json => alert(json.status))
            .catch(ex => FetchUtilities.handleError(ex))
    };


    render() {

        const color = this.state.canUpdate ? 'primary' : 'secondary';
        const disabled = !this.state.canUpdate;

        return <div>

            <ChangeLinkBreadcrumb crumbs={[
                {text: 'Home', to: "/"},
                {text: 'Admin', active: true},
                {text: 'Tracker Jobs', active: true}
            ]}/>

            <Spinner showSpinner={this.state.loading > 0}/>

            <CardColumns>

                    <Card className={'h-100'}>

                        <CardBody>
                            <Form onSubmit={this.handlePullPcns}>

                                <Label for="pcnNumber">
                                    <h4>Pull Newly Notified PCNs</h4>
                                </Label>

                                <div>
                                    Normally, when a PCN has a newly notified revision, changelink will detect
                                    it and add it to changelink every 15 minutes. Click this button to perform
                                    this action immediately. This action will take approximately 30 seconds to complete.
                                </div>

                                <br/>

                                <div>
                                    <Button color={color} disabled={disabled}>
                                        Pull PCNs
                                    </Button>
                                </div>

                            </Form>

                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.handlePullDevices}>
                                <div>
                                    <Label for="pcnNumber">
                                        <h4>Pull Newly Notified Devices</h4>
                                    </Label>
                                </div>

                                <div>
                                    Normally, when a device has been notified, changelink will detect it, and add it
                                    to the changelink database every 15 minutes. Click this button to perform this
                                    action immediately. This action may take several minutes to run. Very large PCNs could
                                    take 20 minutes to load.
                                </div>

                                <br/>

                                <div>
                                    <Button color={color} disabled={disabled}>
                                        Pull Devices
                                    </Button>
                                </div>

                            </Form>

                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.updatePcnStatuses}>
                                <div>
                                    <Label for="pcnNumber">
                                        <h4>Update PCN Statuses</h4>
                                    </Label>
                                </div>

                                <div>
                                    This task updates the pcn status. The status is usually "Draft" or "Final" or
                                    "Sent for Approvals - Final". Changelink reads this information once per day.
                                    This action reads and updates all PCNs immediately. This action takes
                                    about 5 minutes to complete.
                                </div>

                                <br/>

                                <div>
                                    <Button color={color} disabled={disabled}>
                                        Update PCN Statuses
                                    </Button>
                                </div>
                            </Form>

                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.handleApprovePcn}>
                                <div>
                                    <Label for="pcnNumber">
                                        <h4>Refresh Customer Approvals</h4>
                                    </Label>
                                </div>

                                <div>
                                    This action will re-calculate the approval status, and the device hold reasons
                                    for all devices on a single PCN. The time this action takes depends on the number
                                    of devices in the PCN. Approximately 100 devices are updated per second.
                                </div>

                                <br/>

                                <SearchPCN onUpdate={this.handleChangeRefreshPcnNumber} selected={''}/>

                                <br/>

                                <Button color={!this.state.canUpdate || this.state.updateApprovalPcnNumber.length === 0 ? 'secondary' : 'primary'}
                                        disabled={!this.state.canUpdate || this.state.updateApprovalPcnNumber.length === 0}>
                                    Refresh Approvals
                                </Button>

                            </Form>

                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.updateParts}>
                                <div>
                                    <Label for="pcnNumber">
                                        <h4>Update Part Details</h4>
                                    </Label>
                                </div>

                                <div>
                                    This task updates the Part table with updated attributes from BDW.
                                    This task is ran daily during the nighly batch. This takes approx 10 minutes
                                    to complete.
                                </div>

                                <br/>

                                <div>
                                    <Button color={color} disabled={disabled}>
                                        Update Part Details
                                    </Button>
                                </div>

                            </Form>

                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.refreshRevisions}>
                                <div>
                                    <Label for="refreshRevisionsPcnNumber">
                                        <h4>Refresh Revisions</h4>
                                    </Label>
                                </div>

                                <div>
                                    Newly notified revisions should appear within 15 minutes from
                                    the pcn notification completion. If you don't see a notification for a pcn,
                                    enter the number and click the Pull Revisions button.
                                </div>

                                <br/>

                                <SearchPCN onUpdate={this.handleChangeRevisionPcnNumber} selected={''}/>

                                <br/>

                                <Button color={!this.state.canUpdate || this.state.refreshRevisionsPcnNumber.length === 0 ? 'secondary' : 'primary'}
                                        disabled={!this.state.canUpdate || this.state.refreshRevisionsPcnNumber.length === 0}>
                                    Refresh Revisions
                                </Button>

                            </Form>

                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.refreshWaitExpiration}>
                                <div>
                                    <Label for="pcnNumber">
                                        <h4>Refresh Wait Expiration Devices</h4>
                                    </Label>
                                </div>

                                <div>
                                    This will find any devices that are in WAIT_PCN_REV_EXPIRATION and
                                    the revision has expired, and it refreshes those devices.
                                </div>

                                <br/>
                                <br/>

                                <div>
                                    <Button color={color} disabled={disabled}>
                                        Refresh Wait Expiration
                                    </Button>
                                </div>

                            </Form>

                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.refreshFulfilledSample}>

                                <div>
                                    <Label for="pcnNumber">
                                        <h4>Refresh Fulfilled Sample Devices</h4>
                                    </Label>
                                </div>

                                <div>
                                    This will find any devices that have been shipped over 37 days ago,
                                    and it refreshes those devices.
                                </div>

                                <br/>
                                <br/>

                                <div>
                                    <Button color={color} disabled={disabled}>
                                        Refresh Fulfilled Samples
                                    </Button>
                                </div>

                            </Form>

                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.refreshSentData}>
                                <div>
                                    <Label for="pcnNumber">
                                        <h4>Refresh Sent Data Feedback Devices</h4>
                                    </Label>
                                </div>

                                <div>
                                    This will find the data feedbacks, with the data sent over 30 days ago,
                                    and it will refresh those devices.
                                </div>

                                <br/>
                                <br/>

                                <div>
                                    <Button color={color} disabled={disabled}>
                                        Refresh Sent Data Feedbacks
                                    </Button>
                                </div>

                            </Form>
                        </CardBody>

                    </Card>

                    <Card className={'h-100'}>

                        <CardBody>

                            <Form onSubmit={this.refreshExtendedEvaluation}>
                                <div>
                                    <Label for="pcnNumber">
                                        <h4>Refresh Extended Evaluation Devices</h4>
                                    </Label>
                                </div>

                                <div>
                                    This will find the reject feedbacks with extended evaluation
                                    disposition, and the evaluation date has passed. It will
                                    refresh the feedback's devices.
                                </div>

                                <br/>
                                <br/>

                                <div>
                                    <Button color={color} disabled={disabled}>
                                        Refresh Extended Evaluation
                                    </Button>
                                </div>

                            </Form>

                        </CardBody>

                    </Card>

            </CardColumns>


        </div>
    }

}

export default withLayout(TrackerBatchJobs)
