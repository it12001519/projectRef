import React from 'react'
import { Card, CardBody, CardHeader, } from "reactstrap";
import ChangeLinkHelp from "js/app/models/ChangeLinkHelp";
import AttachmentField from 'js/app/models/AttachmentField';
import { AttachmentDisplay, } from 'js/app/models/attachment';

class Attachments extends React.Component {

    static defaultProps = {
        required: false,
        attachments: []
    }

    constructor(props){
        super(props);
        this.state = {
            key: 'tbl-files-',
            formVisible: false // close form
        };
        this.handleAttachSubmit = this.handleAttachSubmit.bind(this);
    }

    // Handler for form button onSubmit for attachment
    handleAttachSubmit(message, isSuccess) {
        if (isSuccess) {
            var m = new Date().getMilliseconds();
            this.setState({
                key: 'tbl-files-' + m, // Refresh the table
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });

        } else {
            this.setState({
                notify: 'error',
                notifyText: message,
                formVisible: false // close form
            });
        }
    }

    render() {
        return (
            <Card className={this.props.className}>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    Attachments
                    <ChangeLinkHelp text="Attach any files needed to support or justify the sample request"/>
                </CardHeader>

                <CardBody>
                   <AttachmentField 
                            id={this.props.device}
                            loc='Samples'
                            classification={this.props.device}
                            context='' //should be PCN number
                            onCancel={this.handleFormCancel}
                            onSubmit={this.handleAttachSubmit}
                    />
                    <AttachmentDisplay
                            id={this.props.device}
                            loc='Samples'
                            classification={this.props.device}
                            context='' //should be PCN number
                            key={this.state.key}
                    />
                </CardBody>

               

            </Card>                    
        )

    }
}

export default Attachments
