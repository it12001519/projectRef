import React, { Component, } from 'react';
import 'whatwg-fetch';

import FontAwesome from 'react-fontawesome';
import { Table, Input } from 'reactstrap';
import { Link } from 'react-router-dom';

import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import { Button, } from 'reactstrap';

import "css/rotated-tables.css";

import withLayout from 'js/app/models/withLayout';

// const URL = '/api/v1/emailTest'; // API data

const ADMIN_ROLES = ['System Admin','ChangeLink Admin'];

const USER_ROLES =
    [
        {
            key: 'changeOwner',
            label: 'Change Owner'
        },
        {
            key: 'admin',
            label: 'Administrator'
        },
        {
            key: 'ccbApprovers',
            label: 'Selected CCB Approvers'
        },
        {
            key: 'ccbDelegates',
            label: 'Selected CCB Delegates'
        },
        {
            key: 'taskOwner',
            label: 'Task Owner'
        },
        {
            key: 'changeCoordinator',
            label: 'Change Coordinator'
        },
        {
            key: 'pcnCoordinator',
            label: 'PCN Coordinator'
        },
        {
            key: 'pcnAdmin',
            label: 'PCN Administrator'
        },
        {
            key: 'sampleAdmin',
            label: 'Sample Administrator'
        },
        {
            key: 'sampleCoordinator',
            label: 'Sample Coordinator'
        },
        {
            key: 'requestor',
            label: 'Requestor'
        },
        {
            key: 'tiListManager',
            label: 'TIS List Manager'
        },
        {
            key: 'tisMailingList',
            label: 'TIS Mailing List'
        },
        {
            key: 'customer',
            label: 'Customer'
        }
    ];

const PAGE_DATA = [
    {
        templateId: 1,
        templateName: 'ChangeLink Draft Template',
        changeState: 'Draft',
        emailSubject: 'Changelink $Change$ has been created and is in Draft Status',
        applicablePhase: 'None',
        roleData: [
            {
                role: 'changeOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'admin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbApprovers',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbDelegates',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'taskOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'changeCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'requestor',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tiListManager',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tisMailingList',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'customer',
                value: ~~(Math.random() * 3)
            }
        ]
    },
    {
        templateId: 2,
        templateName: 'ChangeLink Editorial Template',
        changeState: 'Submitted',
        emailSubject: 'Changelink $Change$, CCB $CCB$ has been Submitted for a Fast Track Datasheet Editorial Change',
        applicablePhase: '1',
        roleData: [
            {
                role: 'changeOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'admin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbApprovers',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbDelegates',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'taskOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'changeCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'requestor',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tiListManager',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tisMailingList',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'customer',
                value: ~~(Math.random() * 3)
            }
        ]
    },
    {
        templateId: 3,
        templateName: 'ChangeLink In Progress',
        changeState: 'Draft',
        emailSubject: 'Changelink $Change$, CCB $CCB$ `workflow has been initiated for Phase $Phase$',
        applicablePhase: '1-6',
        roleData: [
            {
                role: 'changeOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'admin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbApprovers',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbDelegates',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'taskOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'changeCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'requestor',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tiListManager',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tisMailingList',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'customer',
                value: ~~(Math.random() * 3)
            }
        ]
    },
    {
        templateId: 4,
        templateName: 'ChangeLink Hold Reminder',
        changeState: 'Hold',
        emailSubject: 'ChangeLink $Change$, CCB $CCB$, Phase $Phase$ weekly Hold reminder',
        applicablePhase: '5-6',
        roleData: [
            {
                role: 'changeOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'admin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbApprovers',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbDelegates',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'taskOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'changeCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'requestor',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tiListManager',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tisMailingList',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'customer',
                value: ~~(Math.random() * 3)
            }
        ]
    }, {
        templateId: 5,
        templateName: 'ChangeLink Bundled Email',
        changeState: 'Bundled',
        emailSubject: 'ChangeLink $Change$, CCB $CCB$, has been Bundled with $BChange$',
        applicablePhase: '4-6',
        roleData: [
            {
                role: 'changeOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'admin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbApprovers',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbDelegates',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'taskOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'changeCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'requestor',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tiListManager',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tisMailingList',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'customer',
                value: ~~(Math.random() * 3)
            }
        ]
    }, {
        templateId: 6,
        templateName: 'ChangeLink Rejected Email',
        changeState: 'Rejected',
        emailSubject: 'ChangeLink $Change$, CCB $CCB$, has been Rejected',
        applicablePhase: '6',
        roleData: [
            {
                role: 'changeOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'admin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbApprovers',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'ccbDelegates',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'taskOwner',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'changeCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'pcnAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleAdmin',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'sampleCoordinator',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'requestor',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tiListManager',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'tisMailingList',
                value: ~~(Math.random() * 3)
            },
            {
                role: 'customer',
                value: ~~(Math.random() * 3)
            }
        ]
    },
]

class EmailPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    key: 'templateId',
                    label: ''
                },
                {
                    key: 'templateName',
                    label: 'Template Name'
                },
                {
                    key: 'changeState',
                    label: 'Change State'
                },
                {
                    key: 'emailSubject',
                    label: 'Email Subject'
                },
                {
                    key: 'applicablePhase',
                    label: 'Applicable Phase'
                }
            ],
            roles: [],
            data: [],
            canUpdate: props.hasRole(ADMIN_ROLES)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    componentDidMount() {
        //   fetch(URL, {
        //       credentials: 'include'
        //   })
        //       .then(FetchUtilities.checkStatusWithSecurity)
        //       .then(response => response.json())
        //       .then((json) => this.setState({types: json}))
        //       .catch((error) => {
        //           FetchUtilities.handleError(error);
        //       })
        this.setState({
            roles: USER_ROLES,
            data: PAGE_DATA
        });
    }

    render() {
        let columns = JSON.parse(JSON.stringify(this.state.columns)); // Deep copy the old array
        // Remove the actions columns if uneditable
        if (!this.state.canUpdate) {
            delete columns[0]
        }

        return (
            <div>
                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Admin', active: true },
                    { text: 'Email Matrix', active: true }
                ]} />

                <h5>Admin &raquo; Email Matrix</h5>

                <Table responsive hover className="table-header-rotated">
                    <thead>
                        <tr>
                            {
                                columns.map((column) => {
                                    return (
                                        <th className="no-header" key={column.key}><div><span>{column.label}</span></div></th>
                                    );
                                })
                            }
                            {
                                this.state.roles.map((column) => {
                                    return (
                                        <th className="rotate css-transform table-header-rotated" key={column.key}><div><span>{column.label}</span></div></th>
                                    );
                                })
                            }
                        </tr>
                    </thead>
                    <tbody class='table-bordered'>
                        {
                            this.state.data.map((pageData) => {
                                return <EmailMatrixRow record={pageData} columns={columns} roles={this.state.roles} key={pageData.templateId} canUpdate={this.state.canUpdate} />
                            })
                        }
                    </tbody>
                </Table>
            </div>
        );
    }
}

class EmailMatrixRow extends Component {
    
    render() {
        return (
            <tr key={this.props.key}>
                {
                    this.props.columns.map((column) => {
                        if (column.key !== 'templateId') {
                            return (
                                <td className="data-row-header" key={"rowHeader-" + column.key + "-" + this.props.record['templateId']}>
                                    {this.props.record[column.key]}
                                </td>
                            );
                        } else {
                            return (
                                <td className="data-row-header" key={"rowHeader-" + column.key + "-" + this.props.record['templateId']}>
                                    <Link to='/admin/email/template' className='btn btn-outline-secondary btn-sm'>
                                        <FontAwesome name="pencil" />
                                    </Link>
                                </td>
                            );
                        }
                    })
                }
                {
                    this.props.roles.map((column) => {
                        return this.props.record.roleData.map((roleDatum) => {
                            if (roleDatum['role'] === column.key) {
                                return (
                                    <td>
                                        {
                                            this.props.canUpdate
                                                ? <ToggleButton templateId={this.props.record['templateId']} roleId={1} value={roleDatum['value']} />
                                                : roleDatum['value']
                                        }
                                    </td>
                                )
                            } else {
                                return undefined
                            }
                        })
                    })
                }
            </tr>
        )
    }
}

class ToggleButton extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [
                { color: 'secondary', label: 'none', value: '' },
                { color: 'primary', label: 'TO', value: 'TO' },
                { color: 'warning', label: 'CC', value: 'CC' }
            ],
            selectedIndex: this.props.value
        };

        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({
            selectedIndex: (this.state.selectedIndex + 1) % this.state.data.length,
            value: this.state.data[(this.state.selectedIndex + 1) % this.state.data.length].value
        });
    }

    render() {
        let button = [];
        if (this.state.data[this.state.selectedIndex].label === 'none') {
            button = <Button outline size="sm" onClick={this.handleClick} color={this.state.data[this.state.selectedIndex].color}>
                <FontAwesome name="ban" />
            </Button>
        }
        else {
            button = <Button size="sm" onClick={this.handleClick} color={this.state.data[this.state.selectedIndex].color}>
                {this.state.data[this.state.selectedIndex].label}
            </Button>
        }

        return (
            <div>
                {button}
                <Input type="hidden"
                    key={"toggle[" + this.props.templateId + "][" + this.props.roleId + "]"}
                    name={"toggle[" + this.props.templateId + "][" + this.props.roleId + "]"}
                    value={this.state.data[this.state.selectedIndex].label} />
            </div>
        );
    }
}

export default withLayout(EmailPage);
