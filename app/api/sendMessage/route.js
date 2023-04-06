const nodemailer = require("nodemailer");

export async function POST(request) {
  const body = await request.json();
  const { email, name } = body;

  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: "scavengerai@gmail.com",
      pass: process.env.SCAVENGER_GMAIL_PASSWORD,
    },
    secure: true,
  });

  await new Promise((resolve, reject) => {
    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });

  let mailData = await {
    from: "scavengerai@gmail.com",
    to: "scavengerai@gmail.com, jaydencrowther@gmail.com, wing.b.david@gmail.com",
    subject: `Contact Form For ${name}`,
    text: `
        𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗙𝗢𝗥𝗠 𝗙𝗢𝗥 ${name}
        𝗘𝗺𝗮𝗶𝗹: ${email}
        𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${name}
        `,
  };

  await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });

  return new Response(JSON.stringify({ success: true }));
}
