exports.handler = async (event) => {
  if(event.httpMethod==='OPTIONS'){
    return{statusCode:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'},body:''};
  }
  try{
    const{question}=JSON.parse(event.body);
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key':process.env.ANTHROPIC_API_KEY,
        'anthropic-version':'2023-06-01'
      },
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:800,
        system:'You are a defense contract intelligence analyst for DefSpend.com. Audience: financial analysts, defense investors, lobbyists, think tanks. Be concise, precise, data-driven. 3-5 sentences max. Respond in the same language as the question.',
        messages:[{role:'user',content:question}]
      })
    });
    const d=await r.json();
    return{
      statusCode:200,
      headers:{'Access-Control-Allow-Origin':'*'},
      body:JSON.stringify({answer:d.content[0].text})
    };
  }catch(e){
    return{
      statusCode:500,
      headers:{'Access-Control-Allow-Origin':'*'},
      body:JSON.stringify({error:e.message})
    };
  }
};
