import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import FetchUtilities from 'js/universal/FetchUtilities';

class SearchPCN extends React.Component {
    state = {
        search: "",
        pcns: [],
        selected: [this.props.selected] || null,
        url: this.props.url || '/api/v1/lookup/pcn',
        allowNew: this.props.allowNew || false
    }

    fetchId = 0

    handleInputChange = (search) => {
        this.fetchId++
        let url = this.state.url

        const json = {
            search: search,
            fetchId: this.fetchId
        }

        return fetch(url, {
            method: 'post',
            body: JSON.stringify(json),
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then(json => {

                json.items = json.items.map(e => {
                    const label = e.pcn_number
                    return {
                        ...e, label:label
                    }
                })
                return json
            }
        ).then(json => {
            if(this.fetchId === json.fetchId) {
                this.setState({ pcns: json.items})
            }
        }).catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }

    render() {
        return <Typeahead
                    name="search"
                    placeholder={'Enter PCN number'}
                    allowNew={this.state.allowNew}
                    options={this.state.pcns}
                    onInputChange={this.handleInputChange}
                    selected={this.state.selected[0] === null ? '' : this.state.selected}
                    onChange={(selected) => {
                        this.setState({
                            selected: selected,
                        })
                        const pcn = selected[0] || {}
                        this.props.onUpdate(pcn)
                        }}
                />
    }
}

class SearchSamples extends React.Component {
    state = {
        search: "",
        samples: [],
        selected: [this.props.selected] || null
    }

    fetchId = 0

    handleInputChange = (search) => {
        this.fetchId++
        let url = '/api/v1/lookup/samples'

        const json = {
            search: search,
            fetchId: this.fetchId
        }

        return fetch(url, {
            method: 'post',
            body: JSON.stringify(json),
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then(json => {

                json.items = json.items.map(e => {
                    const label = e.sample_number
                    return {
                        ...e, label:label
                    }
                })
                return json
            }
        ).then(json => {
            if(this.fetchId === json.fetchId) {
                this.setState({ samples: json.items})
            }
        }).catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }

    render() {
        return<Typeahead
        name="search"
        placeholder={'Enter Sample number'}
        options={this.state.samples}
        onInputChange={this.handleInputChange}
        selected={this.state.selected[0] === null ? '' : this.state.selected}
        onChange={(selected) => {
            this.setState({
                selected: selected,
            })
            const sample = selected[0] || {}
            this.props.onUpdate(sample)
            }}
        />
    }
}

class SearchCMS extends React.Component {
    state = {
        search: "",
        cms: [],
        selected: [this.props.selected] || null
    }

    fetchId = 0

    handleInputChange = (search) => {
        this.fetchId++
        let url = '/api/v1/lookup/cms'

        const json = {
            search: search,
            fetchId: this.fetchId
        }

        return fetch(url, {
            method: 'post',
            body: JSON.stringify(json),
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then(json => {

                json.items = json.items.map(e => {
                    const label = e.cms_number
                    return {
                        ...e, label:label
                    }
                })
                return json
            }
        ).then(json => {
            if(this.fetchId === json.fetchId) {
                this.setState({ cms: json.items})
            }
        }).catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }

    render() {
        return<Typeahead
        name="search"
        placeholder={'Enter CMS number'}
        options={this.state.cms}
        onInputChange={this.handleInputChange}
        selected={this.state.selected[0] === null ? '' : this.state.selected}
        onChange={(selected) => {
            this.setState({
                selected: selected,
            })
            const cms = selected[0] || {}
            this.props.onUpdate(cms)
            }}
        />
    }
}

class SearchCustomerNumber extends React.Component {
    state = {
        search: "",
        customerNumber: [],
        selected: [this.props.selected] || null
    }

    fetchId = 0

    handleInputChange = (search) => {
        this.fetchId++
        let url = '/api/v1/lookup/customerNumber'

        const json = {
            search: search,
            fetchId: this.fetchId
        }

        return fetch(url, {
            method: 'post',
            body: JSON.stringify(json),
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then(json => {

                json.items = json.items.map(e => {
                    const label = e.customer_number
                    return {
                        ...e, label:label
                    }
                })
                return json
            }
        ).then(json => {
            if(this.fetchId === json.fetchId) {
                this.setState({ customerNumber: json.items})
            }
        }).catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }

    render() {
        return<Typeahead
        name="search"
        placeholder={'Enter customer number or name'}
        options={this.state.customerNumber}
        onInputChange={this.handleInputChange}
        selected={this.state.selected[0] === null ? '' : this.state.selected}
        onChange={(selected) => {
            this.setState({
                selected: selected,
            })
            const customerNumber = selected[0] || {}
            this.props.onUpdate(customerNumber)
            }}
        />
    }
}

class SearchOrderableMaterial extends React.Component {
    state = {
        search: "",
        orderableMaterial: [],
        selected: [this.props.selected] || null
    }

    fetchId = 0

    handleInputChange = (search) => {
        this.fetchId++
        let url = '/api/v1/lookup/orderableMaterial'

        const json = {
            search: search,
            fetchId: this.fetchId
        }

        return fetch(url, {
            method: 'post',
            body: JSON.stringify(json),
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then(json => {

                json.items = json.items.map(e => {
                    const label = e.orderable_material
                    return {
                        ...e, label:label
                    }
                })
                return json
            }
        ).then(json => {
            if(this.fetchId === json.fetchId) {
                this.setState({ orderableMaterial: json.items})
            }
        }).catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }

    render() {
        return<Typeahead
        name="search"
        placeholder={'Enter orderable material'}
        options={this.state.orderableMaterial}
        onInputChange={this.handleInputChange}
        selected={this.state.selected[0] === null ? '' : this.state.selected}
        onChange={(selected) => {
            this.setState({
                selected: selected,
            })
            const orderableMaterial = selected[0] || {}
            this.props.onUpdate(orderableMaterial)
            }}
        />
    }
}

class SearchNiche extends React.Component {
    state = {
        search: "",
        niches: [],
        selected: [this.props.selected] || null
    }

    fetchId = 0

    handleInputChange = (search) => {
        this.fetchId++
        let url = '/api/v1/lookup/niche'

        const json = {
            search: search,
            fetchId: this.fetchId
        }

        return fetch(url, {
            method: 'post',
            body: JSON.stringify(json),
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then(json => {

                json.items = json.items.map(e => {
                    const label = e.niche
                    return {
                        ...e, label:label
                    }
                })
                return json
            }
        ).then(json => {
            if(this.fetchId === json.fetchId) {
                this.setState({ niches: json.items})
            }
        }).catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }

    render() {
        return<Typeahead
        name="search"
        placeholder={'Enter niche'}
        options={this.state.niches}
        onInputChange={this.handleInputChange}
        selected={this.state.selected[0] === null ? '' : this.state.selected}
        onChange={(selected) => {
            this.setState({
                selected: selected,
            })
            const niche = selected[0] || {}
            this.props.onUpdate(niche)
            }}
        />
    }
}

class SearchSWR extends React.Component {
    state = {
        search: "",
        swr: [],
        selected: this.props.selected || null
    }

    fetchId = 0

    handleInputChange = (search) => {
        this.fetchId++
        let url = '/api/v1/lookup/swr'

        const json = {
            search: search,
            fetchId: this.fetchId
        }

        if (typeof this.props.onChange === 'function') {
            this.props.onChange(search)
        }
        
        return fetch(url, {
            method: 'post',
            body: JSON.stringify(json),
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then(json => {
            json.items = json.items.map(e => {
                const label = e.swr_number
                return {
                    ...e, label:label
                }
            })
            return json
        })
        .then(json => {
            if(this.fetchId === json.fetchId) {
                this.setState({ swr: json.items})
            }
        })
        .catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }

    handleSearchSelect = (e) => {
        const swr = e[0] || {}
        this.props.onUpdate(swr)
    }

    render() {
        return <Typeahead
            name="search"
            className={this.props.className}
            placeholder={'Enter SWR number'}
            options={this.state.swr}
            onInputChange={this.handleInputChange}
            onChange={this.handleSearchSelect}
        />
    }
}

export {SearchPCN, SearchSamples, SearchCMS, SearchSWR, SearchCustomerNumber, SearchOrderableMaterial, SearchNiche};
