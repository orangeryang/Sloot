import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    let buttonText = "Reveal your sLoot";
    let imageUrl = `${ process.env['HOST'] }/1.png`;
    let inputText = "Enter address or reveal straightly...";
    
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
          <meta name="fc:frame:post_url" content="${ process.env['HOST'] }/api/detail">
          <meta name="fc:frame:button:1" content="${ buttonText }">
          <meta name="fc:frame:input:text" content="${ inputText }">
        </head>
        <body>
             <h1> My Synthetic Loot </h1>
             <div style={imageUrl} >
             </div>
        </body>
      </html>
    `);
    
}
