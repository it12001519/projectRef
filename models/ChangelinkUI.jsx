import React from 'react'
import styled from 'styled-components'
import { Badge, } from 'reactstrap'

/***********
 * Headers *
 ***********/

export const PageHeader = styled(({ className = "", ...props}) => {
  return <h5 className={`changelink-header ${className}`}>{props.children}</h5>
}) `
font-size: 1.5rem;
`

export const SubHeader = styled(({ className = "", ...props}) => {
  return <h6 className={`changelink-subheader ${className}`}>{props.children}</h6>
}) `
font-size: 1.2rem;
float: left;
`

export const SmallHeader = styled(({ className = "", ...props}) => {
  return <strong className={`changelink-smallheader ${className}`}>{props.children}</strong>
}) `
font-size: 1rem;
`

/***********
 * Buttons *
 ***********/

const BaseButton = ({ key, label, icon, className, onClick }) => {
  if (typeof onClick !== 'function')
    onClick = () => { return }
  return (
    <button type='button' key={key} className={`btn ${className}`} onClick={onClick}>
      {!!icon ? <span className={`fa fa-${icon}`} aria-hidden='true' /> : undefined}
      {' '}{label}
    </button>
  )
}

export const PrimaryButton = ({ label, icon, className, onClick }) => {
  return <BaseButton label={label} icon={icon} className={`btn-primary ${className}`} onClick={onClick} />
}

export const SecondaryButton = ({ label, icon, className, onClick }) => {
  return <BaseButton label={label} icon={icon} className={`btn-secondary ${className}`} onClick={onClick} />
}

export const DangerButton = ({ label, icon, className, onClick }) => {
  return <BaseButton label={label} icon={icon} className={`btn-danger ${className}`} onClick={onClick} />
}

export const NeutralButton = ({ label, icon, className, onClick }) => {
  return <BaseButton label={label} icon={icon} className={`btn-outline-secondary ${className}`} onClick={onClick} />
}

export const AwesomeCheckbox = styled(({ className, size, color, checked, onClick }) => {
  // Determine the size, if props given
  let fasize = ''
  switch(size) {
    case 'sm': fasize = 'fa-lg'; break; 
    case 'lg': fasize = 'fa-3x'; break; 
    case 'xl': fasize = 'fa-5x'; break; 
    default: fasize = 'fa-2x';
  }
  // Determine the color, if props given
  let facolor = ''
  if (['primary','secondary','success','warning','danger','info','muted','dark','light'].indexOf(color) > -1)
    facolor = 'text-' + color
  // Determine whether to show checked or not
  let icon = (!!checked && checked) ? 'fa fa-check-circle' : 'fa fa-circle-thin'
  // Set a default of the onClick function
  let onClickCheckbox = onClick
  if (typeof onClick !== 'function')
    onClickCheckbox = () => { return }
  return <span className={`${className} ${facolor}`} onClick={onClickCheckbox}><i class={`${icon} ${fasize}`}></i></span>
})`
cursor: pointer;
`

/**********
 * Badges *
 **********/

const BaseBadge = ({ label, icon, className }) => {
  return (
    <span className={`badge ${className}`}>
      {!!icon ? <span className={`fa fa-${icon}`} aria-hidden='true' /> : undefined}
      {!!label ? ` ${label}` : undefined}
    </span>
  )
}

export const GoodBadge = ({ label, icon, className }) => {
  return <BaseBadge label={label} icon={icon} className={`badge-success ${className}`} />
}

export const BadBadge = ({ label, icon, className }) => {
  return <BaseBadge label={label} icon={icon} className={`badge-danger ${className}`} />
}

export const WarningBadge = ({ label, icon, className }) => {
  return <BaseBadge label={label} icon={icon} className={`badge-warning ${className}`} />
}

export const NeutralBadge = ({ label, icon, className }) => {
  return <BaseBadge label={label} icon={icon} className={`badge-secondary ${className}`} />
}

export const DarkBadge = ({ label, icon, className }) => {
  return <BaseBadge label={label} icon={icon} className={`badge-dark ${className}`} />
}

export const LightBadge = ({ label, icon, className }) => {
  return <BaseBadge label={label} icon={icon} className={`badge-light ${className}`} />
}

export const PrimaryBadge = ({ label, icon, className }) => {
  return <BaseBadge label={label} icon={icon} className={`badge-primary ${className}`} />
}

export const BigBadge = styled((props) => {
  return (
    <Badge {...props}
      className={`${props.className} p-2`}>
      {props.children}
    </Badge>
  )
}) `
min-width: 6rem;
font-size: inherit;
`

