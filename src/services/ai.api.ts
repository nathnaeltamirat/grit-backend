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
}

export default async function AIResponse(aiInput: AIInput, apiKey: string) {
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
  const toolingAssesment = `You have the previous chat history.
   Go through the chat and don't do research since the previous request did enough research.
    I want you to give me table but since I am using it for my frontend I want you to give me in the json format with this output guidline
    1. The heading  are Alternative Platform, Key Features, Missing Capabilites,  The "GAP".
   {"toolingAssesment":{
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
    model:aiInput.modelName,
    messages: baseMessage,
    response_format: { type: 'json_object' },
  });

  const rawSummary = summarizedRes.choices[0].message.content || '{}';
  const summaryOutput = JSON.parse(rawSummary);
  console.log('Summarized: ', summaryOutput);
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
      model:aiInput.modelName,
      messages: [...chatHistory, { role: 'developer', content: prompt }],
      response_format: { type: 'json_object' },
    });
    const content = res.choices[0].message.content || '{}';
    return JSON.parse(content) as T;
  }

  const painPointsOutput = await queryStep<{ painPoints: string[] }>(
    painPoints,
  );
  console.log('Pain points: ', painPointsOutput);
  const resoultionPlanOutput = await queryStep<{ resolutionPlan: string[] }>(
    resoultionPlan,
  );
  console.log('Resolution Plan: ', resoultionPlanOutput);

  const projectScoreOutput = await queryStep<{ score: number }>(projectScore);
  console.log('Project score: ', projectScoreOutput);
  const suggestedFocusAreaOutput = await queryStep<{
    suggestedFocusArea: string[];
  }>(suggestedFocusArea);
  console.log('suggested Focus Area: ', suggestedFocusAreaOutput);
  const toolingAssesmentOutput = await queryStep<{
    toolingAssesment: ToolingMatrix;
  }>(toolingAssesment);
  console.log('Tooling Assesment:');
  console.dir(toolingAssesmentOutput, { depth: null });
  const combinedOutput = {
    summary: summaryOutput?.summary,
    painPoints: painPointsOutput.painPoints,
    resoultionPlan: resoultionPlanOutput.resolutionPlan,
    score: projectScoreOutput.score,
    suggestedFocusArea: suggestedFocusAreaOutput.suggestedFocusArea,
    toolingAssesment: toolingAssesmentOutput.toolingAssesment,
  };
  const validator = `.

    Review the original user data and entire generated analysis payload below  context
    and determine whether the analysis  is accurate , consistent with the user data, and structurally valid.

    Generated Payload
    ${JSON.stringify(combinedOutput)}

    Respond strictly in json format: {"validity": true}  or {"validity":false}`;
  const validityOutput = await queryStep<{
    validity: boolean;
  }>(validator);
  console.log('Validity: ', validityOutput);
  if (validityOutput.validity) {
    return combinedOutput;
  } else {
    throw new Error('Try again with the correct data input');
  }
}
