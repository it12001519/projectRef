import React from 'react'
import FontAwesome from 'react-fontawesome'
import {UncontrolledTooltip} from "reactstrap";
import 'css/changelinkhelp.css'

/*

    displays a icon (floated right) that is a tooltip

    props.icon = the name of the font awesome icon
    props.text = the text of the tooltip

    example usage:

        <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
            {this.props.title}
            <ChangeLinkHelp icon={this.props.helpIcon} text={this.props.helpText}/>
        </CardHeader>

 */

class ChangeLinkHelp extends React.Component {

    static defaultProps = {
        text: 'text not set',
        icon: 'question-circle-o'
    }

    render() {

        const {text, icon} = this.props

        // we need an id for the target. so create a random names icon
        const target = 'tooltip' + Math.floor(Math.random() * 100000)

        return (
            <span className="pull-right text-warning" id={target}>
                <FontAwesome name={icon}/>
                <UncontrolledTooltip placement="top" target={target}>
                    {text}
                </UncontrolledTooltip>
            </span>
        )
    }

}

export default ChangeLinkHelp
