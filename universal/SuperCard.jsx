import React from 'react'
import { Card, CardHeader, CardBody, Collapse, } from 'reactstrap'
import FontAwesome from 'react-fontawesome'
import classnames from 'classnames'
import styled from 'styled-components'
import ChangeLinkHelp from "js/app/models/ChangeLinkHelp"

class SuperCard extends React.Component {

  static defaultProps = {
    collapsible: false,
    collapsed: false
  }

  // Set the default state
  state = {
    collapsible: this.props.collapsible,
    collapsed: this.props.collapsed
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ collapsed: nextProps.collapsed })
  }

  toggleCollapse = () => {
    if (this.state.collapsible) {
      this.setState({ collapsed: !this.state.collapsed });
      if (typeof this.props.onCollapse === 'function')
        this.props.onCollapse(this.props.key, !this.state.collapsed);
    }
  }

  render() {
    return (
      <div className={this.props.className} key={this.props.key}>
        <Card>
          <CardHeader tag='strong' className={classnames('text-white', 'bg-dark', { 'collapsible-header': this.state.collapsible }, { 'rounded-bottom': this.state.collapsed })} onClick={this.toggleCollapse}>
            {
              this.state.collapsible ? (
                this.state.collapsed ? (
                  <FontAwesome name="plus-square" />
                ) : (
                  <FontAwesome name="minus-square" />
                )
              ) : undefined
            }
            {' '} {this.props.title}
            {
              this.props.helptext ? (
                <ChangeLinkHelp text={this.props.helptext} />
              ) : undefined
            }
          </CardHeader>
          <Collapse isOpen={!this.state.collapsed}>
            <CardBody>
              {this.props.children}
            </CardBody>
          </Collapse>
        </Card>
      </div>
    )
  }
}

export default styled(SuperCard) `
  margin-bottom: 0.5rem;
  
  .collapsible-header
  {
    cursor: pointer;
  }
`;