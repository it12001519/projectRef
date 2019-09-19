import React from 'react'
import "css/required.css"

class Required extends React.Component {

    static defaultProps = {
        required: true
    }

    render() {
        return (
            <div>
                {this.props.children}
                {(this.props.required) ? <span className="required"> *</span> : null}
            </div>
        )
    }
}

export default Required
