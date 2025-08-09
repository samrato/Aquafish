import africastalking from "africastalking";

const cred = {
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
}
const AfricasTalkingSMS = africastalking(cred).SMS;


export default AfricasTalkingSMS;