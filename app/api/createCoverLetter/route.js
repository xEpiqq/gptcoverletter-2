const { Configuration, OpenAIApi } = require("openai");

// Create a new configuration object with your API key\
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
  baseUrl: "https://api.openai.com/v1/chat/completions/",
});
const openai = new OpenAIApi(configuration);

import db from '../../../utils/db';

export async function POST(request) {

  const body = await request.json();
  const {
    jobTitle,
    jobCompany,
    jobLocation,
    jobDescription,
    additionalInstructions,
    resumePdf,
    creativityMeter,
    user_id,
  } = body;

  // check if the user has the correct permissions on firebase
  // if not, return an error
  const userRef = db.collection("Users").doc(user_id);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return new Response(JSON.stringify({ error: "User doesn't exist" }));
  }

  if (userDoc.data().sub == "none") {
    return new Response( JSON.stringify({ error: "User does not have a subscription" }));
  }

  try {
    const model = "gpt-3.5-turbo";

    const prompt = 'You will create a cover letter for a job at ' + jobCompany + ' as a ' + jobTitle + '. The job is located in ' + jobLocation + '. The job description is: ' + jobDescription + '. Additional instructions are: ' + additionalInstructions + '. Your resume is attached. the resume is ' + resumePdf + '.';

    const completion = openai.createChatCompletion({
      model: model,
      messages: [{ role: "system", content: prompt }],
      temperature: creativityMeter / 50,
    });

    if (completion.data.choices[0].text == "undefined") {
      return new Response(JSON.stringify({ data: "undefined" }));
    }
    return new Response(
      JSON.stringify({ data: completion.data.choices[0].message.content })
    );
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}
