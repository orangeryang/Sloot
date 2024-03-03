import type { NextApiRequest, NextApiResponse } from 'next';
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { PrismaClient } from "@prisma/client";
import { User, UserResponse } from "@neynar/nodejs-sdk/build/neynar-api/v1";
import { fetchQuery } from "@airstack/airstack-react";

// @ts-ignore
init(process.env.QUERY_KEY);
// @ts-ignore
const nClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // no cache in the first version here
    // I think it has to be done in the next version

    if (req.method === 'POST') {


        // validate the request and get the user's information

        let user;
        let buttonId;
        let opponentByInput = "";
        // console.log("req detail:", req.body);
        try {
            const result = await nClient.validateFrameAction(req.body?.trustedData?.messageBytes.toString(), {});
            console.log("validate result:", result);
            if (result && result.valid) {
                user = result.action?.interactor;
                buttonId = result.action?.button.index;
                opponentByInput = result.action?.input?.text || "";
            }
        } catch (e) {
            return res.status(400).send(`Failed to validate message: ${e}`);
        }
        console.log("request info:", user);
        console.log("request opponent:", opponentByInput);


        // jump to the page
        if (buttonId === 3) {

            console.log("Redirecting to gink");
            return res.status(302).setHeader('Location', 'https://warpcast.com/gink/0x67c737a3').send('Redirecting to query');

        }
        // battle action here
        else if (buttonId === 1) {

            let leftAddress = "";
            let rightAddress = "";

            const id = req.query["id"] || "";
            if (id) {

                // continue

                const prisma = new PrismaClient();

                const battle = await prisma.battle.findUnique({
                    where: {
                        id: Number.parseInt(id.toString()),
                    }
                })
                console.log("find battle:", battle);

                if (!battle) {
                    console.warn("generate image: battle not found:", id);
                    return res.status(400).send(`Failed to continue: battle not found`);
                }

                const battleDetails = await prisma.battleDetail.findMany({
                    where: {
                        battleId: Number.parseInt(id.toString()),
                    }
                })
                console.log("find battleDetails:", battleDetails);

                await prisma.$disconnect();


                const friend = req.query["fr"] || "";
                if (friend) {

                    // looking for friends' help
                    let friendAddress;
                    try {
                        friendAddress = await getAddressByFid(Number.parseInt(friend.toString()));
                        leftAddress = friendAddress;
                    } catch (e) {
                        console.warn("Failed to lookup friend address:", friend);
                    }

                }

                // continue the battle
                leftAddress = await getAddressByFid(user?.fid || 0);


            } else {

                // find the opponent to start the battle

                // 1. find the opponent
                //   - valid input or not
                //   - random opponent
                // 2. render the battle page

                try {

                    let opponentFid = 0;
                    if (opponentByInput) {
                        const opponentResponse: UserResponse = await nClient.lookupUserByUsername(opponentByInput);
                        opponentFid = opponentResponse.result.user.fid;
                    } else {
                        // @ts-ignore
                        opponentFid = user.fid;
                        // todo find the guy he/she didn't beat
                    }
                    leftAddress = await getAddressByFid(user?.fid || 0);
                    rightAddress = await getAddressByFid(opponentFid);

                } catch (e) {
                    console.warn("Failed to lookup opponent:", opponentByInput);
                    console.warn("Error:", e);
                }

                if (!rightAddress) {
                    console.warn("Failed to lookup opponent address:", rightAddress);
                    return res.status(400).send("Failed to find opponent");
                }


            }

            // if (end) {
            //
            // } else {
            //
            // }
            const imageUrl =
                `${process.env['HOST']}/api/${process.env['APIPATH']}/battleImage?id=${id}&&address=${leftAddress}`;

            const contentUrl =
                `${process.env['HOST']}/api/${process.env['APIPATH']}/battle?id=${id}&address1=${leftAddress}&address2=${rightAddress}`;

            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title> My SLoot </title>
                  <meta property="og:title" content="Synthetic Loot">
                  <meta property="og:image" content="${process.env['HOST']}/1.png">
                  <meta name="fc:frame" content="vNext">
                  <meta name="fc:frame:image" content="${imageUrl}">
                  <meta name="fc:frame:post_url" content="${contentUrl}">
                  <meta name="fc:frame:button:1" content="Attack">
                  <meta name="fc:frame:button:2" content="Friends">
                  <meta name="fc:frame:button:3" content="Query Loot">
                  <meta name="fc:frame:button:3:action" content="post_redirect">
                  <meta name="fc:frame:button:4" content="Escape">
                </head>
              </html>
            `);


        }
        // friends here
        else if (buttonId === 2) {

            // todo show the friends

        }
        // escape
        else if (buttonId === 4) {

            // todo escape from battle

        }


    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
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
