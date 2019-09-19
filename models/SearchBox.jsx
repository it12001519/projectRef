import React from 'react'
import { InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'
import FontAwesome from 'react-fontawesome'

class SearchBox extends React.Component {

  static defaultProps = {
    clearAfterSearch: false
  }

  state = {
    value: !!this.props.value ? this.props.value : ''
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: !!nextProps.value ? nextProps.value : '' })
  }

  onChange = (e) => {
    this.setState({ value: e.target.value })
  }

  onKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.submit()
    } else {
      this.onChange(e)
    }
  }

  submit = () => {
    if (typeof this.props.onSubmit === 'function')
      this.props.onSubmit(this.state.value)
    if (this.props.clearAfterSearch)
      this.setState({ value: '' })
  }

  render() {
    return (
      <InputGroup>
        {
          !!this.props.label
            ? <InputGroupAddon addonType="prepend">{this.props.label}</InputGroupAddon>
            : undefined
        }
        <Input type='search' placeholder={this.props.placeholder} value={this.state.value} onChange={this.onChange} onKeyPress={this.onKeyPress} />
        <InputGroupAddon addonType="append">
          <Button color='primary' onClick={this.submit}><FontAwesome name='search' /></Button>
        </InputGroupAddon>
      </InputGroup>
    )
  }

}

export default SearchBox
