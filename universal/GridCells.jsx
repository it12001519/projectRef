import React, { Component, } from 'react'
import { Link } from 'react-router-dom'
import FontAwesome from 'react-fontawesome'
import { BigBadge } from 'js/app/models/ChangelinkUI'

// Define constants here
const DEFAULT_BADGE_COLOR = 'dark'
const DEFAULT_COLOR_MAPPING = {
  'APPROVED': 'success',
  'NOT APPROVED': 'danger',
  'REJECTED': 'danger',
  'PENDING': 'warning',
  'HOLD': 'warning',
  'ON HOLD': 'warning',
  'INACTIVE': 'secondary',
  'N/A': 'secondary'
}

export const GridTextCell = (props) => {
  let align = props.align || 'left'
  return <td style={{ textAlign: align }}>{props.children}</td>
}

export const GridLinkCell = (props) => {
  let align = props.align || 'left'
  let linkClass = props.button ? 'btn btn-outline-secondary btn-sm' : '';
  if (props.external) {
    return <td style={{ textAlign: align }}>
      <a href={props.url} className={linkClass} target="_blank" rel="noopener noreferrer">{props.children}</a>
    </td>
  } else {
    return <td style={{ textAlign: align }}>
      <Link to={props.url} target={props.newTab ? '_blank' : '_self'} rel='noopener noreferrer' className={linkClass}>{props.children}</Link>
    </td>
  }
}

export class GridCheckboxCell extends Component {

  static defaultProps = {
    id: '',
    checked: false,
    disabled: false,
    callback: () => function () { return true }
  }

  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.checked
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ checked: nextProps.checked })
  }

  _fnCallback() {
    this.setState({ checked: !this.state.checked });
    this.props.callback(!this.state.checked, this.props.id);
    return true;
  }

  render() {
    return (
      <td style={{ textAlign: 'center' }}>
        {
          <input type="checkbox" id={this.props.key + '-chk' + this.props.id}
            checked={this.state.checked} disabled={this.props.disabled}
            onChange={this._fnCallback.bind(this)}
            style={{ marginLeft: '0' }} />
        }
      </td>
    );
  }
}

export class GridBadgeCell extends Component {

  static defaultProps = {
    colorMapping: DEFAULT_COLOR_MAPPING
  }

  render() {
    // Try to determine the color of the badge
    let color;
    if (this.props.color)
      color = this.props.color;
    if (color === undefined && this.props.colorMapping)
      color = this.props.colorMapping[this.props.data];
    // If the color is still not set, or has an unsupported value, set it to default
    color = color === undefined || (color !== 'primary' && color !== 'secondary'
      && color !== 'warning' && color !== 'danger' && color !== 'success'
      && color !== 'dark' && color !== 'light')
      ? DEFAULT_BADGE_COLOR : color;

    return (
      <td><BigBadge color={color}>{this.props.data}</BigBadge></td>
    );
  }
}

export const GridActionButton = ({icon, title, callback}) => {
  if (typeof callback !== 'function')
    callback = () => { return }
  title = !!title ? title : !!icon ? icon : 'Button'
  return <button className='mr-2 mb-1 btn btn-outline-dark btn-sm' type='button' title={title} onClick={callback}><FontAwesome name={icon} /></button>
}

export class GridActionCell extends Component {
  defaultProps = {
    buttons: []
  }

  render() {
    return (
      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
        {
          this.props.buttons ? (
            this.props.buttons.map((btn, i) => {
              if (!!btn.url) {
                if (btn.external)
                  return (
                    <a href={btn.url} key={`${this.props.key}-btn${i}`} title={btn.title} className='btn btn-outline-dark btn-sm mr-2 mb-1' target="_new">
                      <FontAwesome name={btn.icon} />
                    </a>
                  )
                else
                  return (
                    <Link to={btn.url} key={`${this.props.key}-btn${i}`} title={btn.title} className='btn btn-outline-dark btn-sm mr-2 mb-1'>
                      <FontAwesome name={btn.icon} />
                    </Link>
                  )
              } else {
                return <GridActionButton key={`${this.props.key}-btn${i}`} icon={btn.icon} title={btn.title} callback={btn.callback} />
              }
            })
          ) : undefined
        }
      </td>
    );
  }
}
