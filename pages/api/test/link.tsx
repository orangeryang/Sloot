import type { NextApiRequest, NextApiResponse } from 'next';
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";

const HUB_URL = "nemes.farcaster.xyz:2283";
const client = getSSLHubRpcClient(HUB_URL);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        
        const buttonId = req.body?.untrustedData?.buttonIndex || 0;
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
        
    } else if (req.method === "GET" && req.query["txt"] === "666") {
        
        res.redirect("../../../queriedAddresses.txt");
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
    
}

// export const dynamic = 'force-dynamic';