/**********
 * Alerts *
 **********/

const BaseAlert = (props) => {
  return (
    <div className={`alert fade show ${props.className}`} role='alert'>
      {!!props.icon ? <span className={`mr-2 fa fa-2x fa-pull-left fa-${props.icon}`} style={{ marginTop: '-.25rem' }} aria-hidden='true' /> : undefined}
      {props.children}
    </div>
  )
}

export const GoodAlert = ({ message, icon, className }) => {
  return <BaseAlert icon={icon} className={`alert-success ${className}`}>{message}</BaseAlert>
}

export const BadAlert = ({ message, icon, className }) => {
  return <BaseAlert icon={icon} className={`alert-danger ${className}`}>{message}</BaseAlert>
}

export const NeutralAlert = ({ message, icon, className }) => {
  return <BaseAlert icon={icon} className={`alert-info ${className}`}>{message}</BaseAlert>
}

export const UtilityAlert = ({ leadText, message, className }) => {
  return <BaseAlert icon='wrench' className={`alert-info ${className}`}><strong>{leadText}</strong> {message}</BaseAlert>
}

export const InfoAlert = ({ leadText, message, className }) => {
  return <BaseAlert icon='info-circle' className={`alert-info ${className}`}><strong>{leadText}</strong> {message}</BaseAlert>
}

export const HelpAlert = ({ leadText, message, className }) => {
  return <BaseAlert icon='life-ring' className={`alert-info ${className}`}><strong>{leadText}</strong> {message}</BaseAlert>
}

/********
 * Tabs *
 ********/

const HorizontalNavTab = ({ label, link, icon, badge, active, key }) => {
  let href = link || '/#'
  return (
    <li className='nav-item' key={key}>
      <a className={active ? `nav-link active` : `nav-link`} href={href}>
        {icon && <span className={`mr-1 fa fa-${icon}`} aria-hidden={true} />}
        {label}
        {badge ? active ? <DarkBadge label={badge} className='ml-1' /> : <PrimaryBadge label={badge} className='ml-1' /> : undefined}
      </a>
    </li>
  )
}

export const HorizontalTabs = ({ tabs }) => {
  if (!!tabs && tabs !== []) {
    return (
      <ul className='nav nav-tabs chg-horizontal-tabs'>
        {
          tabs.map((tab, i) => {
            return <HorizontalNavTab {...tab} key={i} />
          })
        }
      </ul>
    )
  } else {
    return undefined
  }
}

const VerticalNavTab = ({ label, link, icon, badge, active, key }) => {
  let href = link || '/#'
  let elemClass = active ? `list-group-item-action list-group-item text-light` : `list-group-item-action list-group-item text-primary`
  let style = active ? { backgroundColor: '#343a40' } : {}
  return (
    <a className={elemClass} style={style} href={href}>
      {icon && <span className={`mr-1 fa fa-${icon}`} aria-hidden={true} />}
      {label}
      {badge ? active ? <LightBadge label={badge} className='ml-1' /> : <PrimaryBadge label={badge} className='ml-1' /> : undefined}
    </a>
  )
}

export const VerticalTabs = ({ tabs }) => {
  if (!!tabs && tabs !== []) {
    return (
      <ul className='list-group'>
        {
          tabs.map((tab, i) => {
            return <VerticalNavTab {...tab} key={i} />
          })
        }
      </ul>
    )
  } else {
    return undefined
  }
}

export const WizardProgress = styled(({ progress, numbered, onToggle, className }) => {
  if (typeof onToggle !== 'function')
    onToggle = _=> { return }
  return (
    <nav className={`nav nav-pills nav-fill ${className}`}>
      {
        progress.map(({ label, status }, i) => {
          let badgeclass, navclass
          switch(status) {
            case 'active':
              badgeclass = 'badge-light'; navclass = 'active'; break;
            case 'complete':
              badgeclass = 'badge-success'; navclass = 'text-success'; break;
            default:
              badgeclass = 'badge-dark'; navclass = 'disabled'; break;
          }
          return <span key={`wiz-progress-itm-${i}`} className={`nav-item nav-link ${navclass}`} onClick={_=> onToggle(i)}>
            { numbered ? <span className={`badge badge-pill ${badgeclass}`}>{i+1}</span> : undefined }{' '}
            {`${label}`}
            {' '}{ status === 'complete' ? <span className='fa fa-check' aria-hidden='true' /> : undefined }
          </span>
        })
      }
    </nav>
  )
})``