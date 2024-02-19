import type { NextApiRequest, NextApiResponse } from 'next';
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";

const HUB_URL = "nemes.farcaster.xyz:2283";
const client = getSSLHubRpcClient(HUB_URL);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        // todo untrusted data is fine here
        let validatedMessage: Message | undefined = undefined;
        try {
            const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
            const result = await client?.validateMessage(frameMessage);
            if (result && result.isOk() && result.value.valid) {
                validatedMessage = result.value.message;
            }

            // Also validate the frame url matches the expected url
            // let urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
            // const urlString = Buffer.from(urlBuffer).toString('utf-8');
            // if (validatedMessage && !urlString.startsWith(process.env['HOST'] || '')) {
            //     return res.status(400).send(`Invalid frame url: ${urlBuffer}`);
            // }
        } catch (e) {
            return res.status(400).send(`Failed to validate message: ${e}`);
        }

        let buttonId = 0, fid = 0;
        // If HUB_URL is not provided, don't validate and fall back to untrusted data
        if (client) {
            buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
            fid = validatedMessage?.data?.fid || 0;
        } else {
            buttonId = req.body?.untrustedData?.buttonIndex || 0;
            fid = req.body?.untrustedData?.fid || 0;
        }
        console.log("buttonId:", buttonId);

        if (buttonId === 1) {
            console.log("Redirecting to loot foundation");
            return res.status(302).setHeader('Location', "https://loot.foundation").send('Redirecting to discord');
        } else if (buttonId === 2) {
            console.log("Redirecting to discord");
            return res.status(302).setHeader('Location', "https://discord.gg/njVSBtvBsc").send('Redirecting to discord');
        } else if (buttonId === 3) {
            console.log("Redirecting to open sea");
            return res.status(302).setHeader('Location', 'https://opensea.io/collection/lootproject').send('Redirecting to open sea');
        } else if (buttonId === 4) {
            console.log("Redirecting to play it");
            return res.status(302).setHeader('Location', `https://beta-survivor.realms.world`).send('Redirecting to play it');
        }

    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// export const dynamic = 'force-dynamic';
