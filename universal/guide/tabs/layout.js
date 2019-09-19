import React, { Component, } from 'react'
import { Button, CardColumns, Card, CardBody, CardTitle, CardSubtitle, CardText } from 'reactstrap'
import { PageHeader, SubHeader, SmallHeader } from 'js/app/models/ChangelinkUI'

import SuperCard from "js/universal/SuperCard";

class LayoutTab extends Component {
  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Headers</h5>

        <div>
          <p>Headers will be used to denote plain text heirarchy in a page. In Changelink, we'll only be using h3, h4, and h5 to form a 3-tiered header heirarchy.</p>

          <Card body>
            <PageHeader>Page Header {' '}<small muted>(Use this sparingly)</small></PageHeader>
            <SubHeader>Sub Header {' '}<small muted>(Use this when header is at the top of the page)</small></SubHeader>
            <SmallHeader>Small Header {' '}<small muted>(Use this as the smallest header)</small></SmallHeader>
          </Card>
        </div>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Card Hierarchy</h5>

        <SuperCard title="Super Card" helptext="You may use this to group together other card elements">
          <CardColumns>
            <Card>
              <CardBody>
                <CardTitle>Card title</CardTitle>
                <CardSubtitle>Card subtitle</CardSubtitle>
                <CardText>This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</CardText>
                <Button>Button</Button>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Card title</CardTitle>
                <CardSubtitle>Card subtitle</CardSubtitle>
                <CardText>This card has supporting text below as a natural lead-in to additional content.</CardText>
                <Button>Button</Button>
              </CardBody>
            </Card>
            <Card body inverse style={{ backgroundColor: '#333', borderColor: '#333' }}>
              <CardTitle>Special Title Treatment</CardTitle>
              <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              <Button>Button</Button>
            </Card>
            <Card>
              <CardBody>
                <CardTitle>Card title</CardTitle>
                <CardSubtitle>Card subtitle</CardSubtitle>
                <CardText>This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.</CardText>
                <Button>Button</Button>
              </CardBody>
            </Card>
            <Card body inverse color="primary">
              <CardTitle>Special Title Treatment</CardTitle>
              <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              <Button color="secondary">Button</Button>
            </Card>
          </CardColumns>
        </SuperCard>

        <SuperCard title="Another Super Card" collapsible={true} collapsed={true}>
            <h5>Lorem ipsum</h5>
        </SuperCard>

      </div>
    );
  }
}

export default LayoutTab;