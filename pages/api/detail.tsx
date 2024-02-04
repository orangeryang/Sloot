import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchQuery, init } from "@airstack/airstack-react";
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";

const HUB_URL = "nemes.farcaster.xyz:2283";
const client = getSSLHubRpcClient(HUB_URL);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        init("117baaa0c425643f699cd5324983903fa");
        let address: string[] = [""];
        // try {
        //     let validatedMessage: Message | undefined = undefined;
        //     // console.log("req:", req);
        //     try {
        //         const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
        //         const result = await client.validateMessage(frameMessage);
        //         console.log("result:", result);
        //         if (result.isOk() && result.value.valid) {
        //             validatedMessage = result.value.message;
        //         }
        //     } catch (e) {
        //         return res.status(400).send(`Failed to validate message: ${e}`);
        //     }
        //
        //     const buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
        //     const fid = validatedMessage?.data?.fid || 0;
        //     // console.log("validatedMessage:" + validatedMessage?.data);
        //     if (buttonId != 1) {
        //         res.status(500).send("Invalid button");
        //     }
        //     console.log("fid:", fid);
        //     const {data, error} = await fetchQuery("query MyQuery {\n" +
        //         "  Socials(\n" +
        //         "    input: {filter: {dappName: {_eq: farcaster}, identity: {_eq: \"fc_fid:" +
        //         fid.toString(10) +
        //         "\"}}, blockchain: ethereum}\n" +
        //         "  ) {\n" +
        //         "    Social {\n" +
        //         "      id\n" +
        //         "      chainId\n" +
        //         "      blockchain\n" +
        //         "      dappName\n" +
        //         "      dappSlug\n" +
        //         "      dappVersion\n" +
        //         "      userId\n" +
        //         "      userAddress\n" +
        //         "      userCreatedAtBlockTimestamp\n" +
        //         "      userCreatedAtBlockNumber\n" +
        //         "      userLastUpdatedAtBlockTimestamp\n" +
        //         "      userLastUpdatedAtBlockNumber\n" +
        //         "      userHomeURL\n" +
        //         "      userRecoveryAddress\n" +
        //         "      userAssociatedAddresses\n" +
        //         "      profileName\n" +
        //         "      profileTokenId\n" +
        //         "      profileTokenAddress\n" +
        //         "      profileCreatedAtBlockTimestamp\n" +
        //         "      profileCreatedAtBlockNumber\n" +
        //         "      profileLastUpdatedAtBlockTimestamp\n" +
        //         "      profileLastUpdatedAtBlockNumber\n" +
        //         "      profileTokenUri\n" +
        //         "      isDefault\n" +
        //         "      identity\n" +
        //         "    }\n" +
        //         "  }\n" +
        //         "}");
        //
        //     console.log("fetch data:", data, error);
        //     if (!data) {
        //         res.status(500).send("Invalid Fid");
        //     }
        //     const Social = data.Socials.Social;
        //     // console.log("Social:", Social);
        //     let addArrToRemove: string[] = [];
        //     for (let i = 0; i < Social.length; i++) {
        //         // console.log(Social[i].userAddress);
        //         addArrToRemove.push(Social[i].userAddress);
        //     }
        //     address = Social[0].userAssociatedAddresses.filter((add: string) => !addArrToRemove.includes(add));
        //     if (address.length === 0) {
        //         res.status(500).send("No address");
        //     }
        //     console.log("address:", address);
        // } catch (e) {
        //     return res.status(400).send(`Failed to validate message: ${e}`);
        // }

        const contentUrl = address[0] == "" ? "https://lootframe.xyz/3.png" : `https://lootframe.xyz/api/sloot?address=${address[0]}`;

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
          <meta name="fc:frame:image" content="${contentUrl}">
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
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

