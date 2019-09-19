import React, { Component, } from 'react'
import withLayout from 'js/app/models/withLayout'
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb'
import ImplementationMatrixTab from 'js/app/views/change/tabs/implmatrix'

class ReportImplMatrixPage extends Component {
    render() {
        return(
            <div>
                 <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Implementation Matrix', active: true }
                ]} />
                <ImplementationMatrixTab reportMode="Y" source="PCN"/>
            </div>
        )
    }
}

export default withLayout(ReportImplMatrixPage);