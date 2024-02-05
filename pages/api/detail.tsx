import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchQuery, init } from "@airstack/airstack-react";
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { hasCustomExportOutput } from "next/dist/export/utils";

const HUB_URL = "nemes.farcaster.xyz:2283";
const client = getSSLHubRpcClient(HUB_URL);

// @ts-ignore
init(process.env.QUERY_KEY);
// @ts-ignore
const nClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
const url = "https://warpcast.com/gink/0x89a753d0";
const ginkFid = 81621;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        
        let address: string[] = [""];
        try {
            
            let validatedMessage: Message | undefined = undefined;
            // console.log("req:", req);
            try {
                const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
                const result = await client.validateMessage(frameMessage);
                // console.log("result:", result);
                if (result.isOk() && result.value.valid) {
                    validatedMessage = result.value.message;
                }
            } catch (e) {
                return res.status(400).send(`Failed to validate message: ${ e }`);
            }
            
            // const buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
            const fid = validatedMessage?.data?.fid || 0;
            // console.log("validatedMessage:" + validatedMessage?.data);
            // if (buttonId != 1) {
            //     res.status(500).send("Invalid button");
            // }
            console.log("fid:", fid);
            
            // cast data
            let hasAccess = false;
            const cast = await nClient.lookUpCastByHashOrWarpcastUrl(url, CastParamType.Url);
            // console.log(cast);
            const likes = cast.cast.reactions.likes;
            // console.log("likes:", likes);
            for (const like of likes) {
                if (like.fid === fid) {
                    hasAccess = true;
                    break;
                }
            }
            console.log("fid[" + fid + "]", hasAccess ? " has liked" : " doesn't have liked");
            
            if (hasAccess) {
                hasAccess = false;
                const recasts = cast.cast.reactions.recasts;
                // console.log("recasts:", recasts);
                for (const recast of recasts) {
                    if (recast.fid === fid) {
                        hasAccess = true;
                        break;
                    }
                }
                console.log("fid[" + fid + "]", hasAccess ? " has recast" : " doesn't have recast");
            }
            
            if (hasAccess) {
                hasAccess = false;
                const followers = await nClient.fetchUserFollowers(ginkFid);
                // console.log("followers:", followers.result.users);
                for (const follower of followers.result.users) {
                    if (follower.fid === fid) {
                        hasAccess = true;
                        break;
                    }
                }
                console.log("fid[" + fid + "]", hasAccess ? " has followed" : " doesn't have followed");
            }
            
            if (!hasAccess) {
                const buttonText = "Something went wrong ... try again \👝";
                const imageUrl = `https://lootframe.xyz/2.png`;
                
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
            
            // user address
            const {data, error} = await fetchQuery("query MyQuery {\n" +
                "  Socials(\n" +
                "    input: {filter: {dappName: {_eq: farcaster}, identity: {_eq: \"fc_fid:" +
                fid.toString(10) +
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
            
            console.log("fetch data:", data, error);
            if (!data) {
                res.status(500).send("Invalid Fid");
            }
            const Social = data.Socials.Social;
            // console.log("Social:", Social);
            let addArrToRemove: string[] = [];
            for (let i = 0; i < Social.length; i++) {
                // console.log(Social[i].userAddress);
                addArrToRemove.push(Social[i].userAddress);
            }
            address = Social[0].userAssociatedAddresses.filter((add: string) => !addArrToRemove.includes(add));
            if (address.length === 0) {
                address[0] = Social[0].userAddress;
            }
            console.log("address:", address);
        } catch (e) {
            return res.status(400).send(`Failed to validate message: ${ e }`);
        }
        
        const contentUrl = address[0] == "" ? "https://lootframe.xyz/3.png" : `https://lootframe.xyz/api/sloot?address=${ address[0] }`;
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title> My SLoot </title>
              <meta property="og:title" content="Synthetic Loot">
              <meta property="og:image" content="https://lootframe.xyz/1.png">
              <meta name="fc:frame" content="vNext">
    <!--          <meta name="fc:frame:image" content="https://lootframe.xyz/api/sloot">-->
              <meta name="fc:frame:image" content="${ contentUrl }">
              <meta name="fc:frame:post_url" content="https://lootframe.xyz/api/link">
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

