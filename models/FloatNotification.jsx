import React, { Component, } from 'react';
import { Alert  } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import "css/floating-notification.css";

const AUTO_DISMISS_FADE_MS = 10000; // 10 seconds later...

class FloatNotify extends Component {

  static defaultProps = {
    icon: 'info-circle',
    color: 'info',
    autoDismiss: false
  }

  constructor(props) {
    super(props)
    this.state = {
      visible: true
    }
  }

  componentWillReceiveProps() {
    this.setState({ visible: true })
  }

  render() {
    if (this.props.autoDismiss !== undefined && this.props.autoDismiss)
      setTimeout(() => { this.setState({ visible: false }) }, AUTO_DISMISS_FADE_MS)
    return (
      <Alert color={this.props.color} className='flt-notification-body' isOpen={this.state.visible} toggle={() => this.setState({ visible: false })}>
        <FontAwesome name={this.props.icon} />{' '}{`${this.props.message}`}
      </Alert>
    );
  }
}

class FloatNotifyInfo extends Component {
  render() {
    const {...other} = this.props
    return (
      <FloatNotify color='info' icon='info-circle' {...other} />
    )
  }
}

class FloatNotifySuccess extends Component {
  render() {
    const {...other} = this.props
    return (
      <FloatNotify color='success' icon='check-circle' {...other} />
    )
  }
}

class FloatNotifyDanger extends Component {
  render() {
    const {...other} = this.props
    return (
      <FloatNotify color='danger' icon='exclamation-circle' {...other} />
    )
  }
}

export { FloatNotify, FloatNotifyInfo, FloatNotifySuccess, FloatNotifyDanger };