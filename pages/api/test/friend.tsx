import type { NextApiRequest, NextApiResponse } from 'next';
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { battlePage, findFriend, getAddressByFid } from "@/pages/api/test/battle";
import { fetchQuery, init } from "@airstack/airstack-react";

// @ts-ignore
init(process.env.QUERY_KEY);
// @ts-ignore
const nClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === "POST") {
        
        // validate the request and get the user's information
        
        let user;
        let buttonId;
        
        try {
            const result = await nClient.validateFrameAction(req.body?.trustedData?.messageBytes.toString(), {});
            // console.log("validate result:", result);
            if (result && result.valid) {
                user = result.action?.interactor;
                // @ts-ignore
                buttonId = result.action?.tapped_button.index;
            }
        } catch (e) {
            console.warn("Failed to validate:", e);
            return res.status(400).send(`Failed to validate message: ${ e }`);
        }
        console.log("request info:", user);
        
        // @ts-ignore
        const {fr1, fr2, fr3, frna1, frna2, frna3} = await findFriend(user.fid);
        
        let friendFid;
        let friendName;
        
        if (buttonId === 1) {
            friendFid = fr1;
            friendName = frna1;
        } else if (buttonId === 2) {
            friendFid = fr2;
            friendName = frna2;
        } else if (buttonId === 3) {
            friendFid = fr3;
            friendName = frna3;
        }
        
        const id = req.query["id"] || "";
        console.log("friend request:", id, friendFid, friendName);
        
        const address = friendFid ? await getAddressByFid(friendFid) : "";
        const imageUrl =
            `${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/battleImage?id=${ id }&address=${ address }`;
        
        let contentUrl =
            `${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/battle?id=${ id }&frid=${ friendFid }&frna=${ friendName }`;
        if (buttonId === 4) {
            contentUrl =
                `${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/battle?id=${ id }`;
        }
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(battlePage(id, imageUrl, contentUrl));
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
    
}
