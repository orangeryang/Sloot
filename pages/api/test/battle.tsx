import type { NextApiRequest, NextApiResponse } from 'next';
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { getAddress, JsonRpcProvider } from "ethers";
import {} from "@prisma/client";
import { User, UserResponse } from "@neynar/nodejs-sdk/build/neynar-api/v1";
import { fetchQuery } from "@airstack/airstack-react";

// @ts-ignore
init(process.env.QUERY_KEY);
// @ts-ignore
const nClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'POST') {
        
        let user;
        let opponent = "";
        // console.log("req detail:", req.body);
        try {
            const result = await nClient.validateFrameAction(req.body?.trustedData?.messageBytes.toString(), {});
            console.log("validate result:", result);
            if (result && result.valid) {
                user = result.action?.interactor;
                opponent = result.action?.input?.text || "";
            }
        } catch (e) {
            return res.status(400).send(`Failed to validate message: ${ e }`);
        }
        console.log("request info:", user);
        console.log("request opponent:", opponent);
        
        let opponentAddress = "";
        
        try {
            
            let opponentFid = 0;
            if (opponent) {
                const opponentResponse: UserResponse = await nClient.lookupUserByUsername(opponent);
                opponentFid = opponentResponse.result.user.fid;
            } else {
                // todo find the guy he/she didn't beat
                // @ts-ignore
                opponentFid = user.fid;
            }
            opponentAddress = await getAddressByFid(opponentFid);
            
        } catch (e) {
            console.warn("Failed to lookup opponent:", opponent);
            console.warn("Error:", e);
        }
        
        if (!opponentAddress) {
            console.warn("Failed to lookup opponent address:", opponentAddress);
            return res.status(400).send("Failed to find opponent");
        }
        
        const contentUrl = `${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/battleImage?address=${ opponentAddress }`;
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title> My SLoot </title>
              <meta property="og:title" content="Synthetic Loot">
              <meta property="og:image" content="${ process.env['HOST'] }/1.png">
              <meta name="fc:frame" content="vNext">
              <meta name="fc:frame:image" content="${ contentUrl }">
              <meta name="fc:frame:post_url" content="${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/link">
              <meta name="fc:frame:button:1" content="Loot Foundation">
              <meta name="fc:frame:button:1:action" content="post_redirect">
              <meta name="fc:frame:button:2" content="Loot Discord">
              <meta name="fc:frame:button:2:action" content="post_redirect">
              <meta name="fc:frame:button:3" content="Buy Loot">
              <meta name="fc:frame:button:3:action" content="post_redirect">
              <meta name="fc:frame:button:4" content="Play Loot Survivor">
              <meta name="fc:frame:button:4:action" content="post_redirect">
            </head>
          </html>
        `);
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
}

async function getAddressByFid(opponentFid: number) {
    // user address
    const {data, error} = await fetchQuery("query MyQuery {\n" +
        "  Socials(\n" +
        "    input: {filter: {dappName: {_eq: farcaster}, identity: {_eq: \"fc_fid:" +
        opponentFid.toString(10) +
        "\"}}, blockchain: ethereum}\n" +
        "  ) {\n" +
        "    Social {\n" +
        "      id\n" +
        "      chainId\n" +
        "      blockchain\n" +
        "      dappName\n" +
        "      dappSlug\n" +
        "      dappVersion\n" +
        "      userId\n" +
        "      userAddress\n" +
        "      userCreatedAtBlockTimestamp\n" +
        "      userCreatedAtBlockNumber\n" +
        "      userLastUpdatedAtBlockTimestamp\n" +
        "      userLastUpdatedAtBlockNumber\n" +
        "      userHomeURL\n" +
        "      userRecoveryAddress\n" +
        "      userAssociatedAddresses\n" +
        "      profileName\n" +
        "      profileTokenId\n" +
        "      profileTokenAddress\n" +
        "      profileCreatedAtBlockTimestamp\n" +
        "      profileCreatedAtBlockNumber\n" +
        "      profileLastUpdatedAtBlockTimestamp\n" +
        "      profileLastUpdatedAtBlockNumber\n" +
        "      profileTokenUri\n" +
        "      isDefault\n" +
        "      identity\n" +
        "    }\n" +
        "  }\n" +
        "}");
    
    // console.log("fetch data:", data, error);
    if (!data) {
        return "";
    }
    const Social = data.Socials.Social;
    // console.log("Social:", Social);
    let addArrToRemove: string[] = [];
    for (let i = 0; i < Social.length; i++) {
        // console.log(Social[i].userAddress);
        addArrToRemove.push(Social[i].userAddress);
    }
    const address = Social[0].userAssociatedAddresses.filter((add: string) => !addArrToRemove.includes(add));
    if (address.length === 0) {
        address[0] = Social[0].userAddress;
    }
    
    console.log("address:", address);
    return address[0];
}
