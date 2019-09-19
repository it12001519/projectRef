import React, { Component } from 'react';

class TypeSearch extends Component {

    static defaultProps = {
        data: {}
    }

    constructor(props) {
        super(props);
        this.state = {
            types: [],
            data: props.data,
        };
    }

    componentDidMount() {
        const url = "/api/v1/diary/types"

        let initialTypes = [];

        fetch(url, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({types: json}))
            .catch((error) => {
                FetchUtilities.handleError(error);
            })
    }

    render() {
        const options = this.state.types.map(e => <option key={e}>{e}</option>)
        return <div>{options}</div>
    }

}

export default TypeSearch;

