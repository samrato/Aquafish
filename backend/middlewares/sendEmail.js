import nodemailer from "nodemailer";

const sendEmail = async (email, data, name, cord, abnormal) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🚨 Fish Cage Movement Alert 🚨",
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px; text-align: center;">
                <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #d9534f;">⚠️ Urgent Alert: Fish Cage Movement Detected! ⚠️</h2>
                    <hr style="border: none; height: 2px; background-color: #d9534f; margin: 15px 0;"/>
                    
                    <div style="padding: 15px; background: #fffae6; border-radius: 8px; border: 2px solid #ffcc00;">
                        <h3 style="color: #ff8800;">⛵ Automatic Relocation in Progress ⛵</h3>
                        <p><strong>Fish Cage Name:</strong> ${name}</p>
                        <p><strong>Current Location:</strong></p>
                        <ul style="list-style-type: none; padding: 0;">
                            <li>📍 <strong>Latitude:</strong> ${data.location.latitude}</li>
                            <li>📍 <strong>Longitude:</strong> ${data.location.longitude}</li>
                        </ul>
                        <p><strong>New Destination:</strong></p>
                        <ul style="list-style-type: none; padding: 0;">
                            <li>➡️ <strong>Latitude:</strong> ${cord.latitude}</li>
                            <li>➡️ <strong>Longitude:</strong> ${cord.longitude}</li>
                        </ul>
                    </div>

                    <div style="margin-top: 20px; background: #e8f5e9; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #388e3c;">🌊 Water Quality Data 🌊</h3>
                        <p><strong>🌡️ Temperature:</strong> ${data.temp}°C</p>
                        <p><strong>🧪 Nitrogen:</strong> ${data.nitrogen} mg/L</p>
                        <p><strong>🔬 Phosphorus:</strong> ${data.phosphorus} mg/L</p>
                        <p><strong>💨 Oxygen Levels:</strong> ${data.oxygen} mg/L</p>
                    </div>

                    <div style="margin-top: 20px; background: #ffe4e1; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #d32f2f;">🚨 Why is this happening? 🚨</h3>
                        <p style="font-size: 16px;"><strong>${abnormal}</strong></p>
                    </div>

                    <p style="margin-top: 20px; font-size: 18px; color: #ff8800;"><strong>🔄 Action:</strong> The cage is automatically relocating to a safer area.</p>
                    <p style="font-size: 16px; margin-top: 10px;">🚀 You will be alerted once the cage reaches its new location.</p>

                    <footer style="margin-top: 20px; font-size: 14px; color: #777;">
                        <p>&copy; 2025 Fish Cage Monitoring System | Stay Safe! 🌊</p>
                    </footer>
                </div>
            </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully: " + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export default sendEmail;
