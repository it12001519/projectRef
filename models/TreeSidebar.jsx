import React from 'react';
import { Card, Button, ButtonGroup, Badge } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { isArray } from 'js/universal/commons';
import Spinner from 'js/universal/spinner';

let TreeSidebar = class extends React.Component {

  static defaultProps = {
    expandAll: false
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ active: nextProps.active });
  }

  render() {
    return (
      <div className={this.props.className}>
        {
          this.props.title !== undefined
            ? <p><strong>{this.props.title}</strong></p>
            : undefined
        }
        {
          !!this.props.data
            ? (
              <Card body className='p-2'>
                {
                  isArray(this.props.data) && this.props.data.length > 0
                    ? (
                      this.props.data.map((node, i) => {
                        return (
                          <span key={`tree-nd-${i}-${node.value}`}>
                            {
                              node.nodes !== undefined && isArray(node.nodes) && node.nodes.length > 0
                                ? <TreeNodeExpandable label={node.label} value={node.value} badge={node.badge} active={node.label === this.props.active}
                                  nodes={node.nodes} isExpanded={this.props.expandAll}
                                  onClickCallback={this.props.onClickCallback} />
                                : <TreeNode label={node.label} value={node.value} badge={node.badge} active={node.label === this.props.active}
                                  onClickCallback={this.props.onClickCallback} />
                            }
                          </span>
                        )
                      })
                    )
                    : <p className='text-muted'>No records found</p>
                }
              </Card>
            )
            : (
              <Card body className='p-2' style={{ height: '5rem' }}>
                <Spinner showSpinner overlay={false} />
              </Card>
            )
        }
      </div>
    )
  }

}

class TreeNodeExpandable extends React.Component {

  static defaultProps = {
    isExpanded: false
  }

  constructor(props) {
    super(props)
    this.state = {
      isExpanded: this.props.isExpanded
    }
    this.onClick = this.onClick.bind(this)
  }

  toggleSubNodes() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  onClick(value) {
    if (typeof this.props.onClickCallback === 'function') {
      this.props.onClickCallback(value);
    }
  }

  render() {
    return (
      <div>
        <ButtonGroup className="mb-1">
          <Button outline color="primary" className="btn-node-expandable" onClick={() => this.onClick(this.props.value)}>
            {this.props.label}
            {
              this.props.badge
                ? (<Badge color='dark' className='ml-1'>{this.props.badge}</Badge>)
                : undefined
            }
          </Button>
          <Button outline color="primary" className="p-1 pr-2" onClick={this.toggleSubNodes.bind(this)}>
            {
              this.state.isExpanded
                ? <FontAwesome name='caret-up' className='ml-1' />
                : <FontAwesome name='caret-down' className='ml-1' />
            }
          </Button>
        </ButtonGroup>

        {
          this.state.isExpanded && !!this.props.nodes
            ? (
              this.props.nodes.map((node, i) => {
                return (
                  <div className='pl-3' key={`trsb-${node.label}-${i}`}>
                    <TreeNode label={node.label} value={node.value} badge={node.badge} className='ml-3'
                              onClickCallback={this.props.onClickCallback} active={node.label === this.props.active} />
                  </div>
                )
              })
            ) : undefined
        }
      </div>
    )
  }
}

class TreeNode extends React.Component {

  static defaultProps = {
    isActive: false
  }

  constructor(props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }

  onClick(value) {
    if (typeof this.props.onClickCallback === 'function') {
      this.props.onClickCallback(value);
    }
  }

  render() {
    let isOutline = !this.props.active;
    let badgeColor = !this.props.active ? 'dark' : 'light';
    return (
      <div>
        <Button outline={isOutline} color="primary" className="btn-node mb-1" onClick={() => this.onClick(this.props.value)}>
          {this.props.label}
          {
            !!this.props.badge && this.props.badge !== null && this.props.badge !== ''
              ? (<Badge color={badgeColor} className='ml-1'>{this.props.badge}</Badge>)
              : undefined
          }
        </Button>
      </div>
    )
  }
}

TreeSidebar.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
  active: PropTypes.string
};

export default styled(TreeSidebar) `

> p
{
  margin-bottom: .5rem;
}

.btn-node 
{
  min-width: 134px;
  max-width: 100%;
  text-align: left;
  white-space: normal;
}

.btn-node-expandable 
{
  min-width: 110px;
  text-align: left;
}
`
