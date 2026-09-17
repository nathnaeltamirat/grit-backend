import { InputJsonValue } from '@prisma/client/runtime/client';
import Groq from 'groq-sdk';

export interface AIInput {
  data: {
    title: string;
    description: string;
  }[];
  customPrompt?: string;
  modelName: 'openai/gpt-oss-120b' | 'qwen/qwen3.8-27b' | 'openai/gpt-oss-20b';
}
interface ToolingMatrix {
  headers: string[];
  data: string[][];
  [key: string]: InputJsonValue;
}

export default async function AIResponse(aiInput: AIInput, apiKey: string) {
  const randNumber = Math.floor(Math.random() * 2000);
  const ai = new Groq({ apiKey });
  const GeneralInstraction = `
        Project Context:
        Most inefficiency doesn't come from one big problem. It comes from small annoyances you never write down and forget about by tomorrow.
        Doesn't matter if you're running a business or just exploring  when you spot a real gap in a real business,
        Gemeni this is your general part:
        Grit researches real-world alternatives and scores the idea before you spend a single hour building.
        but you are not going to give me all in one there will be interaction process the above is only general guidline.
    `;
  const systemInstruction = `
    Your are AI Assitnat with general instruction: 
    ${GeneralInstraction}

    User Prompt are given as an input Follow user preferences only when they don't conflict with
the other rules only and I will give you you the detail role for each interaction
 
  `;

  const summarizer = `Your task is to perform an initial research assessment of a project idea.

        You will be given:

        Multiple Project title
        Mulitple Project description

        Analyze whether the problem described already has existing solutions, products,
        services, workflows, or common alternatives that address the same or a similar need.

        Focus on:

        What problem the project is trying to solve.
        Whether existing solutions appear to address this problem.
        The main alternatives or approaches that already exist.
        How those alternatives differ from the proposed idea.
        Any obvious gaps, weaknesses, or unmet needs in existing solutions.
        Whether the idea appears to require a new solution or could potentially improve
        an existing one.

        Return a concise high live research summary of approximately 5–10 lines.
        Do not make a final decision about whether the user should build the project.
        This is only the initial research stage. Clearly distinguish between known facts
        and reasonable assumptions when information is uncertain.
        Make it at most 2 paragraph of at most 10 lines in total don't over print and don't give table or anything just
        normal text
        strictly in json format like{"summary": "summary description"}

    `;
  const title = `Now you have the summarized res above I want you to give me a title at most 3 words make it accurate and related to the summarized res`;
  const painPoints = `You have the previous chat history.
    if you are unclear with producing json or text stick with json
   Go through the chat and don't do  research since the previous request did enough research. I want you to give me 3 repeated PAIN points only, where each pain point has a length of at most 20-30 characters.
   Don't output anything else, you must responde strictily in JSON fromat as an array of string like this:{"painPoints": ["focus area","focus area2"]}`;
  const resoultionPlan = `You have the previous chat history.
    if you are unclear with producing json or text stick with json
   Go through the chat and do minor research since the previous request did enough research. I want you to give me [1 - [5-7]] resolution plan ,
    where resolution plans are numbered from [1 - [5-7]]
   Don't output anything else, you must responde strictily in JSON fromat as an array of string like this: {"resolutionPlan": ["focus area","focus area2"]}`;
  const projectScore = `You have the previous chat history.
    if you are unclear with producing json or text stick with json
   Go through all the context since the previous request did enough research. I want you to give me
   a project score from 0 - 100. A weighted feasibility analysis on whether to build a custom tool or
   project by correlating recurring friction patterns against existing solution gaps.
   Don't output anything else, only the  number from 0 - 100 strictly in json format like{"score": 40}`;
  const suggestedFocusArea = `You have the previous chat history.
    if you are unclear with producing json or text stick with json
   Go through the chat and don't do research since the previous request did enough research. I want you to give me 1-3 suggested focus area, where each  has a length of at most 10–20 characters.
   Don't output anything else, you must responde strictily in JSON fromat as an array of string like this: {"suggestedFocusArea": ["focus area","focus area2"]} `;
  const toolingAssessment = `You have the previous chat history.
   Go through the chat and don't do research since the previous request did enough research.
    I want you to give me table but since I am using it for my frontend I want you to give me in the json format with this output guidline
    1. The heading  are Alternative Platform, Key Features, Missing Capabilites,  The "GAP".
   {"toolingAssessment":{
    "headers":["Alternative Platform", "Key Features", "Missing Capabilites","The GAP"],
    "data":[
        ["Jenkins / CircleCI","Pipeline orchestration, wide plugin ecosystem", "No developer-sentiment correlation","Friction Awareness"],
        ["Datadog CI","Flaky test detection, performance traces","Focus on metrics, not manual logs","Qualitative Context"]
]
    }
}
    if you are unclear with producing json or text stick with json

   `;

  const baseMessage: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${systemInstruction}`,
    },
    { role: 'developer', content: `${summarizer}` },
    {
      role: 'user',
      content: `${aiInput.customPrompt} \nData: ${JSON.stringify(aiInput.data)}`,
    },
  ];

  const summarizedRes = await ai.chat.completions.create({
    model: aiInput.modelName,
    messages: baseMessage,
    response_format: { type: 'json_object' },
  });

  const rawSummary = summarizedRes.choices[0].message.content || '{}';
  const summaryOutput = JSON.parse(rawSummary);
  const titleMessage: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${systemInstruction}`,
    },
    { role: 'developer', content: `${summarizedRes}` },

    {
      role: 'user',
      content: `${aiInput.customPrompt} \nData: ${JSON.stringify(aiInput.data)}`,
    },
    {
      role: 'developer',
      content: title,
    },
  ];
  const titleRes = await ai.chat.completions.create({
    model: aiInput.modelName,
    messages: titleMessage,
  });
  const outputTitleRes = titleRes.choices[0].message.content;
  const chatHistory: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${systemInstruction}`,
    },
    {
      role: 'user',
      content: `${aiInput.customPrompt} \nData: ${JSON.stringify(aiInput.data)}`,
    },
    { role: 'assistant', content: rawSummary },
  ];
  async function queryStep<T>(prompt: string): Promise<T> {
    const res = await ai.chat.completions.create({
      model: aiInput.modelName,
      messages: [...chatHistory, { role: 'developer', content: prompt }],
      response_format: { type: 'json_object' },
    });
    const content = res.choices[0].message.content || '{}';
    return JSON.parse(content) as T;
  }

  const painPointsOutput = await queryStep<{ painPoints: string[] }>(
    painPoints,
  );
 
  const resoultionPlanOutput = await queryStep<{ resolutionPlan: string[] }>(
    resoultionPlan,
  );


  const projectScoreOutput = await queryStep<{ score: number }>(projectScore);

  const suggestedFocusAreaOutput = await queryStep<{
    suggestedFocusArea: string[];
  }>(suggestedFocusArea);
  const toolingAssessmentOutput = await queryStep<{
    toolingAssessment: ToolingMatrix;
  }>(toolingAssessment);

  const combinedOutput = {
    title: outputTitleRes ?? `Insight-${randNumber}`,
    summary: summaryOutput?.summary,
    painPoints: painPointsOutput.painPoints,
    resoultionPlan: resoultionPlanOutput.resolutionPlan,
    score: projectScoreOutput.score,
    suggestedFocusArea: suggestedFocusAreaOutput.suggestedFocusArea,
    toolingAssessment: toolingAssessmentOutput.toolingAssessment,
  };
  const validator = `You are the final validation step for an AI-generated project analysis.
   Your job is to validate the GENERATED PAYLOAD against: 1. The ORIGINAL USER DATA.
    2. The SUMMARY generated during the initial research stage.
     3. The requirements and constraints specified in the analysis prompts. 
     ORIGINAL USER DATA: ${JSON.stringify(aiInput.data)} 
     GENERATED PAYLOAD: ${JSON.stringify(combinedOutput)}
      Validate the payload using the following rules: 
      1. STRUCTURE - The payload must contain: title summary painPoints resoultionPlan score suggestedFocusArea toolingAssessment 
      2. TITLE - Must be a non-empty string. - Should be related to the generated summary. - Should be at most 3 words. - Must not introduce an unrelated topic.
       3. SUMMARY - Must describe the problem represented by the original user data. - Must be reasonably consistent with the original data. - Must not claim facts that are clearly contradicted by the original data. 
       4. PAIN POINTS - Must be an array of strings. - Must contain exactly 3 pain points. - Each pain point should represent a recurring problem or friction found in the original data. - Each pain point should be approximately 20–30 characters. - They must not be unrelated or invented problems.
        5. RESOLUTION PLAN - Must be an array of strings. - Must contain between 5 and 7 resolution steps. - The steps must address the identified pain points. - The steps should be practical and relevant to the original data. 
        6. SCORE - Must be a number from 0 to 100. - The score should represent the feasibility/opportunity of building a custom solution based on the recurring friction and existing solution gaps. - It must not be outside the range 0–100.
         7. SUGGESTED FOCUS AREAS - Must be an array of 1–3 strings. - Each focus area should be approximately 10–20 characters. - They must be relevant to the identified problem. 
         8. TOOLING ASSESSMENT - Must contain: headers data - headers must contain exactly these four concepts: "Alternative Platform" "Key Features" "Missing Capabilities" "The GAP" - data must be an array of rows. - Every row must contain exactly 4 values. - The alternatives must be relevant to the problem. - The assessment must not contradict the original data. 
         9. CONSISTENCY - All generated fields must describe the same underlying problem. - Pain points, resolution plans, focus areas, score, and tooling assessment must be consistent with the summary. - Do not approve content simply because it is valid JSON. - Reject the payload if the AI invented a substantially different problem from the original user data. 
         IMPORTANT: - Do not perform new external research. - Judge the generated analysis only against the supplied original data and the requirements above. - Minor wording differences are acceptable. - Return false if any important requirement is violated. Return ONLY valid JSON: {"validity": true} or {"validity": false} `;
  const validityOutput = await queryStep<{
    validity: boolean;
  }>(validator);
  if (validityOutput.validity) {
    return combinedOutput;
  } else {
    throw new Error('Try again with the correct data input');
  }
}
