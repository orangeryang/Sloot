import type { NextApiRequest, NextApiResponse } from 'next';
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import map from "../../public/map.json";

const HUB_URL = "nemes.farcaster.xyz:2283";
const client = getSSLHubRpcClient(HUB_URL);
const IMG_DIR = `ipfs://${ map.ipfs.character_imgs }`;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        
        let validatedMessage: Message | undefined = undefined;
        try {
            const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
            const result = await client?.validateMessage(frameMessage);
            if (result && result.isOk() && result.value.valid) {
                validatedMessage = result.value.message;
            }
            
            // Also validate the frame url matches the expected url
            let urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
            const urlString = Buffer.from(urlBuffer).toString('utf-8');
            if (validatedMessage && !urlString.startsWith(process.env['HOST'] || '')) {
                return res.status(400).send(`Invalid frame url: ${ urlBuffer }`);
            }
        } catch (e) {
            return res.status(400).send(`Failed to validate message: ${ e }`);
        }
        
        let buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
        let fid = validatedMessage?.data?.fid || 0;
        
        if (buttonId === 1) {
            return res.status(302).setHeader('Location', `https://loot.foundation/`).send('Redirecting to loot foundation');
        } else if (buttonId === 2) {
            return res.status(302).setHeader('Location', `https://loot.foundation/`).send('Redirecting to loot foundation');
        } else if (buttonId === 3) {
            return res.status(302).setHeader('Location', `https://loot.foundation/`).send('Redirecting to loot foundation');
        } else if (buttonId === 4) {
            return res.status(302).setHeader('Location', `https://loot.foundation/`).send('Redirecting to loot foundation');
        }
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
}

