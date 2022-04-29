import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "info@mnyinfotech.com",
        subject: "Task manager",
        text: 'welcome to the app,'
    })
}

export const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "info@mnyinfotech.com",
        subject: "Task manager",
        text: 'Kya ho gaya yaar ....!!!'
    })
}