import React from 'react';

import ReactiveTable, {ReactiveTableStore,} from 'reactive-tables';
import FetchUtilities from 'js/universal/FetchUtilities';
import { GridTextCell, GridLinkCell } from 'js/universal/GridCells';
import { FormWidgetRadioButtonGroup, FormWidgetTextArea } from 'js/universal/FormFieldWidgets'
import { PrimaryButton } from 'js/app/models/ChangelinkUI'
import styled from 'styled-components';
import Validator from 'validatorjs'
import classnames from 'classnames'
import { confirmModal } from 'js/universal/Modals'

const TABLE_COLUMNS = [
    {
        key: "approvals",
        label: "Approval"
    },{
        key: 'changeNo',
        label: 'Change Number'
    }, {
        key: "changeType",
        label: "Change Type"
    }, {
        key: "project",
        label: "Project"
    }, {
        key: "title",
        label: "Title"
    }, {
        key: "description",
        label: "Description"
    }, {
        key: "functionName",
        label: "Role"
    }, {
        key: "primaryName",
        label: "Primary"
    }, {
        key: "comments",
        label: "Comments"
    }
];
const URL = "/api/v1/dashboard_data/approvals";
const saveURL = "/api/v1/dashboard_data/save_approvals/"
 
let rules = {
    approval: ['required']
}

let message = {
    'required': '*Required.'
}
class ApprovalsTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: TABLE_COLUMNS,
            reviewApprovals: [],
            reviewed: [],
            validity: {
                approval: ''
            },
            errors: {
                approval: ''
            },
            affectedRows: []
        }
        this.table = null;
    }

    componentDidMount() {
        sessionStorage.clear();
    }

    validate = (body) => {
        let validation;
        body.details.map((item, index) => {
            validation = new Validator(item, rules, message);
            validation.passes();

            let formValidity = {};
            let formErrors = {};

            for(let field in item) {
                formValidity[field] = !validation.errors.has(field);
                formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
            }

            this.setState({
                validity: formValidity,
                errors: formErrors
            });

            let affected = {'changeId' : item.changeId, 'roleId': item.roleId}
            this.setState(previousState => ({
                affectedRows: [...previousState.affectedRows, affected]
            }))
        })
        return validation.passes();
    } 

    handleSave = () => {
        var dashboardApprovals = [];
        for(var i in sessionStorage){
            if(sessionStorage.hasOwnProperty(i)){
                dashboardApprovals.push(JSON.parse(sessionStorage[i]));
            }
        }

        let body = {
            details : dashboardApprovals
        }

        if(body.details.length > 0) {
            if(this.validate(body)) {
                fetch(saveURL, {
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
                .then(response => {
                    sessionStorage.clear();
                    window.location.reload(true);
                    // To do: reload table only. Current issue: not showing latest data after refresh
                    //this.tableRefresh();
                })
                .catch(error => FetchUtilities.handleError(error))
            }
        } else {
            sessionStorage.clear();
            this.tableRefresh();
        }
        
    }

    tableRefresh = () =>  {
        this.table.refresh();
    }

    render() {
        let customTopBar = (<PrimaryButton icon='save' label='Save Changes' className="mr-1 mt-1"  type="button" onClick={() => this.handleSave()}/>)
        let row = (props) => {return (<MyApprovalsRow {...props} errors={this.state.errors} validity={this.state.validity} affectedRows={this.state.affectedRows}/>)}
        return (
            <React.Fragment>
                <ReactiveTableStore server credentials={'include'} tableId="my_approvals_table"> 
                    <ReactiveTable server
                        ref={(table) => this.table = table}
                        credentials={'include'}
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        striped columnFilters advancedColumns
                        columns={TABLE_COLUMNS}
                        url={URL}
                        row={row}
                        customTopBar={customTopBar}
                        mirrorCustomTopBar
                    />
                </ReactiveTableStore>
            </React.Fragment>
        )
    }
}

class MyApprovalsRow extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            needsReview: this.props.data,
            errors: this.props.errors,
            validity: this.props.validity,
            affectedRows: this.props.affectedRows,
            toggleModal: false,
            indexModal: undefined
        }
    }

    handleChange = (name, value) => {
        let confirmMessage = 'Are you sure you want to reject ' + this.props.data.changeNo + '?'
        if(value === 'N') {
            confirmModal(confirmMessage, () => this.closeModal(name, value), () => this.toggleModal())
        } else {
            this.setState({
                needsReview: {...this.state.needsReview, [name]: value}
            }, () => sessionStorage.setItem(this.props.data.changeNo + ' - ' + this.props.data.roleId, JSON.stringify(this.state.needsReview)))
        }
    }

    toggleModal = () => {
        this.setState({
            toggleModal: undefined
        })
    }

    closeModal = (name, value) => {
        this.setState({
          toggleModal: undefined,
          needsReview: {...this.state.needsReview, [name]: value}
        }, () => sessionStorage.setItem(this.props.data.changeNo + ' - ' + this.props.data.roleId, JSON.stringify(this.state.needsReview)));
      }

    render() {
        const cells = this.props.columns.map(column => {
            const key = 'column-' + column.key;
                if(column.key === "changeNo") {
                    const changeUri = "/change/" + this.state.needsReview.changeNo
                    return <GridLinkCell key={key} url={changeUri}>{this.state.needsReview[column.key]}</GridLinkCell>
                } else if (column.key === "approvals") { 
                    return  <div style={{ "width" : '90px', "marginLeft" : '5px', "marginTop" : '5px', "overflow": 'hidden'}}>
                    <FormWidgetRadioButtonGroup name='approval' value={this.state.needsReview.approval} spaced
                        options={[{ value: "Y", label: "Approve", color: "success" }, { value: "N", label: "Reject", color: "danger" }]} onChange={this.handleChange.bind(this)}/>
                    {this.state.affectedRows.length > 0 ? (
                        this.state.affectedRows.map((item, index) => {
                                if(item.changeId === this.state.needsReview.changeId && item.roleId === this.state.needsReview.roleId) {
                                    return <div className={classnames({"valid-feedback": this.state.validity.approval}, {"invalid-feedback": !this.state.validity.approval})} style={{ display: 'block', marginTop: '-0.9rem' }}>{this.state.errors.approval}</div>
                                }
                        })
                    ) : undefined}   
                    </div> 
                } else if (column.key === "comments") {
                    return <FormWidgetTextArea 
                    name="comments"
                    onChange={this.handleChange}
                    value={this.state.needsReview.comments} 
                    style={{ input : { "marginBottom": '-10px', "width": '200px' }}}/>
                } else {
                    return <GridTextCell key={key}>{this.state.needsReview[column.key]}</GridTextCell>
                }
            })
        return <tr>{cells}</tr>
    }
}

export default styled(ApprovalsTab)`
div.tableFrame {
    overflow: hidden
}`;