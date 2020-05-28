import moment from "moment-timezone";

class TimelineData {

    constructor(lead) {

        this.touchpoints = {
            timezone: lead.details.timezone,
            appointments: {total:0, date:"", time: ""},
            texts: {total: 0, incoming : 0, outgoing: 0},
            interactions: 0,
            emails : {total : 0, delivered: 0, opened : 0},
            notes : 0,
            calls : {total : 0, incoming:0, outgoing : 0},
            surveys: {total:0, date:"", time : ""}
        }
        this.timeline = [ ...lead.interactions]
        this.timeline.forEach(interaction =>  {
            interaction["events"] = []
            interaction["type"] = "interaction"
            interaction.created_at = moment.utc(interaction.created_at).tz(lead.details.timezone)
        })

        this.generateTimeline(lead)
    }
    processItems(type, items, timezone) {
        items.forEach(item => {
            item["type"] = type
            item.created_at = moment.utc(item.created_at).tz(timezone)
            if (item.interaction_id) {
                let interaction = this.timeline.find(i => i.id === item.interaction_id && i.type === "interaction")
                if (interaction)
                    interaction.events.push(item)
                else
                    this.timeline.push(item)
            }
            else {
                this.timeline.push(item)
            }
        })
    }

    calculateTouchpoints(events) {
        events.forEach(event => {
            switch (event.type) {
                case "interaction":
                    this.touchpoints.interactions++
                    this.calculateTouchpoints(event.events)
                    break
                case "appointment":
                    this.touchpoints.appointments.total++
                    this.touchpoints.appointments.date = event.created_at.format("MMM Do")
                    this.touchpoints.appointments.time = event.created_at.format("hh:mm a z")
                    break
                case "note":
                    this.touchpoints.notes++
                    break
                case "call":
                    this.touchpoints.calls.total++
                    event.direction === "outgoing" ? this.touchpoints.calls.outgoing++ : this.touchpoints.calls.incoming++
                    break
                case "email":
                    this.touchpoints.emails.total++
                    if (event.events && event.events.length > 0){
                        event.events.forEach(e => {
                            if (e.event === "Delivery")
                                this.touchpoints.emails.delivered++
                            else if (e.event === "Open")
                                this.touchpoints.emails.opened++
                        })
                    }

                    break
                case "survey":
                    this.touchpoints.surveys.total++
                    this.touchpoints.surveys.date = event.created_at.format("MMM Do")
                    this.touchpoints.surveys.time = event.created_at.format("hh:mm a z")
                    break
                case "text":
                    this.touchpoints.texts.total++
                    event.direction === "outgoing" ? this.touchpoints.texts.outgoing++ : this.touchpoints.texts.incoming++
                    break
                default: break
            }
        })
    }

    generateTimeline(lead) {
        const timezone = lead.details.timezone
        this.processItems("appointment", lead.appointments, timezone)
        this.processItems("email", lead.emails, timezone)
        this.processItems("note", lead.notes, timezone)
        this.processItems("survey", lead.surveys, timezone)
        this.processItems("text", lead.texts, timezone)
        //Add Additional Sections here

        //Sort Main Level by date.
        this.timeline.sort((a,b) => b.created_at -a.created_at)
        this.timeline.forEach(item => {
            if (item.type === "interaction") {
                item.events.sort((a,b) => b.created_at - a.created_at)
            }
        })
        this.calculateTouchpoints(this.timeline)
    }

    getTouchpoints() {
        return this.touchpoints
    }
    getTimeline() {
        return this.timeline
    }

}
export default TimelineData;