import React, { Component, } from 'react';
import styled from 'styled-components';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';

import SuperCard from "js/universal/SuperCard";
import PhaseActions from "js/app/views/change/PhaseActions";

// Mock data - using static json file in /public/json
const URL = "/json/change/phase-full.json";

// API data
//const URL = "";

class ActionsTab extends Component {

    constructor(props) {
        super(props);

        // Set the default state
        this.state = {
            data: []
        }
    }

    componentWillMount() {
        // Fetch the latest set of data
        fetch(URL, {
            credentials: 'include', headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
            if (response.status !== 200) {
                throw response;
            }
            return response.json();
        })
        .then((json) => {
            this.setState({ data: json });
        })
        .catch((ex) => {
            console.error(ex);
            throw ex;
        });
    }

    render() {
        return (
            <div className={this.props.className}>
                {
                    this.state.data.map((phase) => {
                        return (
                            <SuperCard
                                title={'Phase ' + phase.number + ': ' + phase.name}
                                helptext={phase.helptext}
                                collapsible={true}
                                collapsed={true}>
                                <PhaseActions data={phase.data} />
                            </SuperCard>
                        );
                    })
                }
            </div>
        )
    }
}

export default styled(ActionsTab) `
`;