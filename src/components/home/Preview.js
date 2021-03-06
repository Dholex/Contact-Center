import React, {Component} from 'react'
import {MDBCard, MDBCardBody, MDBCardHeader, MDBBtn, MDBBox, MDBCardFooter} from "mdbreact";
import { connect } from 'react-redux'
import LoadingScreen from '../LoadingScreen'
import LeadAPI from '../../api/leadAPI'
import * as moment from 'moment'
import Lead from "../../utils/Lead";
import {toast} from "react-toastify";

class Preview extends Component {

    constructor(props) {
        super(props)

        this.startInteraction = this.startInteraction.bind(this)

        this.state = {
            startedInteraction: false,
            previewStartTime: moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }

        //console.log(props.previewData)
        let leadID = 0

        // if this is a queued lead, we will already have preview data
        // TODO Refactor this so that it isn't confusingly using props.previewData.lead_id vs. props.previewData.leadID

        if (props.previewData.lead_id !== undefined) {
            this.state.leadData = props.previewData
            leadID = props.previewData.lead_id
        } else {
            // otherwise we should have lead ID in the store, fetch preview
            // response from the API and set it into state when we get it
            const previewPayload = {
                leadID: props.previewData.leadID,
                callQueueID: props.previewData.callQueueID
            }
            leadID = props.previewData.leadID
            LeadAPI.getLeadPreview(previewPayload)
                .then((response) => {
                    this.props.dispatch({type: "PREVIEW.LOADED", payload: response.data})
                }).catch( error => {
                    console.log("Could not load preview: ", error)
                })
        }

        // no need to wait for interaction to start, we can start loading
        // lead data right here and put it into store ahead of time
        Lead.loadLead(leadID).then( result => { console.log("Lead loaded")});
    }

    startInteraction() {
        // prevent doubletap
        if (this.state.startedInteraction) {
            return
        }
        this.setState({startedInteraction: true})

        // determine parameters
        let callReason = ""
        if (this.props.previewData.call_sid !== null) {
            callReason = "incoming"
        } else if (this.props.previewData.callQueueID === "search") {
            callReason = "search"
        }
        const payload = {
            callQueueID: this.props.previewData.queue_id === undefined ? null : this.props.previewData.queue_id,
            leadID: this.props.previewData.lead_id,
            previewStartTime: this.state.previewStartTime,
            callReason: callReason
        }
        // Make API call to start interaction
        LeadAPI.startInteraction(payload)
            .then( response => {
                if (response.success) {
                    // set received interaction ID into store
                    this.props.dispatch({
                        type: "INTERACTION.LOAD",
                        payload: {
                            id: response.data.id,
                            outcome_id: 27,
                            outcome_reason_id: null,
                            reason_id: null,
                            created_at: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
                            created_by: this.props.user.label_name
                        }
                    })
                }
                // Redirect to interaction view
                this.props.history.push("/interaction")
            }).catch( error => {
                console.log("Could not start interaction: ", error)

                // Pop error and redirect to interaction view
                toast.error(this.props.localization.toast.interaction.preview.interactionStartError)
                this.props.history.push("/")
        })
    }

    render() {
        let localization = this.props.localization.preview
        // Display loading image until lead preview data is loaded
        if (this.props.previewData.lead_id === undefined) {
            return <LoadingScreen />
        }

        // Build filtered list of preview data items
        const data = this.props.previewData.meta.filter(item => {
            const filteredFieldList = [
                "Last Contact",
                "Phase",
                "Client",
                "Region",
                "Campaign"
            ]
            return filteredFieldList.includes(item.name)
        }).map((item, i) => {
            return (
                <MDBBox key={i} className="pt-2 border-top mt-2">{item.name}: <span className="font-weight-bold skin-secondary-color">{item.value}</span></MDBBox>
            )
        })

        return (
            <MDBBox className="d-flex justify-content-center" style={{margin: "10% auto"}} >
                <MDBCard className="d-flex card-body" style={{width:"585px", height:"480px"}}>
                    <MDBCardHeader className="d-flex justify-content-start backgroundColorInherit">
                        <h3>
                            <strong>{this.props.previewData.lead_name}</strong> <small className="font-italic">/ {this.props.previewData.reason}</small>
                        </h3>
                    </MDBCardHeader>
                    <MDBCardBody className='justify-content-start border skin-border-primary'>
                        <div>
                            <MDBBox className="pt-2 mt-2">{localization.id}: <span className="font-weight-bold skin-secondary-color">{this.props.previewData.lead_id}</span></MDBBox>
                        </div>
                        <div>
                            {data}
                        </div>
                    </MDBCardBody>
                    <MDBCardFooter className="d-flex justify-content-end">
                        <MDBBtn rounded className="skin-primary-background-color f-l" onClick={this.startInteraction}>{localization.nextButton}</MDBBtn>
                    </MDBCardFooter>
                </MDBCard>
            </MDBBox>
        )
    }
}

const mapStateToProps = store => {
    return {
        localization : store.localization,
        previewData: store.preview,
        shift: store.shift,
        user: store.user
    }
}

export default connect(mapStateToProps)(Preview);
