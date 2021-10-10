const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text')

// new Email(user, url).sendWelcome();

// Jane Stack
// ['jane', 'stack']



module.exports = class Email {
    constructor(user, data) {
        this.to = user.email;
        this.user =  user
        this.data = data
        this.from = `Jane <${process.env.EMAIL_FROM}>`;
        //this.firstName = user.name.split(' ')[0];

    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return 1;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    //Send the actual email
    async send(template, subject) {
       // 1) Render HTML based on pug template

        const templateData = {
           user: this.user,
            data: this.data
        }

        //console.log(templateData)

        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,templateData)

        // 2) Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: htmlToText.fromString(html)
            //html:
        };

        // 3) create transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
       await this.send("welcome", 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid only for 10 minutes)'
        )
    }
};
