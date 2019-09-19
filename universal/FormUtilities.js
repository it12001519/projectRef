import classnames from 'classnames';

/**
 * Helper class that validates React form or field event.
 */
class FormValidator {

    static validate(e) {
        const form = e.target;
        const formLength = form.length;
        if (formLength !== undefined) {
            return this.validateForm(e)
        } else {
            return this.validateSingle(e)
        }
    }

    static validateForm(e) {
        const form = e.target;
        const formLength = form.length;

        let retValue = true;
        for (let i = 0; i < formLength; i++) {
            retValue &= this.validateSingleNode(form[i])
        }
        return retValue;
    }

    static validateSingle(e) {
        const node = e.target;
        return this.validateSingleNode(node)
    }

    static validateSingleNode(node) {
        if (node.nodeName.toLowerCase() === 'button') {
            return true;
        } else if (node.nodeName.toLowerCase() === 'option') {
            return true;
        } else if (node.checkValidity()) {
            node.className = classnames('form-control', {'is-valid': true});
            return true;
        } else {
            node.className = classnames('form-control', {'is-invalid': true});
            return false;
        }
    }

}

export {FormValidator};