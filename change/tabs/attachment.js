import React from 'react';
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";
import AttachmentField from 'js/app/models/AttachmentField';
import { AttachmentTab, } from 'js/app/models/attachment';

const ADMIN_ROLES = ['Change Coordinator', 'ChangeLink Admin', 'System Admin'];
class AttachmentTabDisplay extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            key: 'tbl-files-',
            formVisible: this.props.isVisible,
            editable: false,
            canEdit: props.hasRole(ADMIN_ROLES)
            , canDelete: this.props.canDelete
        };
        this.handleAttachSubmit = this.handleAttachSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {       
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess)){
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
                , canDelete: nextProps.canDelete
            })
        } else {
            this.setState({canDelete: nextProps.canDelete})
        }
    }

    componentWillMount(){
        if(this.props.fields !== null && this.props.fields !== undefined){
            let ownerId = null, currentUser = null;
            if(this.props.fields !== undefined){
                this.props.fields.forEach((o) => {
                    if(o.label === "Change Owner"){                        
                        if(o.value.includes('('))
                            ownerId = o.value.match(/[aAxX]{1}\w{7}/g)
                        else
                            ownerId = o.value
                    }
                });
            }

            currentUser = `${this.props.userDetails.name} (${this.props.userDetails.id})`;

            if(!this.props.hasRole(ADMIN_ROLES)){
                if(this.props.userDetails.id === ownerId[0]){                    
                    this.setState({formVisible : true, editable : true, canDelete: this.props.canDelete});
                }
                else
                    this.setState({formVisible : false, editable : false, canDelete: false});
            }else{
                this.setState({formVisible : true, editable : true, canDelete: true});
            }
        }
    }

    // Handler for form button onSubmit for attachment
    handleAttachSubmit(message, isSuccess) {
        if (isSuccess) {
            var m = new Date().getMilliseconds();
            this.setState({
                key: 'tbl-files-' + m, // Refresh the table
                notify: 'success',
                notifyText: 'Success: ' + message
            });

        } else {
            this.setState({
                notify: 'error',
                notifyText: message
            });
        }
    }

    render() {
        return(
            <div>
                <ChangeLinkBreadcrumb crumbs={[{ text: 'More', active: true }, { text: 'Attachments', active: true }]} />
                {this.state.formVisible ? 
                    <AttachmentField 
                        id={this.props.number}
                        loc={this.props.loc}
                        context={this.props.number}
                        onCancel={this.handleFormCancel}
                        onSubmit={this.handleAttachSubmit}
                    /> : <span></span>
                }
                <div class="row">&nbsp;</div>
                <AttachmentTab 
                    id=''
                    loc=''
                    context={this.props.number}
                    key={this.state.key}
                    editable={this.state.editable}
                    canDelete={this.state.canDelete}
                />
            </div>
        
        )
        
    }
}

export default AttachmentTabDisplay
