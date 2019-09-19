import React from 'react'
import {Badge} from "reactstrap";

class Attachment extends React.Component {

    render() {
        return (
            <span>
                {this.props.attachment.name}
                &nbsp;
                <Badge color="dark" pill>
                    {this.props.attachment.content.length} Bytes
                </Badge>
            </span>
        )
    }

}

export default Attachment
