import type { NextApiRequest, NextApiResponse } from 'next';

const imageUrl = "/1.png";
const buttonText = "My Loot";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Recorded</title>
          <meta property="og:title" content="Synthetic Loot">
          <meta property="og:image" content="${ imageUrl }">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${ imageUrl }">
          <meta name="fc:frame:post_url" content="">
          <meta name="fc:frame:button:1" content="${ buttonText }">¬
        </head>
        <body>
             <h1> My Loot </h1>
             <div style={} >
             <Image src="${ imageUrl }" alt="" height={200} width={200*1.91} scale={20%}/>
             </div>
        </body>
      </html>
    `);
    
}
