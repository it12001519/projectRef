import React from 'react';
import { Button, Label, Row } from 'reactstrap';
import ReactiveTable from 'reactive-tables';

import Spinner from 'js/universal/spinner/';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import withLayout from 'js/app/models/withLayout';

const ADMIN_ROLES = ['System Admin','ChangeLink Admin'];

class AutoDelegate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            showSpinner: false,
            canTrigger: props.hasRole(ADMIN_ROLES),
            columns: [
                {
                    key: 'ROLE_ID',
                    label: 'Role ID'
                }, {
                    key: 'FUNCTION_NAME',
                    label: 'Function Name'
                }, {
                    key: "PRIMARY_ID",
                    label: "Primary ID"
                }, {
                    key: "PRIMARY_NAME",
                    label: "Primary Name"
                }, {
                    key: "DELEGATE_ID",
                    label: "Delegate ID"
                }, {
                    key: "DELEGATE_NAME",
                    label: "Delegate Name"
                }
            ]
        }
        this.handleAction = this.handleAction.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canTrigger: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    toggleSpinner() {
        this.setState({
            showSpinner: !this.state.showSpinner
        })
    }

    handleAction(action) {
        this.toggleSpinner();
        fetch(`/scheduled/job/` + action, {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }),
        }).then((response) => {
            if (!response.ok) {
                throw new Error({});
            } else {
                return response.json();
            }
        }).then((json) => {
            this.setState({
                data: json,
                showSpinner: !this.state.showSpinner
            });
        })
    }

    render() {
        return (
            <div>
                <Spinner showSpinner={this.state.showSpinner} />

                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Admin', active: false },
                    { text: 'Scheduled Jobs', active: true }
                ]} />

                {
                    this.state.canTrigger
                        ? (
                            <span>
                                <Button color="primary" className="mr-1" onClick={() => { this.handleAction("INACTIVE_DELEGATE") }}>Notify primary with inactive delegate</Button>
                                <Button color="primary" className="mr-1" onClick={() => { this.handleAction("NO_DELEGATE") }}>Notify primary without delegate</Button>
                                <Button color="primary" className="mr-1" onClick={() => { this.handleAction("CHANGE_DELEGATE_TO_PRIMARY") }}>Change delegate to primary</Button>
                                <Button color="primary" className="mr-1" onClick={() => { this.handleAction("INACTIVE_PRIMARY_DELEGATE") }}>Notify admins that primary and delegate are inactive</Button>
                            </span>
                        )
                        : (
                            <span>
                                <Button color="secondary" className="mr-1" disabled>Notify primary with inactive delegate</Button>
                                <Button color="secondary" className="mr-1" disabled>Notify primary without delegate</Button>
                                <Button color="secondary" className="mr-1" disabled>Change delegate to primary</Button>
                                <Button color="secondary" className="mr-1" disabled>Notify admins that primary and delegate are inactive</Button>
                            </span>
                        )
                }
                <Row><Label></Label></Row>

                <ReactiveTable
                    columns={this.state.columns}
                    data={this.state.data.content}
                    striped
                />
            </div>
        );
    }
}

export default withLayout(AutoDelegate);