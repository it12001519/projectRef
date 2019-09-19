import React from 'react';
import {
    Typeahead
} from "react-bootstrap-typeahead";
import FetchUtilities from "js/universal/FetchUtilities";

class LDAPSearchInput extends React.Component {
    state = {
        search: "",
        users: [],
        selected: [this.props.selected] || null,
        noselection: []
    }

    fetchId = 0;
    handleInputChange = (search) => {
        this.fetchId++
        let url = '/api/v1/ldap/lookup'

        const json = {
            search: search,
            fetchId: this.fetchId
        }

        return fetch(url, {
                method: 'POST',
                body: JSON.stringify(json),
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                })
            })
            .then(response => response.json())
            .then(json => {
                json.items = json.items.map(e => {
                    const label =
                        e.username + ' (' + e.userid + ')'

                    return {
                        ...e,
                        label: label
                    }
                })
                return json
            }).then(json => {
                if (this.fetchId === json.fetchId) {
                    this.setState({
                        users: json.items
                    })
                }
            }).catch(function (error) {
                FetchUtilities.handleError(error);
            });
    }

    /*
    handleSearchSelect = (e) => {
        var user = e[0] || {}
        this.props.onSelectLdap(user);
    }*/

    render() {
        return <Typeahead
        name = {this.props.name}
        placeholder = {this.props.placeholder}
        selected = {this.state.selected === null || this.state.selected === undefined? '' : this.state.selected[0] === null || this.state.selected[0] === undefined ? '' : this.state.selected}
        options = {this.state.users}
        onInputChange = {this.handleInputChange}
        //onChange = {this.handleSearchSelect}
        required = {this.props.required}
        onChange={(selected) => {
            this.setState({
                selected: selected,
            })
            const user = selected[0] || {}
            this.props.onSelectLdap(user);
            }}
        />
    }
}

export default LDAPSearchInput;