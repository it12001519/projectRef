import React from 'react'
import { Card, } from 'reactstrap'
import { GoodAlert, BadAlert, NeutralAlert,
  GoodBadge, BadBadge, WarningBadge, NeutralBadge, DarkBadge, LightBadge, } from 'js/app/models/ChangelinkUI'

class StatusTab extends React.Component {
  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Alerts</h5>

        <Card body className="mb-1">
          <h5>Successful Actions</h5>
          <div>
            <GoodAlert icon='check-circle' message='Successfully added a new record.' />
            <GoodAlert message='Item was deleted from the database.' />
            <GoodAlert message={<span><b>Success!</b> Form saved.</span>} />
          </div>
        </Card>
        <Card body className="mb-1">
          <h5>Unsuccessful Actions</h5>
          <div>
            <BadAlert icon='times-circle' message='Deleting record failed.' />
            <BadAlert message='System encountered an error.' />
            <BadAlert message={<span><b>Warning!</b> You are not allowed to do that transaction.</span>} />
          </div>
        </Card>
        <Card body className="mb-1">
          <h5>Non-Dangerous Information</h5>
          <div>
            <p>Use this to provide general information to the user.</p>
            <NeutralAlert icon='bullhorn' message='This is an announcement.' />
            <NeutralAlert message='This contains an Automotive change.' />
            <NeutralAlert message={<span><b>Note:</b> You have pending approvals.</span>} />
          </div>
        </Card>

        <div className="clearfix" style={{ height: '1em' }} />
        <h4>Badges</h4>

        <Card body className="mb-1">
          <p className="mb-0">
            Colored badges can be used to denote status.
            Here are common examples:<br />
            <GoodBadge className='mr-1 mb-1' label='APPROVED' />
            <BadBadge className='mr-1 mb-1' label='NOT APPROVED' />
            <BadBadge className='mr-1 mb-1' label='REJECTED' />
            <br />
            <WarningBadge className='mr-1 mb-1' label='PENDING' />
            <WarningBadge className='mr-1 mb-1' label='ON HOLD' />
            <WarningBadge className='mr-1 mb-1' label='NEEDS APPROVAL' />
            <NeutralBadge className='mr-1 mb-1' label='INACTIVE' />
            <NeutralBadge className='mr-1 mb-1' label='N/A' />
            <br />
            <BadBadge className='mr-1 mb-1' label='OVERDUE' />
            <WarningBadge className='mr-1 mb-1' label='DUE SOON' />
            <GoodBadge className='mr-1 mb-1' label='COMPLETED' />
          </p>
        </Card>

        <Card body className="mb-1">
          <p className="mb-0">
            Neutral badge colors can be used to signify non-status information.
            For example:<br />
            <DarkBadge className='mr-1 mb-1' label='Planning Phase' />
            <DarkBadge className='mr-1 mb-1' label='John Smith' />
            <DarkBadge className='mr-1 mb-1' label='2018-01-21' />
            <DarkBadge className='mr-1 mb-1' label='System Generated' icon='bolt' />
            <DarkBadge className='mr-1 mb-1' label='2' icon='comment' />
            <DarkBadge className='mr-1 mb-1' icon='paperclip' />
          </p>
        </Card>

        <Card body className="mb-1 bg-dark text-light">
          <p className="mb-0">
            If the background color of the parent element is dark, use the light badge alternative.
            For example:<br />
            <LightBadge className='mr-1 mb-1' label='Planning Phase' />
            <LightBadge className='mr-1 mb-1' label='John Smith' />
            <LightBadge className='mr-1 mb-1' label='2018-01-21' />
            <LightBadge className='mr-1 mb-1' label='System Generated' icon='bolt' />
            <LightBadge className='mr-1 mb-1' label='2' icon='comment' />
            <LightBadge className='mr-1 mb-1' icon='paperclip' />
          </p>
        </Card>

      </div>
    )
  }
}

export default StatusTab