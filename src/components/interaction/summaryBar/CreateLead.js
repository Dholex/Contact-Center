import React, {Component} from 'react'
import {MDBBtn, MDBBox, MDBInput, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader} from 'mdbreact'
import {connect} from "react-redux";
import {toast} from "react-toastify";
import Slack from "../../../utils/Slack";
import LeadAPI from "../../../api/leadAPI";
class CreateLead extends Component {

    constructor(props) {
        super(props);
        this.state = {
            saveFields: {
                first_name: "",
                last_name: "",
                email: "",
                cell_phone: "",
                home_phone: "",
                address_1: "",
                address_2: "",
                city: "",
                state: "",
                zip: ""
            },
            saveButtonDisabled: true
        };
    }

    saveNewLead = () => {
        // disable save button
        this.setState({saveButtonDisable: true})

        // Build payload using current lead's values for a few fields
        let saveFields = {...this.state.saveFields,
            client_id: this.props.lead.client_id,
            vertical_id: this.props.lead.vertical_id,
            region_id: this.props.lead.region_id,
            campaign_id: this.props.lead.campaign_id
        }

        // strip phone values
        if (saveFields.cell_phone !== "") {
            saveFields.cell_phone = saveFields.cell_phone.replace(/\D/g, '')
        }
        if (saveFields.home_phone !== "") {
            saveFields.home_phone = saveFields.home_phone.replace(/\D/g, '')
        }

        // send to API
        LeadAPI.createLead(saveFields).then( response => {
            toast.success("New lead created and assigned to you.")
            this.props.closeModal()
        }).catch( error => {
            toast.error("Lead could not be created.")
            Slack.sendMessage(`Agent ${this.props.user.id} attempted to save lead but got error: ${error.toString()}`)
            this.props.closeModal()
        })
    }

    handleFormInput = (field) => (evt) => {
        // get new field value
        const newValue = evt.target.value
        let formattedValue = ""
        // add formatting to phone fields
        if (field === "cell_phone" || field === "home_phone") {
            if (newValue !== undefined) {
                const matches = newValue.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
                formattedValue = !matches[2] ? matches[1] : '(' + matches[1] + ') ' + matches[2] + (matches[3] ? '-' + matches[3] : '')
            }
        } else {
            formattedValue = newValue
        }

        // clone state saveFields and overwrite new one
        let newFields = {...this.state.saveFields}
        newFields[field] = formattedValue

        // determine if we can save it
        let saveButtonDisabled = false
        if (newFields.first_name === "" || newFields.last_name === "" || newFields.email === "" || newFields.cell_phone.length < 14) {
            saveButtonDisabled = true
        }

        this.setState({ saveFields: newFields, saveButtonDisabled })
    }

    render() {
        return (
            <MDBModal isOpen={true} toggle={this.props.closeModal} size="lg">
                <MDBModalHeader>{this.props.localized.title}</MDBModalHeader>
                <MDBModalBody className="d-flex flex-wrap justify-content-start w-100">
                    {this.props.localized.infoHeader}
                    <div className="break mb-1 mt-2"/>
                    <MDBInput type="text"
                              label={this.props.localized.firstName}
                              value={this.state.saveFields.first_name}
                              onChange={this.handleFormInput("first_name")}
                              containerClass="m-0 mr-2 w-25"
                    />
                    <MDBInput type="text"
                              label={this.props.localized.lastName}
                              value={this.state.saveFields.last_name}
                              onChange={this.handleFormInput("last_name")}
                              containerClass="m-0 w-25"
                    />
                    <MDBInput type="text"
                              label={this.props.localized.email}
                              value={this.state.saveFields.email}
                              onChange={this.handleFormInput("email")}
                              containerClass="m-0 w-75"
                    />
                    <div className="w-100 mb-2"/>
                    <MDBInput type="text"
                              label={this.props.localized.cellPhone}
                              value={this.state.saveFields.cell_phone}
                              onChange={this.handleFormInput("cell_phone")}
                              containerClass="m-0 mr-2 w-25"
                    />
                    <MDBInput type="text"
                              label={this.props.localized.homePhone}
                              value={this.state.saveFields.home_phone}
                              onChange={this.handleFormInput("home_phone")}
                              containerClass="m-0 mr-2 w-25"
                    />
                    <div className="w-100 mb-2"/>
                    <MDBInput type="text"
                              label={this.props.localized.address1}
                              value={this.state.saveFields.address_1}
                              onChange={this.handleFormInput("address_1")}
                              containerClass="m-0 mr-2 w-25"
                    />
                    <MDBInput type="text"
                              label={this.props.localized.address2}
                              value={this.state.saveFields.address_2}
                              onChange={this.handleFormInput("address_2")}
                              containerClass="m-0 w-25"
                    />
                    <div className="w-100"/>

                    <MDBInput type="text"
                              label={this.props.localized.city}
                              value={this.state.saveFields.city}
                              onChange={this.handleFormInput("city")}
                              containerClass="m-0 mr-2 w-25"
                    />
                    <MDBInput type="text"
                              label={this.props.localized.state}
                              value={this.state.saveFields.state}
                              onChange={this.handleFormInput("state")}
                              containerClass="m-0 mr-2 w-25"
                    />
                    <MDBInput type="text"
                              label={this.props.localized.zip}
                              value={this.state.saveFields.zip}
                              onChange={this.handleFormInput("zip")}
                              containerClass="m-0 w-25"
                    />
                    <MDBModalFooter className="p-1"/>
                    <MDBBox className="d-flex justify-content-between w-100">
                        <MDBBtn color="secondary" rounded outline onClick={this.props.closeModal}>{this.props.localized.cancelButton}</MDBBtn>
                        <MDBBtn color="primary" disabled={this.state.saveButtonDisabled} rounded onClick={this.saveNewLead}>{this.props.localized.okButton}</MDBBtn>
                    </MDBBox>
                </MDBModalBody>
            </MDBModal>
        )
    }
}
const mapStateToProps = state => {
    return {
        localization: state.localization,
        localized: state.localization.interaction.summary.createLead,
        lead : state.lead,
        user: state.user,
    }
}

export default connect(mapStateToProps)(CreateLead);
