import React from 'react';
import { fetchGet, fetchPost } from 'js/universal/FetchUtilities'
import Validator from 'validatorjs'

import { Button } from 'reactstrap'
import FormWidget from 'js/universal/FormFieldWidgets'
import Spinner, { showOverlaySpinner, hideOverlaySpinner, } from 'js/universal/spinner'
import { successModal, warningModal} from 'js/universal/Modals'

const URL_SUBMIT_QUAL = '/api/v1/qual/submitQualInfo/';
const URL_FORM_QUAL = '/api/v1/forms/slug/qual/'
const URL_QUAL_STATUS = '/api/v1/qual/getQualStatus/'

/*
    This class somehow implements the dynamic form.
 */
class QualForm extends React.Component {
    state = {
        qualId: (this.props.data && this.props.data['qualId']) || '',
        // data attributes
        form: { qual: {} },
        data: { qual: {} },
        validation: { qual: {} },
        // utility attributes
        editMode: true,
        showSpinner: true
    }

    isValid = () => {
        let qualValidator = new Validator(this.state.data, this.state.validation, FormWidget.defaultValidationMessages)
        return qualValidator.passes()
    }

    toggleSpinner = () => {
        this.setState({
            showSpinner: !this.state.showSpinner
        })
    }

    fetchFields = (url, attr) => {
        fetchGet(url,
            (httpStatus, response) => {
                let form = { ...this.state.form }, rules = { ...this.state.validation }, newrules = {},
                    formMembers = new Array()
                response.forEach(({ name, validation }, i) => {
                    if (!!validation && validation !== null)
                        newrules[name] = eval(validation)
                    if (name == "QUAL_ID" && (this.props.data && this.props.data.qualId)) {
                        let formMember = response[i]
                        formMember['widget'] = 'READONLY_TEXT'
                    }
                    formMembers.push(response[i]);
                })

                rules[attr] = newrules
                form[attr] = formMembers
                this.setState({ form })
                this.setState({ validation: rules });

                /*Setup the data*/
                let data = {};
                let qual = {};
                qual['QUAL_ID'] = (this.props.data && this.props.data.qualId) || '';
                qual['QUAL_STATUS'] = (this.props.data && this.props.data.qualStatus) || '';
                qual['GATING'] = (this.props.data && this.props.data.gating) || '';
                qual['CONDITIONAL_ACCEPTED'] = (this.props.data && this.props.data.conditionalAccepted) || '';
                data['qual'] = qual;
                this.setState({ data });
                this.toggleSpinner();
            })
    }

    onChange_QualData = (name, value) => {
        let formValue = '';
        if (Array.isArray(value)) {
            formValue = value.filter((v, i, a) => a.indexOf(v) === i).value;
        }
        else if (typeof value == "string") {
            formValue = value;
        } else {
            formValue = value.value;
        }
        this.setState((previousState) => {
            previousState.data.qual = { ...previousState.data.qual, [name]: formValue }
            return previousState;
        });

        if (name == "QUAL_ID") {
            if (value != '') {
                showOverlaySpinner();
                fetchGet(URL_QUAL_STATUS + value.value,
                    (httpStatus, response) => {
                        this.setState((previousState) => {
                            previousState.data.qual = { ...previousState.data.qual, [name]: formValue, ['QUAL_STATUS']: response.status }
                            return previousState;
                        });
                        hideOverlaySpinner();
                    })
            } else {
                this.setState((previousState) => {
                    previousState.data.qual = { ...previousState.data.qual, [name]: formValue, ['QUAL_STATUS']: ''}
                    return previousState;
                })
            }

        }
    }

    submit = () => {
        if (this.isValid()) {
            let qualData = this.state.data.qual;
            let postData = {};
            postData['qualId'] = qualData.QUAL_ID;
            postData['gating'] = qualData.GATING;
            postData['conditionalAccepted'] = qualData.CONDITIONAL_ACCEPTED;
            postData['implementationClassId'] = this.props.data.implementationClassId;
            postData['changeNo'] = (this.props.data && this.props.data.changeNo) || (this.props.changeNo);

            this.toggleSpinner();
            fetchPost(URL_SUBMIT_QUAL,
                JSON.stringify(postData),
                (httpStatus, response) => {
                    if (httpStatus >= 200 && httpStatus < 300) {
                        successModal(`Updated Qual Information for ${(this.props.data && this.props.data.changeNo) || (this.props.changeNo)}`)
                        this.props.toggle(null);
                        this.props.refresh();
                    } else {
                        warningModal(response.message)
                    }
                }, _ => this.toggleSpinner()
            )
        } else {
            warningModal('Please review the form. Invalid field values found.')
        }
    }



    componentDidMount() {
        this.fetchFields(`${URL_FORM_QUAL}`, 'qual');
    }

    render() {
        return (<div>
            {
                !!this.state.form.qual.length
                    ? <FormWidget fields={this.state.form.qual} rules={this.state.editMode ? this.state.validation.qual : undefined} values={this.state.data.qual}
                        onChange={this.onChange_QualData} readonly={!this.state.editMode} />
                    : ''
            }
            <Spinner showSpinner={this.state.showSpinner} overlay={false} />
            <div style={{ float: 'right' }}>
                {!!this.state.form.qual.length
                    ? <Button onClick={() => this.submit()} color="primary" outline className="mr-1"> Save </Button> : ''}
                <Button onClick={() => this.props.toggle(null)} color="secondary" outline className="mr-1"> Cancel </Button>
            </div>
        </div>)
    }
}
export default QualForm