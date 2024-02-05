import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    let buttonText = "Reveal your sLoot👀";
    let imageUrl = `https://lootframe.xyz/1.png`;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title> My SLoot </title>
          <meta property="og:title" content="Synthetic Loot">
          <meta property="og:image" content="${ imageUrl }">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${ imageUrl }">
          <meta name="fc:frame:post_url" content="https://lootframe.xyz/api/detail">
          <meta name="fc:frame:button:1" content="${ buttonText }">
        </head>
        <body>
             <h1> My Synthetic Loot </h1>
             <div style={} >
             </div>
        </body>
      </html>
    `);
    
}
