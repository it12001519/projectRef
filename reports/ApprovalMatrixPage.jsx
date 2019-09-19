import React, { Component, } from 'react';
import withLayout from 'js/app/models/withLayout';
import { PageHeader } from 'js/app/models/ChangelinkUI';

import ApprovalMatrix from 'js/app/views/change/ApprovalMatrix';

class ApprovalMatrixPage extends Component {

  render() {
    return (
      <div className={this.props.className}>

        <PageHeader>Approval Matrix</PageHeader>

        <ApprovalMatrix filterByChange={false} filterByPCN={false} hasActions={false} />

      </div>
    );
  }
}

export default withLayout(ApprovalMatrixPage)
