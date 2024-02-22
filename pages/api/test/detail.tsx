import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchQuery, init } from "@airstack/airstack-react";
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { getAddress, JsonRpcProvider } from "ethers";
import { appendFile } from "fs";

// const HUB_URL = "nemes.farcaster.xyz:2283";
// const client = getSSLHubRpcClient(HUB_URL);

// @ts-ignore
init(process.env.QUERY_KEY);
// @ts-ignore
const nClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
const url = "https://warpcast.com/gink/0xf24048ef";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'POST') {
        
        let fid = 0;
        let inputAddr = "";
        // console.log("req detail:", req.body);
        try {
            const result = await nClient.validateFrameAction(req.body?.trustedData?.messageBytes.toString(), {});
            console.log("validate result:", result);
            if (result && result.valid) {
                fid = result.action?.interactor?.fid || 0;
                inputAddr = result.action?.input?.text || "";
            }
        } catch (e) {
            return res.status(400).send(`Failed to validate message: ${ e }`);
        }
        console.log("fid:", fid);
        console.log("inputAddr:", inputAddr);
        
        let address = [""];
        
        if (inputAddr) {
            
            try {
                
                if (inputAddr.endsWith("eth")) {
                    await new JsonRpcProvider("https://rpc.mevblocker.io")
                        .resolveName(inputAddr)
                        .then((addr) => {
                            if (addr) {
                                address = [addr];
                            }
                        });
                } else {
                    getAddress(inputAddr);
                    address = [inputAddr];
                }
                console.log("address:", address);
                
            } catch (e) {
                console.warn("Invalid address:", inputAddr);
                return res.status(400).send(`Failed to validate address: ${ e }`);
            }
            
        } else {
            
            try {
                
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
                
                // console.log("fetch data:", data, error);
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
        }
        
        if (!address[0]) {
            return res.status(400).send(`Invalid address: ${ address[0] }`);
        }
        
        appendFile(`./public/requestFids.txt`, fid.toString(10) + "\n", (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log("requestFids.txt updated, fid:", fid.toString(10));
            }
        })
        
        appendFile(`./public/queriedAddresses.txt`, address[0] + "\n", (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log("queriedAddresses.txt updated, address:", address[0]);
            }
        })
        
        const contentUrl = `${ process.env['HOST'] }/api/test/sloot?address=${ address[0] }`;
        
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
              <meta name="fc:frame:post_url" content="${ process.env['HOST'] }/api/test/link">
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

