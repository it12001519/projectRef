import React from "react"
import {Card, CardBody, CardHeader, Col, FormGroup, Input, Label} from "reactstrap"
import Required from "js/universal/Required"
import ChangeLinkHelp from 'js/app/models/ChangeLinkHelp'
import {Typeahead} from "react-bootstrap-typeahead";
import FetchUtilities from 'js/universal/FetchUtilities';

class TiContact extends React.Component {

    /*
     * this.props.mode
     *      open = all fields enabled
     *      readonly = all fields disabled
     *      searchonly = search enabled, other fields disabled
     */


    static defaultProps = {
        required: true,
        mode: "open" // open, readonly, searchonly
    }

    /*
        Fetch id is used to track the latest fetch call. when the call comes back, if it doesn't
        match the current number, the results are ignored
     */

    fetchId = 0

    state = {
        search: "",
        users: []
    }

    handleInputChange = (search) => {

        // increment the fetchId.
        this.fetchId++

        // build the url
        let url = '/api/v1/ldap/lookup'

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

                        const label =
                        (null == e.username && null == e.userid)? undefined : e.username + ' / ' + e.userid + ' / ' +
                            e.email + ' / ' + e.phone

                        return {
                            ...e, label: label
                        }
                    })
                    return json
                }
            )
            .then(json => {

                // if the fetchid matches, then update users
                if (this.fetchId === json.fetchId) {
                    this.setState({users: json.items})
                }
            })
            .catch(function (error) {
                FetchUtilities.handleError(error);
            });

    }

    handleSearchSelect = (e) => {
        const user = e[0] || {}
        const {section, onUpdate} = this.props

        onUpdate(section, "userid", user.userid || '')
        onUpdate(section, "username", user.username || '')
        onUpdate(section, "email", user.email || '')
        onUpdate(section, "phone", user.phone || '')
    }

    render() {

        const {contact, section, onUpdate, required} = this.props

        const disabledSearch = this.props.mode === 'readonly';
        const disabledFields = this.props.mode === 'readonly' || this.props.mode === 'searchonly';

        // open, readonly, searchonly    

        return (

            <Card>

                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                    {this.props.title}
                    <ChangeLinkHelp icon={this.props.helpIcon} text={this.props.helpText}/>
                </CardHeader>

                <CardBody>

                    <p>{this.props.footer}</p>

                    <FormGroup row>

                        <Col md={2}>
                            <Label htmlFor="search" className="col-form-label">Search</Label>
                        </Col>

                        <Col md={10}>
                            <Typeahead
                                name="search"
                                value={this.state.search}
                                options={this.state.users}
                                onInputChange={this.handleInputChange}
                                onChange={this.handleSearchSelect}
                                disabled={disabledSearch}
                            />
                        </Col>

                    </FormGroup>

                    <FormGroup row>

                        <Col md={6}>
                            <Label htmlFor="employeeId" className="col-form-label">
                                <Required required={this.props.required}>Employee ID</Required>
                            </Label>
                            <Input
                                bsSize="sm"
                                id="employeeId"
                                name="employeeId"
                                value={contact.userid}
                                onChange={e => onUpdate(section, "userid", e.target.value)}
                                required={required}
                                disabled={disabledFields}
                            />
                        </Col>

                        <Col md={6}>
                            <Label htmlFor="name" className="col-form-label">
                                <Required required={this.props.required}>Name</Required>
                            </Label>
                            <Input
                                bsSize="sm"
                                id="username"
                                name="username"
                                value={contact.username}
                                onChange={e => onUpdate(section, "username", e.target.value)}
                                required={required}
                                disabled={disabledFields}
                            />
                        </Col>

                    </FormGroup>

                    <FormGroup row>

                        <Col md={6}>
                            <Label htmlFor="emailAddress" className="col-form-label">
                                <Required required={this.props.required}>EMail</Required>
                            </Label>
                            <Input
                                bsSize="sm"
                                id="email"
                                name="email"
                                value={contact.email}
                                onChange={e => onUpdate(section, "email", e.target.value)}
                                required={required}
                                disabled={disabledFields}
                            />
                        </Col>

                        <Col md={6}>
                            <Label className="col-form-label">
                                <Required required={this.props.required}>Phone</Required>
                            </Label>
                            <Input
                                bsSize="sm"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={contact.phone}
                                onChange={e => onUpdate(section, "phone", e.target.value)}
                                required={required}
                                disabled={disabledFields}
                            />
                        </Col>

                    </FormGroup>

                </CardBody>

            </Card>
        )

    }

}

export default TiContact
