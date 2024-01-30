import type { NextApiRequest, NextApiResponse } from 'next';
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import sharp from 'sharp';
import satori from "satori";

const HUB_URL = process.env['HUB_URL'] || "";
const client = getSSLHubRpcClient(HUB_URL);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        
        try {
            
            let validatedMessage: Message | undefined = undefined;
            try {
                const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
                const result = await client.validateMessage(frameMessage);
                if (result.isOk() && result.value.valid) {
                    validatedMessage = result.value.message;
                }
            } catch (e) {
                return res.status(400).send(`Failed to validate message: ${ e }`);
            }
            
            const buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
            const fid = validatedMessage?.data?.fid || 0;
            
            if (buttonId == 1) {
                //
            }
            
            const svg = await satori(<div></div>, {width: 600, height: 400, fonts: []});
            
            const pngBuffer = await sharp(Buffer.from(svg))
                .toFormat('png')
                .toBuffer();
            
            // Set the content type to PNG and send the response
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'max-age=10');
            res.send(pngBuffer);
            
        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating image');
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
}
