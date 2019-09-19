import React from 'react';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import withLayout from 'js/app/models/withLayout';

function GitPage() {
    const hasData = process.env.REACT_APP_GIT_INFO;
    const hasEnv = process.env.NODE_ENV;
    const breadcrumb = [
        { text: 'Home', to: "/" },
        { text: 'Admin', active: true },
        { text: 'Git Information', active: true }
    ];
    if(hasEnv==="development") {
        return (
            <div>
                <ChangeLinkBreadcrumb crumbs={breadcrumb} />
                <div>No Git information available in development mode.</div>
            </div>
        )
    }
    if(!Boolean(hasData)) {
        return (
            <div>
                <ChangeLinkBreadcrumb crumbs={breadcrumb} />
                <div>No Git information found. Must be provided in REACT_APP_GIT_INFO environment variable.</div>
            </div>
        )
    }
    return (
        <div>
            <ChangeLinkBreadcrumb crumbs={breadcrumb} />
            <div>{process.env.REACT_APP_GIT_INFO}</div>
        </div>
    )
  }
export default withLayout(GitPage);