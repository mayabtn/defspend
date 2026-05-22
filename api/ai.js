export const config = {
  api: { bodyParser: true }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});

  const question = req.body?.question;
  if(!question) return res.status(400).json({error:'No question'});

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if(!apiKey) return res.status(500).json({error:'No API key configured'});

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: 'You are a defense contract intelligence analyst for DefSpend.com. Answer this concisely in 3-5 sentences, in the same language as the question: ' + question
        }]
      })
    });

    const text = await r.text();
    console.log('Anthropic response:', text);
    
    const data = JSON.parse(text);
    if(data.content && data.content[0]) {
      return res.status(200).json({answer: data.content[0].text});
    }
    return res.status(500).json({error: 'Unexpected response', debug: data});
  } catch(e) {
    console.error('Error:', e.message);
    return res.status(500).json({error: e.message});
  }
}
