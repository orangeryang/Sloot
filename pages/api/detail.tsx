import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title> My SLoot </title>
          <meta property="og:title" content="Synthetic Loot">
          <meta property="og:image" content="https://sloot-five.vercel.app/1.png">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="https://sloot-five.vercel.app/2.png">
          <meta name="fc:frame:post_url" content="https://sloot-five.vercel.app/api/link">
          <meta name="fc:frame:button:1" content="Loot Foundation">
          <meta name="fc:frame:button:1:action" content="post_redirect">
<!--          <meta name="fc:frame:button:1:url" content="https://loot.foundation/" />-->
          <meta name="fc:frame:button:2" content="Loot Discord">
          <meta name="fc:frame:button:2:action" content="post_redirect">
<!--          <meta name="fc:frame:button:2:url" content="https://loot.foundation/" />-->
          <meta name="fc:frame:button:3" content="Buy Loot">
          <meta name="fc:frame:button:3:action" content="post_redirect">
<!--          <meta name="fc:frame:button:3:url" content="https://loot.foundation/" />-->
          <meta name="fc:frame:button:4" content="Play Loot Survivor">
          <meta name="fc:frame:button:4:action" content="post_redirect">
<!--          <meta name="fc:frame:button:4:url" content="https://loot.foundation/" />-->
        </head>
      </html>
    `);
    
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
}

