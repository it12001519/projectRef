import React from "react";
import "css/pair.css"
import {Col, Row} from "reactstrap";

class Pair extends React.Component {

    static defaultProps = {
        divisor: ":"
    }

    render() {
        return (
            <Row className="pair">

                <Col xs={5} className="text-right pair-left">
                    <b>{this.props.name}</b>
                </Col>

                <Col xs={2} className="text-center pair-center">
                    {this.props.divisor}
                </Col>

                <Col xs={5} className="pair-right">
                    {this.props.value}
                </Col>

            </Row>
        )
    }
}

export default Pair
