export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method==='OPTIONS'){res.status(200).end();return;}
  
  let body;
  try{
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }catch(e){
    return res.status(400).json({error:'Invalid JSON'});
  }
  
  const question = body?.question;
  if(!question) return res.status(400).json({error:'No question provided'});
  
  try{
    const r = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version':'2023-06-01'
      },
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:800,
        system:'You are a defense contract intelligence analyst for DefSpend.com. Audience: financial analysts, defense investors, lobbyists, think tanks. Be concise, precise, data-driven. 3-5 sentences. Respond in the same language as the question.',
        messages:[{role:'user', content:question}]
      })
    });
    const d = await r.json();
    if(d.content && d.content[0]){
      res.status(200).json({answer: d.content[0].text});
    } else {
      res.status(500).json({error: JSON.stringify(d)});
    }
  }catch(e){
    res.status(500).json({error: e.message});
  }
}
