export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if(req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if(req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  const question = req.body?.question;
  
  if(!question) {
    return res.status(400).json({error: 'No question', received: req.body});
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: 'You are a defense contract intelligence analyst for DefSpend.com. Audience: financial analysts, defense investors, lobbyists, think tanks. Be concise, precise, data-driven. 3-5 sentences. Respond in the same language as the question.',
        messages: [{role: 'user', content: question}]
      })
    });

    const data = await response.json();
    
    if(data.content && data.content[0]) {
      return res.status(200).json({answer: data.content[0].text});
    } else {
      return res.status(500).json({error: 'No content', debug: data});
    }
  } catch(e) {
    return res.status(500).json({error: e.message});
  }
}
