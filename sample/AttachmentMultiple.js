import React from 'react';
import AttachmentField from "js/app/models/AttachmentField";
import ChangeLinkHelp from "js/app/models/ChangeLinkHelp";

class AttachmentMultiple extends React.Component {
    render(){
        return(
            <div className={this.props.className}>
                <AttachmentField />
            </div>
        )
    }
}

export default AttachmentMultiple
