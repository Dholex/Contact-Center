import React, {Component} from 'react'
import {
    MDBCard,
    MDBBox
} from "mdbreact";
import {connect} from "react-redux";
import SurveySubmission from "./SurveySubmission"
import SurveyThumb from "./SurveyThumb"

class LeadSurvey extends Component {

    generateSurveyView = () => {
        if (this.props.lead.surveys && this.props.lead.surveys.length > 0) {
            return this.props.lead.surveys.map( (submission) => {
                    return <SurveySubmission
                        key={submission.id}
                        survey={submission}
                        />
                    })
            
        } 
        return (
            <MDBBox>No Surveys</MDBBox>
        )
        
    }
    render() {
        if (this.props.active === true) {
            if (this.props.lead.surveys.length > 0) {
                return (
                    <MDBBox className="d-flex flex-1 overflow-auto">
                        <MDBBox className="mr-2 d-flex" style={{order: 0, flex: "0 0 30%"}}>
                            <MDBCard border="light" className="p-2 rounded">
                                <strong className="black-text">{this.props.localization.interaction.survey.tabTitle.toUpperCase()}</strong>
                                <MDBBox>
                                    {this.props.lead.surveys.map((submission) => {
                                        return <SurveyThumb
                                            key={submission.id}
                                            submission={submission}
                                        />
                                    })}
                                </MDBBox>
                            </MDBCard>
                        </MDBBox>
                        <MDBBox border="light" className="w-100 rounded d-flex overflow-auto flex-1 order-1">
                            <div className="w-100 smooth-scroll flex-1 order-1 d-flex overflow-auto flex-column">
                                {this.props.lead.surveys.map( (submission) => {
                                    return <SurveySubmission
                                        key={submission.id}
                                        survey={submission}
                                        />
                                    })}
                            </div>
                        </MDBBox>
                    </MDBBox>
                )
            } else {
                return (
                    <MDBCard border="light" className="p5 rounded w-100 d-flex justify-content-center">
                        <h3>No surveys</h3>
                    </MDBCard>
                )
            }
        } else {
            return null
        }
    }
}

const mapStateToProps = store => {
    return {
        localization: store.localization,
        client: store.client,
        lead: store.lead
    }
}

export default connect(mapStateToProps)(LeadSurvey);
