import AfricasTalkingSMS from "../lib/africastalking.js"



export default async function SendSMS(phone, message){
    const options = {
        to:phone,
        message: message,
    }
    try{
        const resp = await AfricasTalkingSMS.send(options);
        console.dir(resp.SMSMessageData.Recipients)
        return true;
    
    } catch (err){
        console.log(err);
        return false;
    }
}