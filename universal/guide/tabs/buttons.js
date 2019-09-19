import React, { Component, } from 'react'
import { Card, CardTitle, CardText, } from 'reactstrap'
import { UtilityAlert, PrimaryButton, SecondaryButton, DangerButton, NeutralButton, } from 'js/app/models/ChangelinkUI'
import { showOverlaySpinner, hideOverlaySpinner } from 'js/universal/spinner'

class ButtonsTab extends Component {

  clicked = () => {
    showOverlaySpinner()
    setTimeout(() => { hideOverlaySpinner() }, 5000)    
  }

  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Buttons</h5>

        <UtilityAlert leadText='Rule:' message='If the button has an icon, the icon will always be placed at the left of the text.' />

        <h5>Button Colors</h5>

        <Card body>
          <CardTitle>Primary Actions (a.k.a Normal Flow)</CardTitle>
          <CardText>
            The "primary" color is used to denote primary actions in a page, which are part of the normal flow.
            <br />
            <PrimaryButton icon='plus' label='Add a New Record' className="mr-1 mt-1" />
            <PrimaryButton icon='save' label='Save Changes' className="mr-1 mt-1" />
            <PrimaryButton label='Submit Form' className="mr-1 mt-1" />
            <PrimaryButton icon='plus' className="mr-1 mt-1" />
            <PrimaryButton label='Click Me' className="mt-1" onClick={ () => alert('Oh no you didn\'t!') } />
          </CardText>
        </Card>
        <div className="clearfix" style={{ height: '1em' }} />

        <Card body>
          <CardTitle>Alternate Actions</CardTitle>
          <CardText>
            <p>
              <b>Safe Alternate Actions</b><br />
              These are actions which are part of a normal flow of the system.<br />
              <SecondaryButton icon='link' label='Add Link' className="mr-1 mt-1" />
              <SecondaryButton label='Put on Hold' className="mr-1 mt-1" />
              <SecondaryButton icon='check' label='Test Spinner' className="mr-1 mt-1" onClick={this.clicked} />
              <SecondaryButton icon='minus' className="mr-1 mt-1" />
            </p>
            <p>
              <b>Dangerous Alternate Actions</b><br />
              These are actions which are part of a normal flow AND needs to convey caution.<br />
              <DangerButton icon='trash' label='Delete Record' className="mr-1 mt-1" />
              <DangerButton label='Unapprove' className="mr-1 mt-1" />
              <DangerButton icon='trash' className="mr-1 mt-1" />
            </p>
            <p>
              <b>Neutral Actions</b><br />
              These are actions which doesn't affect the sytem.<br />
              <NeutralButton label='Cancel' className="mr-1 mt-1" />
              <NeutralButton label='Close Window' className="mr-1 mt-1" />
              <NeutralButton icon='angle-double-left' label='Back' className="mr-1 mt-1" />
              <NeutralButton icon='eye-slash' className="mr-1 mt-1" />
            </p>
          </CardText>
        </Card>
        <div className="clearfix" style={{ height: '1em' }} />

      </div>
    );
  }
}

export default ButtonsTab;