const { Configuration, OpenAIApi } = require("openai");

// Create a new configuration object with your API key\
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
  baseUrl: "https://api.openai.com/v1/chat/completions/",
});
const openai = new OpenAIApi(configuration);

import db from "../../../utils/db";

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

  try {
    const model = "gpt-3.5-turbo";

    const prompt =
      "You will create a cover letter for a job at " +
      jobCompany +
      " as a " +
      jobTitle +
      ". The job is located in " +
      jobLocation +
      ". The job description is: " +
      jobDescription +
      ". Additional instructions are: " +
      additionalInstructions +
      ". Your resume is attached. the resume is " +
      resumePdf +
      ".";

    const completion = await openai.createChatCompletion({
      model: model,
      messages: [{ role: "system", content: prompt }],
      temperature: creativityMeter / 50,
      max_tokens: 150,
    });
    console.log(completion.data);

    if (completion.data.choices[0].text == "undefined") {
      return new Response(JSON.stringify({ data: "undefined" }));
    }
    return new Response(
      JSON.stringify({ data: completion.data.choices[0].message.content + "... Please subscribe to use the full version" })
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
