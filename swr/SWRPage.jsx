import React from 'react'
import FetchUtilities from 'js/universal/FetchUtilities'
import withLayout from 'js/app/models/withLayout'
import SWRForm from 'js/app/views/swr/SWRForm'
import { errorModal } from 'js/universal/Modals'

class SWRPage extends React.Component {

    onSubmit = (queryData) => {
        const URL = "/api/v1/swr/upsert/";
        fetch(URL,
            {
                method: 'POST',
                body: JSON.stringify(queryData),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }),
                credentials: 'include',
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                this.props.history.push({ pathname: '/swr/' });
            })
            .catch((error) => {
                errorModal(error.message);
            });
    }

    onCancel = () => {
        this.props.history.push({ pathname: '/swr/' });
    }

    render() {
        const { ...other } = this.props
        return <SWRForm {...other} onSubmit={this.onSubmit} onClose={this.onCancel} />
    }
}

export default withLayout(SWRPage);