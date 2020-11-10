import React, {Component} from 'react'
import {MDBCard, MDBCardBody, MDBChip, MDBTooltip} from "mdbreact";
import {connect} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faStar,
} from "@fortawesome/pro-solid-svg-icons";
import Slack from "../../../utils/Slack";
import String from "../../../utils/String";


class LeadDetail extends Component {

    constructor(props) {
        super(props)

        this.state = {
            leadIDCopyTooltip: props.localization.interaction.details.copyLeadIDTooltip
        }
    }

    copyLeadIDToClipboard = () => {
        const leadID = this.props.lead.id
        let dummyInput = document.createElement("input")
        document.body.appendChild(dummyInput)
        dummyInput.value = leadID
        dummyInput.select()
        document.execCommand("copy")
        document.body.removeChild(dummyInput)
    
        this.setState({leadIDCopyTooltip: this.props.localization.interaction.details.copiedLeadIDTooltip})
    }
    
    clearCopyMessage = () => {
        this.setState({leadIDCopyTooltip: this.props.localization.interaction.details.copyLeadIDTooltip})
    }

    generatePreferredOfficeChip = () => {
        const preferredOfficeMeta = this.props.lead.meta.find(meta => {
            return meta.key === "preferred_office"
        })
        if (preferredOfficeMeta !== undefined) {
            const office = this.props.lead.client.offices.find(office => office.id === parseInt(preferredOfficeMeta.value))
            if (office) {

                return (
                    <MDBTooltip placement="left" domElement tag="span" material>
                            <span>
                                <MDBChip className={"outlineChip ml-4 mb-0"}>{this.props.localization.interaction.details.preferredOfficeLabel}<span className="font-weight-bold skin-secondary-color">{String.truncate(office.name, 25)}</span></MDBChip>
                             </span>
                        <span>{office.name}</span>
                    </MDBTooltip>
                )
            } else {
                Slack.sendMessage(`Lead ${this.props.lead.id} has preferred office that is not in client data`)
            }
        }
        return null
    }

    render() {
        const phase = this.props.shift.phases.find(phase => phase.id === this.props.lead.phase_id)
        let localization = this.props.localization.interaction.details
        let lead = this.props.lead
        let formatPhoneNumber = (str) => {
            //Filter only numbers from the input
            let cleaned = ('' + str).replace(/\D/g, '');

            //Check if the input is of correct length
            let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

            if (match) {
                return '(' + match[1] + ') ' + match[2] + '-' + match[3]
            };

            return null
        };
        return (
            <MDBCard className="w-100 p-2 mb-2 d-flex border rounded skin-border-primary">
                <MDBCardBody className="d-flex w-100 p-2">
                    <div className="d-flex flex-column w-50 justify-content-between">
                        <span className="d-flex justify-content-between">
                            <span className="mr-3">
                                {lead.details.preferred_phone === "cell" && <FontAwesomeIcon icon={faStar} className="skin-primary-color"/>} {localization.cellPhoneLabel} <span className="font-weight-bold skin-secondary-color">{formatPhoneNumber(lead.details.cell_phone)}</span>
                            </span>
                            {lead.details.home_phone &&
                            <span>
                                {lead.details.preferred_phone === "home" && <FontAwesomeIcon icon={faStar} className="skin-primary-color"/>} {localization.homePhoneLabel} <span className="font-weight-bold skin-secondary-color">{formatPhoneNumber(lead.details.home_phone)}</span>
                            </span>}
                        </span>
                        <span>
                            {lead.details.address_1 && <span>{localization.addressLabel}<span className="font-weight-bold skin-secondary-color">{lead.details.address_1}</span></span>}
                            {lead.details.address_2 && <span> , {lead.details.address_2}</span>}
                        </span>
                        <span className="d-flex justify-content-between">{lead.details.city && <span>{localization.cityLabel} <span className="font-weight-bold skin-secondary-color">{lead.details.city}</span></span>} {lead.details.state && <span>{localization.stateLabel} <span className="font-weight-bold skin-secondary-color">{lead.details.state}</span></span>} {lead.details.zip && <span>{localization.zipLabel} <span className="font-weight-bold skin-secondary-color">{lead.details.zip}</span></span>}</span>
                        <span className="d-flex justify-content-between">
                            <span>{localization.emailLabel}<span className="font-weight-bold skin-secondary-color">{lead.details.email}</span></span>
                            {lead.details.date_of_birth && <span>{localization.DOBLabel}<span className="font-weight-bold skin-secondary-color">{lead.details.date_of_birth}</span></span>}
                        </span>

                    </div>
                    <div className="d-flex flex-column align-items-start w-25">
                        <MDBTooltip placement="right" domElement tag="span" material sm>
                            <span>
                                <MDBChip className="outlineChip ml-4 mb-0" onClick={this.copyLeadIDToClipboard} onMouseOut={this.clearCopyMessage}>{localization.leadIDLabel}<span className="font-weight-bold skin-secondary-color">{lead.id}</span></MDBChip>
                            </span>
                            <span>{this.state.leadIDCopyTooltip}</span>
                        </MDBTooltip>
                        <MDBChip className={"outlineChip ml-4 mb-0"}>{localization.regionLabel}<span className="font-weight-bold skin-secondary-color">{lead.region.name}</span></MDBChip>
                        <MDBChip className={"outlineChip ml-4 mb-0"}>{localization.regionPhoneLabel}<span className="font-weight-bold skin-secondary-color">{formatPhoneNumber(lead.region.default_number)}</span></MDBChip>
                        <MDBChip className={"outlineChip ml-4 mb-0"}>{localization.phaseLabel}<span className="font-weight-bold skin-secondary-color">{phase.label}</span></MDBChip>
                    </div>
                    <div className="d-flex flex-column justify-content-between align-items-end w-25 h-100">
                        {this.generatePreferredOfficeChip()}
                    </div>
                </MDBCardBody>
            </MDBCard>
        )
    }
}

const mapStateToProps = state => {
    return {
        localization: state.localization,
        lead: state.lead,
        shift: state.shift
    }
}

export default connect(mapStateToProps)(LeadDetail);